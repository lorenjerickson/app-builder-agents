import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import pg from 'pg';
import { Business } from '../src/business.js';
import { canonicalIntent, command, decodeCursor, encodeCursor, operationKey, uuid, BusinessError } from '../src/business-contract.js';
import { createApp } from '../src/app.js';
import { loadConfig } from '../src/config.js';
const A='00000001-0000-4000-8000-000000000001';
const B='00000001-0000-4000-8000-000000000002';
const item='00000002-0000-4000-8000-000000000001';
const oldLoan='00000003-0000-4000-8000-000000000001';
const rid='00000005-0000-4000-8000-000000000001';
const actor={id:A,role:'member' as const};
const custodian={id:'00000001-0000-4000-8000-000000000003',role:'custodian' as const};
type Step = {match:RegExp;rows?:Record<string,unknown>[];inspect?:(values:any[])=>void;error?:Error};
function scripted(steps:Step[]) {
 const calls:string[]=[];let released=false;
 const client={async query(sql:string,values:any[]=[]) {
  calls.push(sql);const step=steps.shift();assert.ok(step,`Unexpected SQL ${sql}`);assert.match(sql,step.match);step.inspect?.(values);if(step.error)throw step.error;
  return {rows:step.rows??[],rowCount:step.rows?.length??0};
 },release(){released=true;}};
 const pool={connect:async()=>client,query:client.query,on(){},end:async()=>{}} as unknown as pg.Pool;
 return {business:new Business(pool),pool,calls,done(){assert.equal(steps.length,0);assert.ok(released);}};
}
const begin=():Step[]=>[{match:/^BEGIN/},{match:/SET LOCAL lock_timeout/},{match:/SET LOCAL statement_timeout/},{match:/INSERT INTO operations/,rows:[{key:'key'}]}];
const terminal=(code:string,status:number,changed:boolean):Step=>({match:/UPDATE operations SET/,inspect:v=>{assert.equal(v[0],status);assert.equal(v[1].code,code);assert.equal(v[1].changed,changed);assert.equal(v[3],A);assert.equal(v[4],'key');}});
test('canonical intent matches independent frozen fixture hashes and rejects untrusted fields',()=>{
 const fixture=JSON.parse(readFileSync(new URL('../../../../database/fixtures/pilot-fixtures.json',import.meta.url),'utf8'));
 for(const dataset of Object.values(fixture.datasets) as any[]) for(const o of dataset.operations) {
  const c=canonicalIntent(command(o.intent.type,o.intent.target,o.intent.payload));assert.equal(c.bytes,o.canonicalIntent);assert.equal(c.digest,o.intentSha256);
 }
 for(const body of [null,[],{borrowerId:B},{enabled:true}]) assert.throws(()=>command('checkout',item,body));
 for(const body of [{},{enabled:'true'},{enabled:false,actor:A}]) assert.throws(()=>command('set_maintenance',item,body));
 assert.equal(uuid(item.toUpperCase(),'itemId'),item);
 assert.equal(operationKey('  Case Sensitive  '),'  Case Sensitive  ');
 for(const key of ['', 'x'.repeat(129),'line\nfeed','é', ['key']]) assert.throws(()=>operationKey(key));
});
test('cursor strict decoding binds full tuple, kind and equipment filter',()=>{
 const c={v:1 as const,kind:'audit' as const,time:'2026-10-20T09:00:00.000Z',id:oldLoan,equipmentId:item};
 assert.deepEqual(decodeCursor(encodeCursor(c),'audit',item),c);
 for(const [value,kind,filter] of [[encodeCursor(c),'returned',null],[encodeCursor(c),'audit',null],['garbage','audit',item],[encodeCursor({...c,time:'2026-02-30T09:00:00.000Z'}),'audit',item],[encodeCursor({...c,extra:1} as any),'audit',item]] as any[]) assert.throws(()=>decodeCursor(value,kind,filter));
});
test('checkout commits loan, one audit event and receipt on one client',async()=>{
 let loanId='';const s=scripted([...begin(),{match:/FROM equipment .*FOR UPDATE/,rows:[{id:item,maintenance:false}]},{match:/FROM loans WHERE equipment_id/,rows:[]},
 {match:/INSERT INTO loans/,inspect:v=>{loanId=v[0];assert.equal(v[1],item);assert.equal(v[2],A);}},
 {match:/INSERT INTO audit_events/,inspect:v=>{assert.equal(v[1],A);assert.equal(v[2],item);assert.equal(v[3],loanId);assert.equal(v[4],'checkout');assert.equal(v[7],'key');}},terminal('CHECKED_OUT',201,true),{match:/COMMIT/}]);
 const r=await s.business.mutate(actor,'key',command('checkout',item,{}),rid);assert.equal(r.httpStatus,201);assert.equal(r.operation.result?.loanId,loanId);assert.equal(r.operation.completedAt,r.operation.result?.checkedOutAt);s.done();
});
test('unavailable checkout records conflict but no loan or audit',async()=>{
 const s=scripted([...begin(),{match:/FROM equipment .*FOR UPDATE/,rows:[{id:item,maintenance:true}]},{match:/FROM loans WHERE equipment_id/},terminal('ITEM_UNAVAILABLE',409,false),{match:/COMMIT/}]);
 assert.equal((await s.business.mutate(actor,'key',command('checkout',item,{}),rid)).operation.outcome,'conflict');s.done();
});
test('return locks exact owned loan after equipment; stale return cannot touch current loan',async()=>{
 const s=scripted([...begin(),{match:/SELECT equipment_id FROM loans WHERE id=\$1 AND borrower_id=\$2/,rows:[{equipment_id:item}],inspect:v=>assert.deepEqual(v,[oldLoan,A])},
 {match:/FROM equipment .*FOR UPDATE/,rows:[{id:item,maintenance:false}]},{match:/FROM loans WHERE id=\$1 AND borrower_id=\$2 FOR UPDATE/,rows:[{id:oldLoan,returned_at:'2026-10-20T10:00:00Z'}],inspect:v=>assert.deepEqual(v,[oldLoan,A])},terminal('LOAN_ALREADY_RETURNED',409,false),{match:/COMMIT/}]);
 await s.business.mutate(actor,'key',command('return',oldLoan,{}),rid);s.done();
});
test('absent and foreign returns produce identical safe receipt without locking foreign resources',async()=>{
 const s=scripted([...begin(),{match:/SELECT equipment_id FROM loans/,rows:[]},terminal('NOT_FOUND',404,false),{match:/COMMIT/}]);
 const r=await s.business.mutate(actor,'key',command('return',oldLoan,{}),rid);assert.equal(r.operation.result,null);assert.equal(r.httpStatus,404);s.done();
});
test('same-state maintenance emits no audit; member role rejected before client acquisition',async()=>{
 const s=scripted([...begin(),{match:/FROM equipment .*FOR UPDATE/,rows:[{id:item,maintenance:true}]},{match:/FROM loans WHERE equipment_id/},
 {match:/UPDATE operations SET/,inspect:v=>{assert.equal(v[1].code,'MAINTENANCE_UNCHANGED');assert.equal(v[1].changed,false);}}, {match:/COMMIT/}]);
 await assert.rejects(()=>s.business.mutate(actor,'key',command('set_maintenance',item,{enabled:true}),rid),e=>e instanceof BusinessError && e.code==='FORBIDDEN');
 await s.business.mutate(custodian,'key',command('set_maintenance',item,{enabled:true}),rid);s.done();
});
test('same key replays immutable original receipt without item reads; different intent rolls back',async()=>{
 const cmd=command('checkout',item,{}),intent=canonicalIntent(cmd);
 const outcome={key:'key',type:'checkout',target:item,outcome:'conflict',code:'ITEM_UNAVAILABLE',changed:false,result:null,completedAt:'2026-10-20T09:00:00.000Z',originalCorrelationId:rid};
 for(const matching of [true,false]) {
  const steps=begin();steps[3].rows=[];
  const s=scripted([...steps,{match:/SELECT canonical_intent/,rows:[{canonical_intent:matching?intent.bytes:'different',intent_digest:intent.digest,http_status:409,outcome}]},{match:matching?/COMMIT/:/ROLLBACK/}]);
  if(matching){const r=await s.business.mutate(actor,'key',cmd,rid);assert.deepEqual(r.operation,outcome);assert.equal(r.replay,true);assert.equal(r.httpStatus,409);}
  else await assert.rejects(()=>s.business.mutate(actor,'key',cmd,rid),e=>e instanceof BusinessError && e.code==='KEY_REUSE');
  s.done();
 }
});
test('commit acknowledgement failure remains unresolved and releases client',async()=>{
 const s=scripted([...begin(),{match:/FROM equipment .*FOR UPDATE/,rows:[]},terminal('NOT_FOUND',404,false),{match:/COMMIT/,error:new Error('ack lost')},{match:/ROLLBACK/}]);
 await assert.rejects(()=>s.business.mutate(actor,'key',command('checkout',item,{}),rid),/ack lost/);s.done();
});
test('read SQL scopes privacy and equipment response exposes only own active loan ID',async()=>{
 const rows=[{id:item,inventory_code:'BB-001',name:'Field recorder',description:'Synthetic',maintenance:false,loan_id:oldLoan,borrower_id:B}];
 const pool={query:async(sql:string,values:any[])=>{assert.match(sql,/LEFT JOIN loans/);return {rows};}} as unknown as pg.Pool;
 const result=await new Business(pool).equipment(actor,{});assert.deepEqual(result,{items:[{id:item,inventoryCode:'BB-001',name:'Field recorder',description:'Synthetic',state:'on_loan',ownActiveLoanId:null}]});
});
test('HTTP boundary rejects malformed, oversized and forged bodies; preserves scaffold auth errors',async()=>{
 let writes=0;
 const pool={on(){},end:async()=>{},async query(sql:string){if(/SELECT id,role FROM accounts/.test(sql))return {rows:[actor]};throw new Error('unavailable');},connect:async()=>{writes++;throw new Error('unavailable');}} as unknown as pg.Pool;
 const config=loadConfig({DATABASE_URL:'postgresql://unused:unused@127.0.0.1:1/unused',BORROWBENCH_AUTH_MODE:'local',BORROWBENCH_ENV:'dev',API_HOST:'127.0.0.1',BORROWBENCH_LOCAL_AUTH_KEY:'k'.repeat(32)});
 const app=await createApp(config,{pool});
 try {
  await app.listen(0,'127.0.0.1');const base=await app.getUrl();
  const headers={authorization:`Bearer ${'k'.repeat(32)}`,'x-borrowbench-local-account':'member-a','content-type':'application/json','idempotency-key':'key'};
  const send=(path:string,body:string,extra:Record<string,string>={})=>fetch(base+path,{method:'POST',headers:{...headers,...extra},body});
  const path=`/v1/equipment/${item}/checkout`;
  for(const [body,status,code] of [['{"borrowerId":"forged"}',400,'INVALID_REQUEST'],['{',400,'INVALID_REQUEST'],['[]',400,'INVALID_REQUEST'],['"primitive"',400,'INVALID_REQUEST'],[JSON.stringify({padding:'x'.repeat(9000)}),413,'PAYLOAD_TOO_LARGE']] as const){const r=await send(path,body);assert.equal(r.status,status);const b=await r.json() as any;assert.equal(b.error.code,code);assert.ok(b.error.requestId);assert.equal(b.operation,undefined);assert.equal(r.headers.get('cache-control'),'no-store');}
  const invalid=await send(path,'{}',{'x-correlation-id':'not-a-uuid'});assert.equal(invalid.status,400);
  const denied=await fetch(base+`/v1/equipment/${item}/maintenance`,{method:'PUT',headers,body:'{"enabled":true}'});assert.equal(denied.status,403);
  assert.equal(writes,0);
  const unavailable=await send(path,'{}',{'x-correlation-id':rid});assert.notEqual(unavailable.headers.get('x-request-id'),rid);assert.equal(unavailable.status,503);assert.equal((await unavailable.json() as any).error.code,'OPERATION_UNRESOLVED');
  assert.deepEqual(await (await fetch(base+'/me')).json(),{error:'unauthorized'});
  assert.equal((await fetch(base+'/v1/equipment')).status,401);
 } finally {await app.close();}
});
test('successful return updates only the exact loan then writes one event and receipt',async()=>{
 const s=scripted([...begin(),{match:/SELECT equipment_id FROM loans/,rows:[{equipment_id:item}]},{match:/FROM equipment .*FOR UPDATE/,rows:[{id:item,maintenance:false}]},
 {match:/FROM loans WHERE id=\$1 AND borrower_id=\$2 FOR UPDATE/,rows:[{id:oldLoan,returned_at:null,checked_out_at:'2026-10-20T09:00:00.000Z'}]},
 {match:/UPDATE loans SET returned_at/,inspect:v=>assert.equal(v[1],oldLoan)},
 {match:/INSERT INTO audit_events/,inspect:v=>{assert.equal(v[3],oldLoan);assert.equal(v[4],'return');}},terminal('RETURNED',200,true),{match:/COMMIT/}]);
 const r=await s.business.mutate(actor,'key',command('return',oldLoan,{}),rid);assert.equal(r.operation.result?.loanId,oldLoan);assert.equal(r.operation.completedAt,r.operation.result?.returnedAt);s.done();
});
test('maintenance transition and on-loan conflict obey item lock and event rules',async()=>{
 for(const active of [false,true]){
  const s=scripted([...begin(),{match:/FROM equipment .*FOR UPDATE/,rows:[{id:item,maintenance:false}]},{match:/FROM loans WHERE equipment_id/,rows:active?[{id:oldLoan}]:[]},
   ...(!active?[{match:/UPDATE equipment SET maintenance/,inspect:(v:any[])=>assert.deepEqual(v,[true,item])},{match:/INSERT INTO audit_events/,inspect:(v:any[])=>{assert.equal(v[3],null);assert.equal(v[4],'maintenance_started');}}]:[]),
   {match:/UPDATE operations SET/,inspect:v=>{assert.equal(v[1].code,active?'ITEM_ON_LOAN':'MAINTENANCE_STARTED');assert.equal(v[1].changed,!active);}}, {match:/COMMIT/}]);
  await s.business.mutate(custodian,'key',command('set_maintenance',item,{enabled:true}),rid);s.done();
 }
});
test('returned pagination keeps fresh active section and binds owner plus tuple on every page',async()=>{
 const time='2026-10-20T09:00:00.000Z';
 const r=(id:string)=>({id,equipment_id:item,inventory_code:'BB-001',name:'Field recorder',checked_out_at:time,returned_at:'2026-10-20T10:00:00.000Z'});
 const ids=['00000003-0000-4000-8000-000000000062','00000003-0000-4000-8000-000000000061','00000003-0000-4000-8000-000000000060'];
 let n=0;const pool={async query(sql:string,values:any[]){assert.match(sql,/l.borrower_id=\$1/);assert.equal(values[0],A);n++;
  if(n%2===1){assert.match(sql,/returned_at IS NULL/);return {rows:[]};}
  assert.match(sql,/\(l.checked_out_at,l.id\)</);assert.equal(values[3],3);
  if(n===2)return {rows:ids.map(r)};
  assert.equal(values[1],time);assert.equal(values[2],ids[1]);return {rows:[r(ids[2])]};
 }} as unknown as pg.Pool;
 const service=new Business(pool),p1=await service.ownLoans(actor,{limit:'2'});assert.deepEqual(p1.returned.map(r=>r.id),ids.slice(0,2));
 assert.ok(p1.nextReturnedCursor);const p2=await service.ownLoans(actor,{limit:'2',cursor:p1.nextReturnedCursor});assert.deepEqual(p2.returned.map(r=>r.id),ids.slice(2));assert.equal(p2.nextReturnedCursor,null);assert.equal(n,4);
});
test('audit denies members before queries and owner detail never drops borrower predicate',async()=>{
 let called=0;const pool={async query(sql:string,values:any[]){called++;assert.match(sql,/l.id=\$1 AND l.borrower_id=\$2/);assert.deepEqual(values,[oldLoan,custodian.id]);return {rows:[]};}} as unknown as pg.Pool;
 const service=new Business(pool);await assert.rejects(()=>service.audit(actor,{}),e=>e instanceof BusinessError&&e.code==='FORBIDDEN');assert.equal(called,0);
 await assert.rejects(()=>service.ownLoan(custodian,oldLoan,{}),e=>e instanceof BusinessError&&e.code==='NOT_FOUND');assert.equal(called,1);
});
