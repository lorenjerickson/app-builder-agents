import { readFileSync } from 'node:fs';
import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readdirSync } from 'node:fs';
let migrationClient;
try {
  const mode = process.argv[2];
  if (!['api','web','migrate','provision-role','load-baseline'].includes(mode) || process.env.BORROWBENCH_AUTH_MODE !== 'container-test' ||
      process.env.BORROWBENCH_TEST_ONLY !== '1' || !['verify','pilot'].includes(process.env.BORROWBENCH_ENV)) throw new Error();
  const key = readFileSync('/run/secrets/test_auth','utf8').trim();
  if (!/^[a-f0-9]{64}$/.test(key)) throw new Error();
  process.env.BORROWBENCH_LOCAL_AUTH_KEY = key;
  if (mode !== 'web') {
    const password = readFileSync(mode==='api'?'/run/secrets/api_db_password':'/run/secrets/db_password','utf8').trim();
    if (!/^[a-f0-9]{64}$/.test(password)) throw new Error();
    process.env.DATABASE_URL = `postgresql://${mode==='api'?'borrowbench_runtime':'borrowbench'}:${password}@db:5432/borrowbench`;
  }
  if (mode === 'migrate') {
    const { runner } = await import('node-pg-migrate');
    const {default:pg}=await import('pg');
    const client=new pg.Client({connectionString:process.env.DATABASE_URL,connectionTimeoutMillis:2000,statement_timeout:3000});
    migrationClient=client;
    await client.connect();
    const ledger=async()=>{
      const exists=(await client.query("SELECT to_regclass('public.pgmigrations') IS NOT NULL AS present")).rows[0].present;
      return exists?(await client.query('SELECT name FROM pgmigrations ORDER BY id')).rows.map(row=>row.name):[];
    };
    const before=await ledger();
    const expected=readdirSync('/app/database/migrations').filter(name=>name.endsWith('.cjs')).sort().map(name=>name.replace(/\.cjs$/,''));
    if (before.some((name,index)=>name!==expected[index])) throw new Error();
    console.log(JSON.stringify({event:'migration_checkpoint',phase:'before',release:process.env.BORROWBENCH_RELEASE_ID,schemaSha256:createHash('sha256').update(before.join('\n')).digest('hex')}));
    await runner({databaseUrl:process.env.DATABASE_URL,dir:'/app/database/migrations',direction:'up',migrationsTable:'pgmigrations',count:Infinity,checkOrder:true,noLock:false,log(){},logger:{debug(){},info(){},warn(){},error(){}}});
    const after=await ledger();await client.end();migrationClient=null;
    if (JSON.stringify(after)!==JSON.stringify(expected)) throw new Error();
    console.log(JSON.stringify({event:'migration_checkpoint',phase:'after',release:process.env.BORROWBENCH_RELEASE_ID,schemaSha256:createHash('sha256').update(after.join('\n')).digest('hex')}));
  } else if (mode === 'provision-role' || mode === 'load-baseline') {
    process.env.BORROWBENCH_ADMIN_DATABASE_URL=process.env.DATABASE_URL;
    if (mode==='provision-role') {
      const password=readFileSync('/run/secrets/api_db_password','utf8').trim();
      if (!/^[a-f0-9]{64}$/.test(password)) throw new Error();
      process.env.BORROWBENCH_API_DATABASE_PASSWORD=password;
    }
    process.argv=[process.execPath,'apps/api/tools/prepare-business.mjs',mode==='provision-role'?'provision-role':'load-fixture',process.env.BORROWBENCH_ENV,...(mode==='load-baseline'?['baseline']:[])];
    await import('../apps/api/tools/prepare-business.mjs');
  } else {
    const args = mode === 'api' ? ['apps/api/dist/src/main.js'] : ['apps/web/node_modules/next/dist/bin/next','start','apps/web','-H','0.0.0.0','-p','3000'];
    const child = spawn(process.execPath,args,{stdio:'inherit',env:process.env});
    for (const signal of ['SIGINT','SIGTERM']) process.on(signal,()=>child.kill(signal));
    child.on('error',()=>{console.error('Container service failed.');process.exitCode=1;});
    child.on('exit',code=>{process.exitCode=code??1;});
  }
} catch { try {await migrationClient?.end();}catch{} console.error('Container configuration or migration failed.'); process.exitCode=1; }
