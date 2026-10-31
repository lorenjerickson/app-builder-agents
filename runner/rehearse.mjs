// Local synthetic subprocess exercise. Never touches a pilot or invokes a model.
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { manifest, assignment, artifact, result } from './fixtures.mjs';
const output=fileURLToPath(new URL(`./.state/rehearsal-${randomUUID()}/`,import.meta.url));
mkdirSync(output,{recursive:true,mode:0o700});
const database=join(output,'ledger.sqlite'),cli=fileURLToPath(new URL('./cli.mjs',import.meta.url));
const transcript=[];let counter=0;
function invoke(command){const input=join(output,`command-${++counter}.json`);writeFileSync(input,JSON.stringify(command));const r=spawnSync(process.execPath,[cli,'--db',database,'apply',input],{encoding:'utf8',timeout:15000});transcript.push({command,status:r.status,stdout:r.stdout,stderr:r.stderr});assert.equal(r.status,0,r.stderr);return JSON.parse(r.stdout);}
try {
 const a=assignment();invoke({type:'init',manifest:manifest()});invoke({type:'assign',assignment:a,work_key:a.task_id});invoke({type:'dispatch',task_id:a.task_id});invoke(artifact(a));invoke({type:'result',result:result(a,{output_refs:['example-requirements@1']})});
 const r=spawnSync(process.execPath,[cli,'--db',database,'snapshot'],{encoding:'utf8',timeout:15000});assert.equal(r.status,0,r.stderr);const saved=JSON.parse(r.stdout);assert.equal(saved.tasks[a.task_id].status,'succeeded');assert.equal(saved.events.length,5);
 writeFileSync(join(output,'snapshot.json'),r.stdout);writeFileSync(join(output,'summary.json'),JSON.stringify({synthetic:true,no_role_execution:true,checks:2,model_usage:{tokens:null,cost:null,reason:'No model invoked'},node:process.version}));console.log(JSON.stringify({output,database,checks:2}));
}finally{writeFileSync(join(output,'transcript.json'),JSON.stringify(transcript,null,2));}
