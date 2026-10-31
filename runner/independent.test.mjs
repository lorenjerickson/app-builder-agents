import test from 'node:test';
import assert from 'node:assert/strict';
import { Ledger } from './ledger.mjs';
import { manifest, assignment, result, artifact } from './fixtures.mjs';
function fresh(){ const l=new Ledger(':memory:'); l.apply({type:'init',manifest:manifest()});return l; }
function finish(l,a,id){l.apply({type:'assign',assignment:a,work_key:a.task_id});l.apply({type:'dispatch',task_id:a.task_id});const c=artifact(a,'requirements_spec',id);l.apply(c);l.apply({type:'result',result:result(a,{output_refs:[`${id}@1`]})});}
test('independent: unknown severity cannot enter a successful result',()=>{const l=fresh();try{const a=assignment({expected_artifact_types:[]});l.apply({type:'assign',assignment:a,work_key:a.task_id});l.apply({type:'dispatch',task_id:a.task_id});const r=result(a,{issues:[{category:'quality',impact:'Synthetic only',evidence:'fixture:evidence',owner:'testing',severity:'anything',predicate_ref:'fixture:predicate',gate_ref:'R1',policy_ref:'fixture:policy'}]});assert.equal(l.apply({type:'result',result:r}).rejected,true);}finally{l.close();}});
test('independent: superseding gate evidence invalidates completed gate-only consumers',()=>{const l=fresh();try{
 finish(l,assignment({task_id:'source'}),'source');
 l.apply({type:'gate',gate_id:'R1',checks:result(assignment()).checks,artifact_refs:['source@1'],authority_ref:'fixture:authority'});
 finish(l,assignment({task_id:'consumer',objective:'Consume passed rehearsal gate',required_gate_refs:['R1']}),'derived');
 const revision=assignment({task_id:'revision',objective:'Produce new source revision'});l.apply({type:'assign',assignment:revision,work_key:'revision'});l.apply({type:'dispatch',task_id:'revision'});const c=artifact(revision,'requirements_spec','source');c.artifact.revision='2';l.apply(c);l.apply({type:'result',result:result(revision,{output_refs:['source@2']})});
 l.apply({type:'supersede',artifact_ref:'source@1',new_ref:'source@2'});
 assert.equal(l.snapshot().gates.R1.verdict,'inconclusive');assert.equal(l.snapshot().tasks.consumer.invalidated,true);assert.equal(l.snapshot().artifacts['derived@1'].invalidated,true);
}finally{l.close();}});
