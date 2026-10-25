import assert from 'node:assert/strict';
import { spawnSync, spawn } from 'node:child_process';
import { mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { createHash, randomUUID } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
const id=`rehearsal-${randomUUID()}`;
const output=path.resolve(process.argv[2]??path.join(root,'docs/pilot/evidence/ledger',id));
mkdirSync(output,{recursive:true});
const stateDir=path.join(root,'runner/.state',id);mkdirSync(stateDir,{recursive:true,mode:0o700});
const database=path.join(stateDir,'ledger.sqlite');
const cli=path.join(root,'runner/cli.mjs');
const transcript=[],checks=[];let counter=0;
const hash=x=>createHash('sha256').update(JSON.stringify(x)).digest('hex');
function invoke(command, {reject=false}={}) {
  const input=path.join(stateDir,`command-${++counter}.json`);writeFileSync(input,JSON.stringify(command));
  const result=spawnSync(process.execPath,[cli,'--db',database,'apply',input],{encoding:'utf8',timeout:15000});
  if(result.error)throw result.error;
  const value=result.stdout.trim()?JSON.parse(result.stdout):{error:result.stderr.trim()};
  transcript.push({command,exit_code:result.status,response:value});
  if(reject)assert.notEqual(result.status,0,'Expected rejection');else assert.equal(result.status,0,result.stderr);
  return value;
}
function snapshot() {
  const result=spawnSync(process.execPath,[cli,'--db',database,'snapshot'],{encoding:'utf8',timeout:15000});
  assert.equal(result.status,0,result.stderr);return JSON.parse(result.stdout);
}
function taskState(task) {const t=snapshot().tasks[task];return t.status??t.state;}
function check(name,fn) {fn();checks.push({id:name,outcome:'pass'});}
const manifest={run_id:id,contract_version:'0.4.0',mode:'workflow_evaluation',rehearsal:true,
 objective:'Synthetic assisted-coordinator handoff rehearsal; no live actions',authorization_ref:'user-request:ledger-handoff-rehearsal',
 max_attempts:30,gates:{'R-input':['complete'],'R-quality':['correct','coverage'],'R-partial':['complete']},
 environment_context:{auth0:'deferred',accounts:['member-a','member-b','custodian'],live_actions:false}};
function assignment(task,role='testing',extra={}) {return {run_id:id,task_id:task,trace_id:`trace-${task}`,role,mode:'rehearsal',attempt:1,
 objective:`Synthetic ${task}`,scope:'Ledger bookkeeping only; no external action',baseline_refs:[],input_refs:[],expected_artifact_types:[],
 dependency_task_ids:[],required_gate_refs:[],allowed_tools:[],write_scope:['ledger-only'],authorization_refs:[manifest.authorization_ref],
 limits:{max_elapsed_ms:60000,max_cost:0,remaining_task_attempts:3,remaining_run_attempts:30},acceptance_checks:['synthetic-check'],...extra};}
function assign(task,role,extra={}) {const a=assignment(task,role,extra);invoke({type:'assign',assignment:a,work_key:task});return a;}
function dispatch(task) {const r=invoke({type:'dispatch',task_id:task});return r.assignment??r;}
function result(a,extra={}) {return {run_id:id,task_id:a.task_id,trace_id:a.trace_id,role:a.role,attempt:a.attempt,
 consumed_refs:[...new Set([...a.baseline_refs,...a.input_refs])],status:'succeeded',summary:'Synthetic rehearsal result',output_refs:[],
 checks:[{check_id:'synthetic-check',subject:'synthetic-fixture',outcome:'pass',evidence_ref:'rehearsal:fixture'}],issues:[],next_route:'coordinator',usage:{elapsed_ms:null,cost:null,reason:'No model execution; synthetic fixture'},checkpoint_ref:null,missing_outputs:[],...extra};}
function artifact(a,type,name,revision='1',extra={}) {
 const payload={synthetic:true,purpose:'Rehearsal fixture, not a complete real role deliverable',name,revision};
 const art={artifact_id:name,type,revision,producer_role:a.role,run_id:id,task_id:a.task_id,input_refs:[...a.input_refs],requirement_ids:[],
 traceability_reason:'Workflow bookkeeping rehearsal under the user request',content_ref:`ledger:${name}@${revision}`,content_hash:hash(payload),completeness:'complete',missing_fields:[],...extra};
 invoke({type:'artifact',attempt:a.attempt,artifact:art,payload});return `${name}@${revision}`;
}
const passed=(check_id)=>({check_id,subject:'synthetic-fixture',outcome:'pass',evidence_ref:'rehearsal:fixture'});
try {
 invoke({type:'init',manifest});
 check('real-gate-ids-rejected',()=>invoke({type:'gate',gate_id:'G1',checks:[passed('complete')],artifact_refs:[],authority_ref:manifest.authorization_ref},{reject:true}));
 assign('requirements','requirements',{expected_artifact_types:['requirements_spec']});
 const req=dispatch('requirements');const base=artifact(req,'requirements_spec','requirements');
 invoke({type:'result',result:result(req,{output_refs:[base]})});
 invoke({type:'gate',gate_id:'R-input',checks:[passed('complete')],artifact_refs:[base],authority_ref:manifest.authorization_ref});
 check('normal-handoff-and-gate',()=>assert.equal(taskState('requirements'),'succeeded'));
 assign('interrupted','testing',{input_refs:[base],dependency_task_ids:['requirements'],required_gate_refs:['R-input']});
 // A separate writer commits dispatch+intent, announces completion, then is killed.
 const dispatchFile=path.join(stateDir,'interrupt-dispatch.json');
 writeFileSync(dispatchFile,JSON.stringify({type:'dispatch',task_id:'interrupted'}));
 const action={type:'action',task_id:'interrupted',attempt:1,action_id:'action-1',idempotency_key:'synthetic-once',target:'rehearsal-only',baseline_ref:base,checkpoint_ref:'rehearsal:before-action'};
 const childCode=`import {Ledger} from ${JSON.stringify(new URL('./ledger.mjs',import.meta.url).href)}; const l=new Ledger(${JSON.stringify(database)}); const a=l.apply(${JSON.stringify({type:'dispatch',task_id:'interrupted'})}); l.apply(${JSON.stringify(action)}); console.log('COMMITTED'); setInterval(()=>{},1000);`;
 const child=spawn(process.execPath,['--input-type=module','-e',childCode],{stdio:['ignore','pipe','pipe']});
 await new Promise((resolve,reject)=>{let seen='';const timer=setTimeout(()=>{child.kill('SIGKILL');reject(new Error('Interrupt child timeout'));},15000);
 child.stdout.on('data',chunk=>{seen+=chunk;if(seen.includes('COMMITTED')){clearTimeout(timer);child.kill('SIGKILL');}});
 child.on('error',reject);child.on('exit',(code,signal)=>{clearTimeout(timer);signal==='SIGKILL'&&seen.includes('COMMITTED')?resolve():reject(new Error(`Interrupted writer exited early ${code}`));});});
 transcript.push({method:'separate-process dispatch+action commit then SIGKILL',action,signal:'SIGKILL'});
 check('durable-intent-after-process-kill',()=>assert(snapshot().actions['action-1']));
 check('action-intent-idempotency',()=>assert.equal(invoke(action).duplicate,true));
 check('conflicting-action-id-rejected',()=>invoke({...action,target:'different-target'},{reject:true}));
 check('duplicate-idempotency-key-rejected',()=>invoke({...action,action_id:'action-other'},{reject:true}));
 invoke({type:'settle',task_id:'interrupted',attempt:1,reason:'Process killed after committed intent; simulated external outcome unknown',uncertain:true,progress:false});
 check('uncertain-action-blocks-retry',()=>invoke({type:'dispatch',task_id:'interrupted'},{reject:true}));
 invoke({type:'reconcile',action_id:'action-1',outcome:'not_applied',evidence_ref:'rehearsal:observer-confirms-no-real-action'});
 const retry=dispatch('interrupted');assert.equal(retry.attempt,2);
 const old=result({...retry,attempt:1});invoke({type:'result',result:old});
 check('stale-result-cannot-overwrite-retry',()=>assert.equal(taskState('interrupted'),'running'));
 invoke({type:'result',result:result(retry)});
 check('retry-completes-after-reconciliation',()=>assert.equal(taskState('interrupted'),'succeeded'));
 assign('verification','testing',{input_refs:[base],expected_artifact_types:['verification_report']});
 const qa=dispatch('verification'),report=artifact(qa,'verification_report','verification');
 invoke({type:'result',result:result(qa,{output_refs:[report],checks:[passed('synthetic-check'),{...passed('correct'),outcome:'fail'}]})});
 invoke({type:'gate',gate_id:'R-quality',checks:[passed('synthetic-check'),{...passed('correct'),outcome:'fail'}],artifact_refs:[report],authority_ref:manifest.authorization_ref});
 check('task-success-does-not-pass-quality-gate',()=>{assert.equal(taskState('verification'),'succeeded');assert.equal(snapshot().gates['R-quality'].verdict,'fail');});
 assign('downstream','deployment',{dependency_task_ids:['verification'],required_gate_refs:['R-quality']});
 check('failed-gate-blocks-downstream',()=>invoke({type:'dispatch',task_id:'downstream'},{reject:true}));
 assign('escalation','testing',{expected_artifact_types:['test_plan']});
 const escalation=dispatch('escalation'),decision=artifact(escalation,'decision_request','question');
 invoke({type:'result',result:result(escalation,{status:'needs_decision',output_refs:[decision],missing_outputs:[{type:'test_plan',reason:'Synthetic ambiguity',next_action:'Coordinator resolves fixture decision'}]})});
 check('unplanned-decision-escalation-preserved',()=>assert.equal(taskState('escalation'),'needs_decision'));
 assign('stale-artifact','testing',{expected_artifact_types:['test_plan']});
 const staleProducer=dispatch('stale-artifact');
 invoke({type:'settle',task_id:'stale-artifact',attempt:1,reason:'Simulated missing response',uncertain:false,progress:false});
 dispatch('stale-artifact');
 check('stale-artifact-attempt-rejected',()=>{
   const payload={fixture:true};const art={artifact_id:'late-plan',type:'test_plan',revision:'1',producer_role:'testing',run_id:id,task_id:'stale-artifact',input_refs:[],requirement_ids:[],traceability_reason:'fixture',content_ref:'ledger:late-plan@1',content_hash:hash(payload),completeness:'complete',missing_fields:[]};
   invoke({type:'artifact',attempt:staleProducer.attempt,artifact:art,payload},{reject:true});
   assert.equal(taskState('stale-artifact'),'running');
 });
 assign('malformed','testing');const malformed=dispatch('malformed');
 invoke({type:'result',result:{...result(malformed),status:'cancelled'}});
 check('malformed-current-handoff-settled',()=>assert.equal(taskState('malformed'),'failed'));
 assign('owner','architecture',{expected_artifact_types:['architecture_package']});const owner=dispatch('owner');
 check('wrong-artifact-owner-rejected',()=>{
  const payload={synthetic:true};invoke({type:'artifact',attempt:owner.attempt,artifact:{artifact_id:'wrong-owner',type:'brand_package',revision:'1',producer_role:'architecture',run_id:id,task_id:'owner',input_refs:[],requirement_ids:[],traceability_reason:'fixture',content_ref:'ledger:wrong-owner@1',content_hash:hash(payload),completeness:'complete',missing_fields:[]},payload},{reject:true});
 });
 const partial=artifact(owner,'architecture_package','partial','1',{completeness:'partial',missing_fields:['domain_contracts']});
 check('partial-unreturned-artifact-cannot-pass-gate',()=>invoke({type:'gate',gate_id:'R-partial',checks:[passed('complete')],artifact_refs:[partial],authority_ref:manifest.authorization_ref},{reject:true}));
 assign('budget','testing');for(let i=1;i<=2;i++){dispatch('budget');invoke({type:'settle',task_id:'budget',attempt:i,reason:'No progress',uncertain:false,progress:false});}
 check('two-no-progress-attempts-stop',()=>invoke({type:'dispatch',task_id:'budget'},{reject:true}));
 invoke({type:'assign',assignment:assignment('renamed'),work_key:'budget'});
 check('rename-cannot-reset-work-budget',()=>invoke({type:'dispatch',task_id:'renamed'},{reject:true}));
 assign('three-attempts','testing',{expected_artifact_types:['test_plan']});for(let i=1;i<=3;i++){const a=dispatch('three-attempts');const ref=artifact(a,'test_plan','budget-plan',String(i));invoke({type:'result',result:result(a,{status:'failed',output_refs:[ref]})});}
 check('three-total-attempt-ceiling',()=>invoke({type:'dispatch',task_id:'three-attempts'},{reject:true}));
 assign('replacement','requirements',{expected_artifact_types:['requirements_spec']});const replacement=dispatch('replacement');const revised=artifact(replacement,'requirements_spec','requirements','2');
 invoke({type:'result',result:result(replacement,{output_refs:[revised]})});
 assign('gate-dependent','testing',{required_gate_refs:['R-input']});
 const runningGate=dispatch('gate-dependent');
 invoke({type:'gate',gate_id:'R-input',checks:[{...passed('complete'),outcome:'fail'}],artifact_refs:[base],authority_ref:manifest.authorization_ref});
 check('changed-gate-invalidates-running-dependent',()=>assert.equal(taskState('gate-dependent'),'blocked'));
 invoke({type:'result',result:result(runningGate)});
 check('late-result-after-gate-change-archived',()=>assert.equal(taskState('gate-dependent'),'blocked'));
 invoke({type:'supersede',artifact_ref:base,new_ref:revised});
 check('upstream-change-invalidates-gate',()=>assert.notEqual(snapshot().gates['R-input'].verdict,'pass'));
 invoke({type:'cancel',reason:'Rehearsal complete; cancel remaining synthetic tasks'});
 check('cancel-stops-dispatch',()=>invoke({type:'dispatch',task_id:'owner'},{reject:true}));
 const final=snapshot();
 writeFileSync(path.join(output,'commands-and-results.json'),JSON.stringify(transcript,null,2)+'\n');
 writeFileSync(path.join(output,'ledger-snapshot.json'),JSON.stringify(final,null,2)+'\n');
 const summary={rehearsal:true,run_id:id,node:process.version,observed_at:new Date().toISOString(),checks,
 database:path.relative(root,database),no_real_actions:true,auth0:'deferred',application_accounts_unchanged:true,
 model_usage:{tokens:null,cost:null,reason:'No model invocations in deterministic subprocess rehearsal'},snapshot_sha256:hash(final)};
 writeFileSync(path.join(output,'summary.json'),JSON.stringify(summary,null,2)+'\n');
 console.log(JSON.stringify({passed:checks.length,evidence:output,database},null,2));
} catch(error) {
 writeFileSync(path.join(output,'failed-transcript.json'),JSON.stringify({error:error.message,checks,transcript},null,2)+'\n');throw error;
}
