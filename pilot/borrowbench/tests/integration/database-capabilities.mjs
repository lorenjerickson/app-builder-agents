// Platform capability probe only; no production domain tables or business endpoints.
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { Client } from 'pg';
const url=process.env.TEST_DATABASE_URL;
assert.ok(url, 'Run through platform.mjs test-db --target verify');
const parsed=new URL(url);
assert.equal(parsed.hostname,'127.0.0.1'); assert.equal(parsed.port,'55433');
const schema='bb_cap_'+randomUUID().replaceAll('-','');
const clients=[0,1,2].map(()=>new Client({connectionString:url,connectionTimeoutMillis:3000}));
let created=false;
try {
 await Promise.all(clients.map(c=>c.connect()));
 const [admin,a,b]=clients;
 await admin.query(`CREATE SCHEMA ${schema}`); created=true;
 await admin.query(`CREATE TABLE ${schema}.slot(id int PRIMARY KEY, claimed boolean NOT NULL DEFAULT false);
 CREATE TABLE ${schema}.receipt(key text PRIMARY KEY, outcome text NOT NULL);
 CREATE TABLE ${schema}.audit(event text NOT NULL);
 INSERT INTO ${schema}.slot(id) VALUES(1)`);
 async function claim(client,key){
  await client.query('BEGIN');
  try {
   const result=await client.query(`UPDATE ${schema}.slot SET claimed=true WHERE id=1 AND claimed=false RETURNING id`);
   if(result.rowCount){
    await client.query(`INSERT INTO ${schema}.receipt VALUES($1,'claimed')`,[key]);
    await client.query(`INSERT INTO ${schema}.audit VALUES('claimed')`);
   }
   await client.query('COMMIT'); return result.rowCount;
  } catch(error){await client.query('ROLLBACK');throw error;}
 }
 const race=await Promise.all([claim(a,'operation-a'),claim(b,'operation-b')]);
 assert.equal(race.reduce((x,y)=>x+y,0),1);
 assert.equal((await admin.query(`SELECT * FROM ${schema}.receipt`)).rowCount,1);
 assert.equal((await admin.query(`SELECT * FROM ${schema}.audit`)).rowCount,1);
 const original=(await admin.query(`SELECT * FROM ${schema}.receipt`)).rows[0];
 const replay=await b.query(`INSERT INTO ${schema}.receipt VALUES($1,'incorrect') ON CONFLICT(key) DO NOTHING RETURNING key`,[original.key]);
 assert.equal(replay.rowCount,0);
 assert.equal((await admin.query(`SELECT outcome FROM ${schema}.receipt WHERE key=$1`,[original.key])).rows[0].outcome,'claimed');
 await a.query('BEGIN');
 await a.query(`INSERT INTO ${schema}.receipt VALUES('rollback','pending')`);
 await a.query(`INSERT INTO ${schema}.audit VALUES('rollback')`);
 await a.query('ROLLBACK');
 assert.equal((await admin.query(`SELECT * FROM ${schema}.receipt WHERE key='rollback'`)).rowCount,0);
 assert.equal((await admin.query(`SELECT * FROM ${schema}.audit WHERE event='rollback'`)).rowCount,0);
 console.log('PASS: concurrent compare-and-set has one winner; receipt/audit atomicity, unique-key preservation and rollback verified on isolated verify PostgreSQL.');
} finally {
 for(const c of clients)await c.query('ROLLBACK').catch(()=>{});
 if(created)await clients[0].query(`DROP SCHEMA ${schema} CASCADE`);
 await Promise.all(clients.map(c=>c.end().catch(()=>{})));
}
