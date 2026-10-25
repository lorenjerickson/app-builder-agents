import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { Ledger } from './ledger.mjs';
const fixture=name=>JSON.parse(readFileSync(new URL(`./examples/${name}.json`,import.meta.url),'utf8'));
function initialized(max=20) {const l=new Ledger(':memory:');const c=fixture('init');c.manifest.max_attempts=max;l.apply(c);return l;}
test('run limit persists across attempts and cannot be bypassed by failed dispatch',()=>{
 const l=initialized(1);try {
  l.apply(fixture('assign'));l.apply(fixture('dispatch'));
  l.apply({type:'settle',task_id:'requirements-fixture',attempt:1,reason:'Synthetic timeout',uncertain:false,progress:false});
  assert.throws(()=>l.apply(fixture('dispatch')),/run attempts exhausted/);
  assert.equal(l.snapshot().attempts.length,1);
  assert.equal(l.snapshot().events.at(-1).type,'command_rejected');
 } finally {l.close();}
});
test('hash mismatch is rejected atomically and audited without recording payload',()=>{
 const l=initialized();try {
  l.apply(fixture('assign'));l.apply(fixture('dispatch'));
  const bad=fixture('artifact');bad.artifact.content_hash='0'.repeat(64);
  assert.throws(()=>l.apply(bad),/content_hash mismatch/);
  const s=l.snapshot();assert.deepEqual(s.artifacts,{});assert.equal(s.tasks['requirements-fixture'].status,'running');
  assert.equal(s.events.at(-1).type,'command_rejected');assert(!JSON.stringify(s.events.at(-1)).includes('Example only'));
 }finally{l.close();}
});
test('missing mandatory checks are inconclusive; not-applicable requires policy',()=>{
 const l=initialized();try {
  for(const step of ['assign','dispatch','artifact','result'])l.apply(fixture(step));
  const gate=fixture('gate');gate.checks=[];
  assert.equal(l.apply(gate).verdict,'inconclusive');
  gate.checks=[{check_id:'handoff-complete',subject:'fixture',outcome:'not_applicable',evidence_ref:'fixture'}];
  assert.throws(()=>l.apply(gate),/policy_ref/);
  assert.equal(l.snapshot().gates.R1.verdict,'inconclusive');
 }finally{l.close();}
});
