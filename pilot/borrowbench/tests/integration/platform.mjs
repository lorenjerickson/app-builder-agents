import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { setTimeout as delay } from 'node:timers/promises';
import { generateKeyPair, exportJWK, SignJWT } from 'jose';
import { createRequire } from 'node:module';
const webRequire = createRequire(new URL('../../apps/web/package.json', import.meta.url));
const { generateSessionCookie } = await import(webRequire.resolve('@auth0/nextjs-auth0/testing'));

assert(process.env.TEST_DATABASE_URL, 'Run through platform.mjs test --target verify');
const root = fileURLToPath(new URL('../../', import.meta.url));
const local = await mkdtemp(join(tmpdir(), 'borrowbench-integration-'));
const issuer = 'https://borrowbench-test.invalid/';
const audience = 'https://borrowbench.local/api';
const secret = 'cd'.repeat(32); // Synthetic test-only session key; never real configuration.
const keys = await generateKeyPair('RS256');
const jwk = { ...await exportJWK(keys.publicKey), kid:'integration', alg:'RS256', use:'sig' };
const jwks = createServer((_req, res) => { res.setHeader('content-type','application/json'); res.end(JSON.stringify({keys:[jwk]})); });
await new Promise(resolve => jwks.listen(0,'127.0.0.1',resolve));
const jwksUrl = `http://127.0.0.1:${jwks.address().port}/jwks`;
const map = join(local, 'accounts.json');
await writeFile(map, JSON.stringify({'auth0|member-a':{label:'Member A',role:'member'},'auth0|custodian':{label:'Custodian',role:'custodian'}}),{mode:0o600});
const children = [];
const launch = (args, cwd, env) => {
  const child = spawn(process.execPath,args,{cwd,stdio:'ignore',env:{PATH:process.env.PATH,...env}});
  children.push(child); return child;
};
async function ready(url, child) {
  for(let i=0;i<100;i++) {
    if(child.exitCode!==null) throw new Error('Integration process exited early');
    try {if((await fetch(url)).ok)return;} catch {}
    await delay(100);
  }
  throw new Error('Integration process readiness timeout');
}
async function stop(child) {
  if(child.exitCode!==null || child.signalCode!==null)return;
  const exited = new Promise(resolve=>child.once('exit',resolve)); child.kill('SIGTERM'); await exited;
}
async function cookie(subject) {
  const token = await new SignJWT({}).setProtectedHeader({alg:'RS256',kid:'integration'})
    .setIssuer(issuer).setAudience(audience).setSubject(subject).setIssuedAt().setExpirationTime('10m').sign(keys.privateKey);
  const encrypted = await generateSessionCookie({user:{sub:subject,name:'Synthetic member'},tokenSet:{accessToken:token,expiresAt:Math.floor(Date.now()/1000)+600,audience,scope:'openid profile email'}},{secret});
  return `borrowbench_verify_session=${encrypted}`;
}
try {
  const api=launch(['apps/api/dist/src/main.js'],root,{
    NODE_ENV:'test',API_PORT:'3297',API_HOST:'127.0.0.1',DATABASE_URL:process.env.TEST_DATABASE_URL,
    AUTH0_ISSUER:issuer,AUTH0_AUDIENCE:audience,TEST_JWKS_URL:jwksUrl,PILOT_ACCOUNT_MAP_FILE:map,
  });
  await ready('http://127.0.0.1:3297/health/ready',api);
  const web=launch(['node_modules/next/dist/bin/next','start','-H','127.0.0.1','-p','3298'],join(root,'apps/web'),{
    NODE_ENV:'production',NEXT_TELEMETRY_DISABLED:'1',APP_BASE_URL:'http://127.0.0.1:3298',
    AUTH0_DOMAIN:'borrowbench-test.invalid',AUTH0_CLIENT_ID:'synthetic-client',AUTH0_CLIENT_SECRET:'synthetic-only',
    AUTH0_SECRET:secret,AUTH0_AUDIENCE:audience,BORROWBENCH_ENV:'verify',API_INTERNAL_URL:'http://127.0.0.1:3297',
  });
  await ready('http://127.0.0.1:3298',web);
  const endpoint='http://127.0.0.1:3298/api/platform';
  assert.equal((await fetch(endpoint)).status,401);
  for(const [subject,role] of [['auth0|member-a','member'],['auth0|custodian','custodian']]) {
    const response=await fetch(endpoint,{headers:{cookie:await cookie(subject)}});
    assert.equal(response.status,200);
    assert.match(response.headers.get('cache-control'), /(?:^|,\s*)no-store(?:,|$)/);
    const data=await response.json();
    assert.equal(data.platform,'BorrowBench'); assert.equal(data.role,role);
    assert.deepEqual(Object.keys(data).sort(),['label','platform','role']);
  }
  assert.equal((await fetch(endpoint,{headers:{cookie:await cookie('auth0|unlisted')}})).status,403);
  assert.equal((await fetch(endpoint,{headers:{cookie:'borrowbench_verify_session=corrupt'}})).status,401);
  console.log('PASS: encrypted SDK session → Next.js route → RS256 NestJS authorization → migrated PostgreSQL, member/custodian, unknown subject and corrupt session');
  await stop(api);
  assert.equal((await fetch(endpoint,{headers:{cookie:await cookie('auth0|member-a')}})).status,503);
  console.log('PASS: API unavailability propagated without token/error leakage');
} finally {
  for(const child of children.reverse())await stop(child);
  await new Promise(resolve=>jwks.close(resolve));
  await rm(local,{recursive:true,force:true});
}
