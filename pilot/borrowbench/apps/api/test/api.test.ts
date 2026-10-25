import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { exportJWK, generateKeyPair, SignJWT } from 'jose';
import { createApp } from '../src/app.js';
import { loadConfig } from '../src/config.js';

const issuer = 'https://dev-vaonng6ouuwr50kl.us.auth0.com/';
const audience = 'https://borrowbench.local/api';
const keys = await generateKeyPair('RS256');
const wrongKeys = await generateKeyPair('RS256');
const publicKey = { ...await exportJWK(keys.publicKey), kid: 'fixture', alg: 'RS256', use: 'sig' };
const jwks = createServer((_req, res) => { res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify({ keys: [publicKey] })); });
let app: Awaited<ReturnType<typeof createApp>>;
let base: string;
let directory: string;
let env: NodeJS.ProcessEnv;
before(async () => {
  directory = await mkdtemp(join(tmpdir(), 'borrowbench-api-'));
  const mapFile = join(directory, 'accounts.json');
  await writeFile(mapFile, JSON.stringify({
    'auth0|member': { label: 'Member fixture', role: 'member' },
    'auth0|custodian': { label: 'Custodian fixture', role: 'custodian' },
  }), { mode: 0o600 });
  await new Promise<void>(resolve => jwks.listen(0, '127.0.0.1', resolve));
  const address = jwks.address();
  assert.ok(address && typeof address !== 'string');
  env = { DATABASE_URL: process.env.TEST_DATABASE_URL ?? 'postgresql://unused:unused@127.0.0.1:1/unused',
    PILOT_ACCOUNT_MAP_FILE: mapFile, NODE_ENV: 'test', TEST_JWKS_URL: `http://127.0.0.1:${address.port}/jwks`, AUTH0_ISSUER: issuer, AUTH0_AUDIENCE: audience };
  app = await createApp(loadConfig(env));
  await app.listen(0, '127.0.0.1');
  base = await app.getUrl();
});
after(async () => {
  await app?.close();
  await new Promise<void>(resolve => jwks.close(() => resolve()));
  if (directory) await rm(directory, { recursive: true, force: true });
});
async function token(options: { subject?: string; issuer?: string; audience?: string; expired?: boolean; wrongKey?: boolean; noExpiry?: boolean } = {}) {
  let jwt = new SignJWT({}).setProtectedHeader({ alg: 'RS256', kid: 'fixture' })
    .setSubject(options.subject ?? 'auth0|member').setIssuer(options.issuer ?? issuer)
    .setAudience(options.audience ?? audience).setIssuedAt();
  if (!options.noExpiry) jwt = jwt.setExpirationTime(options.expired ? Math.floor(Date.now() / 1000) - 60 : '5m');
  return jwt.sign(options.wrongKey ? wrongKeys.privateKey : keys.privateKey);
}
async function get(path: string, bearer?: string) {
  return fetch(`${base}${path}`, { headers: bearer ? { Authorization: `Bearer ${bearer}` } : {} });
}
test('public liveness and responses disable caching', async () => {
  const response = await get('/health/live');
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('cache-control'), 'no-store');
  assert.deepEqual(await response.json(), { status: 'ok' });
});
test('missing and malformed token denied', async () => {
  assert.equal((await get('/me')).status, 401);
  assert.deepEqual(await (await get('/me', 'invalid')).json(), { error: 'unauthorized' });
});
for (const [name, options] of Object.entries({ expired: { expired: true }, audience: { audience: 'wrong' },
  issuer: { issuer: 'https://wrong.invalid/' }, signature: { wrongKey: true }, missing_expiry: { noExpiry: true } })) {
  test(`reject ${name}`, async () => assert.equal((await get('/me', await token(options))).status, 401));
}
test('unmapped valid subject denied', async () => {
  assert.equal((await get('/me', await token({ subject: 'auth0|stranger' }))).status, 403);
});
test('member cannot access custodian endpoint', async () => {
  assert.equal((await get('/admin/platform', await token())).status, 403);
});
test('configuration rejects missing map and unsafe JWKS override', () => {
  assert.throws(() => loadConfig({ ...env, PILOT_ACCOUNT_MAP_FILE: undefined }));
  assert.throws(() => loadConfig({ ...env, NODE_ENV: 'production' }));
  assert.throws(() => loadConfig({ ...env, TEST_JWKS_URL: 'http://example.com/jwks' }));
});
test('dependency outage is generic and readiness fails closed', { skip: Boolean(process.env.TEST_DATABASE_URL) }, async () => {
  const response = await get('/health/ready');
  assert.equal(response.status, 503);
  assert.deepEqual(await response.json(), { error: 'unavailable' });
  assert.equal((await get('/me', await token())).status, 503);
});
test('migrated database marker reaches authenticated callers and readiness', { skip: !process.env.TEST_DATABASE_URL }, async () => {
  const member = await get('/me', await token());
  assert.equal(member.status, 200);
  assert.deepEqual(await member.json(), { subject: 'auth0|member', label: 'Member fixture', role: 'member', platform: 'BorrowBench' });
  const custodian = await get('/admin/platform', await token({ subject: 'auth0|custodian' }));
  assert.equal(custodian.status, 200);
  assert.deepEqual(await custodian.json(), { platform: 'BorrowBench' });
  const ready = await get('/health/ready');
  assert.equal(ready.status, 200);
  assert.deepEqual(await ready.json(), { status: 'ready', platform: 'BorrowBench' });
});

test('empty account map permits safe deny-all bootstrap', async () => {
  const emptyMap = join(directory, 'empty-accounts.json');
  await writeFile(emptyMap, '{}', { mode: 0o600 });
  const config = loadConfig({ ...env, PILOT_ACCOUNT_MAP_FILE: emptyMap });
  assert.equal(config.accounts.size, 0);
  const denyAll = await createApp(config);
  try {
    await denyAll.listen(0, '127.0.0.1');
    const response = await fetch(`${await denyAll.getUrl()}/me`, {
      headers: { Authorization: `Bearer ${await token()}` },
    });
    assert.equal(response.status, 403);
    assert.deepEqual(await response.json(), { error: 'forbidden' });
  } finally { await denyAll.close(); }
});

test('local auth configuration is explicit and restricted to dev loopback', () => {
  const local = { ...env, BORROWBENCH_AUTH_MODE: 'local', BORROWBENCH_ENV: 'dev',
    API_HOST: '127.0.0.1', BORROWBENCH_LOCAL_AUTH_KEY: 'k'.repeat(32), PILOT_ACCOUNT_MAP_FILE: undefined };
  const config = loadConfig({ ...local, NODE_ENV: 'production' });
  assert.equal(config.authMode, 'local');
  assert.equal(config.accounts.size, 0);
  for (const patch of [
    { BORROWBENCH_ENV: undefined }, { BORROWBENCH_ENV: 'verify' }, { BORROWBENCH_ENV: 'pilot' },
    { API_HOST: undefined }, { API_HOST: '0.0.0.0' }, { API_HOST: 'localhost' },
    { BORROWBENCH_LOCAL_AUTH_KEY: undefined }, { BORROWBENCH_LOCAL_AUTH_KEY: 'k'.repeat(31) },
    { BORROWBENCH_AUTH_MODE: 'unknown' },
  ]) assert.throws(() => loadConfig({ ...local, ...patch }));
  assert.equal(loadConfig(env).authMode, 'auth0');
});

for (const mode of ['local', 'container-test'] as const) test(`${mode} enforces shared key, fixed identities and custodian role`, async () => {
  const key = 'local-test-fixture-key-only-'.repeat(3);
  const localApp = await createApp(loadConfig({ ...env, BORROWBENCH_AUTH_MODE: mode, BORROWBENCH_TEST_ONLY: '1',
    BORROWBENCH_ENV: mode === 'local' ? 'dev' : 'verify',
    API_HOST: mode === 'local' ? '127.0.0.1' : '0.0.0.0', BORROWBENCH_LOCAL_AUTH_KEY: key }));
  try {
    await localApp.listen(0, '127.0.0.1');
    const localBase = await localApp.getUrl();
    const request = (path: string, account?: string, secret?: string) => fetch(`${localBase}${path}`, {
      headers: { ...(secret ? { Authorization: `Bearer ${secret}` } : {}),
        ...(account ? { 'X-BorrowBench-Local-Account': account } : {}) },
    });
    assert.equal((await request('/me', 'member-a')).status, 401);
    assert.equal((await request('/me', 'member-a', 'bad-key')).status, 401);
    assert.equal((await request('/me', 'member-a', key.slice(0, -1) + 'x')).status, 401);
    assert.equal((await request('/me', 'unknown', key)).status, 403);
    assert.equal((await request('/me', undefined, key)).status, 403);
    for (const member of ['member-a', 'member-b']) {
      assert.equal((await request('/admin/platform', member, key)).status, 403);
      const response = await request('/me', member, key);
      assert.equal(response.status, process.env.TEST_DATABASE_URL ? 200 : 503);
      if (process.env.TEST_DATABASE_URL) assert.deepEqual(await response.json(), {
        subject: `local|${member}`, label: member === 'member-a' ? 'Member A' : 'Member B',
        role: 'member', platform: 'BorrowBench',
      });
    }
    assert.equal((await request('/admin/platform', 'custodian', key)).status, process.env.TEST_DATABASE_URL ? 200 : 503);
    assert.equal((await get('/me', key)).status, 401);
  } finally { await localApp.close(); }
});


test('container test configuration rejects unsafe targets and malformed keys', () => {
  const container = { ...env, BORROWBENCH_AUTH_MODE: 'container-test', BORROWBENCH_ENV: 'verify',
    BORROWBENCH_TEST_ONLY: '1', API_HOST: '0.0.0.0', BORROWBENCH_LOCAL_AUTH_KEY: 'k'.repeat(32),
    PILOT_ACCOUNT_MAP_FILE: '/must-not-read-real-map' };
  for (const target of ['verify', 'pilot']) {
    const config = loadConfig({ ...container, BORROWBENCH_ENV: target });
    assert.equal(config.authMode, 'container-test');
    assert.equal(config.accounts.size, 0);
  }
  for (const patch of [
    { BORROWBENCH_ENV: undefined }, { BORROWBENCH_ENV: 'dev' }, { BORROWBENCH_ENV: 'production' },
    { BORROWBENCH_TEST_ONLY: undefined }, { BORROWBENCH_TEST_ONLY: 'true' },
    { API_HOST: undefined }, { API_HOST: '127.0.0.1' },
    { BORROWBENCH_LOCAL_AUTH_KEY: undefined }, { BORROWBENCH_LOCAL_AUTH_KEY: 'k'.repeat(31) },
    { BORROWBENCH_LOCAL_AUTH_KEY: 'k'.repeat(32) + ' ' },
  ]) assert.throws(() => loadConfig({ ...container, ...patch }));
});
