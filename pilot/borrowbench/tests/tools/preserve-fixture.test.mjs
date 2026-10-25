import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { fixtureMode, fixturePlan, validatePriorFixture, validateFixedIdentity, applyFixturePlan, readBusinessInventory } from '../../tools/containers.mjs';
const fixture=JSON.parse(await readFile(new URL('../../database/fixtures/pilot-fixtures.json',import.meta.url)));
const receiptPath=fileURLToPath(new URL('../../../../docs/pilot/implementation/BB-IMPLEMENT-01/IM-05/fixture-receipt.json',import.meta.url));
const receipt=JSON.parse(await readFile(receiptPath));
const receiptHash='98aec3858e2a8cad8cbae2e1bc1b401760091245c33b13bedadfddbf8d305334';
const args=['--preserve-existing-fixture',receiptPath,'--receipt-sha256',receiptHash];
const digest=v=>createHash('sha256').update(v).digest('hex');
function inventory(){return {accounts:fixture.accounts.map(a=>({id:a.id,displayLabel:a.displayLabel,role:a.role,subjectSha256:digest(a.providerSubject)})),equipment:structuredClone(fixture.datasets.baseline.equipment),counts:{accounts:3,equipment:6,loans:30,activeLoans:0,events:60,operations:71,maintenance:1,available:5},rowDigests:Object.fromEntries(['accounts','equipment','loans','operations','audit_events'].map(k=>[k,digest(k)]))};}
test('preservation requires explicit complete verify-only options',()=>{
 assert.deepEqual(fixtureMode([],'verify'),{mode:'seed-empty-baseline'});
 assert.equal(fixtureMode(args,'verify').mode,'preserve-existing-fixture');
 for(const [a,t] of [[args,'pilot'],[args.slice(0,2),'verify'],[[...args,'extra'],'verify'],[[...args.slice(0,3),'wrong'],'verify']])assert.throws(()=>fixtureMode(a,t));
});
test('retained original receipt and inventory/state hashes bind plan',async()=>{
 const plan=await fixturePlan(args,'verify');assert.equal(plan.priorReceipt.sha256,receiptHash);
 await assert.rejects(fixturePlan([...args.slice(0,3),'0'.repeat(64)],'verify'),/hash mismatch/);
 for(const patch of [{target:'borrowbench-containers-pilot'},{fixture_sha256:'0'.repeat(64)},{dataset:'load'},{checks:{}}])assert.throws(()=>validatePriorFixture({...receipt,...patch},'verify',fixture));
});
test('fixed identities allow accumulated history and maintenance changes',()=>{
 const state=inventory();state.equipment[0].maintenance=true;state.counts.maintenance=2;state.counts.available=4;
 assert.equal(validateFixedIdentity(state,fixture),state);
});
test('changed, missing, or added fixed identities fail closed',()=>{
 for(const mutate of [s=>s.accounts.pop(),s=>s.accounts.push(s.accounts[0]),s=>s.accounts[0].role='custodian',s=>s.accounts[0].subjectSha256='0'.repeat(64),s=>s.equipment.pop(),s=>s.equipment[0].name='Changed',s=>s.equipment[0].description='Changed',s=>s.equipment[0].id='changed']){
 const state=inventory();mutate(state);assert.throws(()=>validateFixedIdentity(state,fixture));
 }
});
test('preservation captures actual inventory and never invokes seed',async()=>{
 const before=inventory();let seedCalls=0;let reads=0;
 const result=await applyFixturePlan({mode:'preserve-existing-fixture',fixture,priorReceipt:receiptHash},{readInventory:async()=>{reads++;return structuredClone(before);},seedEmpty:async()=>{seedCalls++;}},before);
 assert.equal(seedCalls,0);assert.equal(reads,1);assert.equal(result.seedExecuted,false);assert.equal(result.pristineBaseline,false);assert.equal(result.after.counts.events,60);
});
test('preservation rejects data changes during setup with no seed fallback',async()=>{
 const before=inventory();
 for(const mutate of [s=>s.rowDigests.loans='0'.repeat(64),s=>s.counts.events++]){
 const after=structuredClone(before);mutate(after);
 await assert.rejects(applyFixturePlan({mode:'preserve-existing-fixture',fixture},{readInventory:async()=>after,seedEmpty:()=>assert.fail('must not seed')},before),/changed during setup/);
 }
});
test('initial path calls existing empty-only loader and retains its refusal',async()=>{
 let calls=0;const after=inventory();after.counts.loans=after.counts.events=after.counts.operations=0;
 const result=await applyFixturePlan({mode:'seed-empty-baseline',fixture},{seedEmpty:async()=>{calls++;},readInventory:async()=>after});
 assert.equal(calls,1);assert.equal(result.seedExecuted,true);assert.equal(result.pristineBaseline,true);
 await assert.rejects(applyFixturePlan({mode:'seed-empty-baseline',fixture},{seedEmpty:async()=>{throw Error('nonempty refused');},readInventory:()=>assert.fail('must not read after refusal')}),/nonempty refused/);
});
test('inventory uses a single read-only SQL boundary without raw subject output',async()=>{
 let calls=0;const expected=inventory();const result=await readBusinessInventory(async argv=>{
 calls++;assert.deepEqual(argv.slice(0,4),['exec','-T','db','psql']);const sql=argv.at(-1);
 assert.match(sql,/^BEGIN READ ONLY;/);assert.doesNotMatch(sql,/\b(INSERT|UPDATE|DELETE|TRUNCATE|ALTER|DROP)\b/i);assert.match(sql,/subjectSha256/);assert.match(sql,/sha256\(convert_to\(provider_subject/);
 return 'BEGIN\n'+JSON.stringify(expected)+'\nCOMMIT\n';
 });assert.equal(calls,1);assert.deepEqual(result.counts,expected.counts);
});
