// Operator entry point: this file never runs at application startup.
import { readFile,open,mkdir,lstat,realpath } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { spawn } from 'node:child_process';
import assert from 'node:assert/strict';
import { validateOperation,assertContainer } from './operation-contract.mjs';
const root=fileURLToPath(new URL('../../../',import.meta.url));
const appRoot=fileURLToPath(new URL('../',import.meta.url));
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const [mode,filename,...extra]=process.argv.slice(2);
assert(['validate','execute'].includes(mode)&&filename&&!extra.length,'Usage: node ops/operations.mjs validate|execute <operation.json>');
async function publicFile(name){
 const p=path.resolve(root,name);assert(p.startsWith(path.join(root,'docs/pilot/') ),'Manifest inputs must be retained pilot evidence');
 assert(!p.split(path.sep).some(s=>s==='.local'||s.startsWith('.env')));assert((await lstat(p)).isFile()&&!(await lstat(p)).isSymbolicLink());assert.equal(await realpath(p),p,'Symlinked evidence path rejected');return p;
}
const manifestFile=await publicFile(filename);const bytes=await readFile(manifestFile);const m=JSON.parse(bytes);validateOperation(m,m.action);
for(const input of [m.authorityRef,...m.inputs,...(m.backupManifestRef?[m.backupManifestRef]:[])])assert.equal(sha(await readFile(await publicFile(input.ref))),input.sha256,'Input identity mismatch');
if(mode==='validate'){console.log(JSON.stringify({action:m.action,actionId:m.actionId,status:'valid',execution:'not_run'}));process.exit(0);}
const dir=path.join(path.dirname(manifestFile),'operation-records');await mkdir(dir,{recursive:true});
const journal=await open(path.join(dir,`${m.actionId}.jsonl`),'ax',0o600).catch(()=>{throw new Error('Action already has a journal; reconcile existing evidence and actual target before a separately approved continuation');});
async function record(event){await journal.writeFile(JSON.stringify({time:new Date().toISOString(),actionId:m.actionId,manifestSha256:sha(bytes),...event})+'\n');await journal.sync();}
function docker(args,{timeoutMs=10000,inputFile,outputFile}={}){
 return new Promise(async(resolve,reject)=>{
  let inFd,outFd;
  try {
   if(inputFile)inFd=await open(inputFile,'r');if(outputFile)outFd=await open(outputFile,'wx',0o600);
   const child=spawn('docker',args,{cwd:appRoot,stdio:[inFd?.fd??'ignore',outFd?.fd??'pipe','pipe']});
   let stdout='';child.stdout?.on('data',b=>{stdout+=b;if(stdout.length>1024*1024)child.kill('SIGTERM');});child.stderr?.resume();
   const timer=setTimeout(()=>child.kill('SIGKILL'),timeoutMs);
   child.once('error',async()=>{clearTimeout(timer);await inFd?.close();await outFd?.close();reject(new Error('Operator transport unavailable'));});
   child.once('exit',async(code,signal)=>{clearTimeout(timer);await inFd?.close();await outFd?.close();code===0?resolve(stdout):reject(new Error(signal?'Operator transport timed out':'Operator command failed'));});
  }catch(error){await inFd?.close();await outFd?.close();reject(error);}
 });
}
async function inspect(id,service,image){const raw=JSON.parse(await docker(['inspect',id,'--format','{{json .}}']));assertContainer(raw,m,service,image);return raw;}
try{
 await record({event:'validated_intent',action:m.action,target:m.target,release:m.releaseSha256,config:m.configId});
 if(m.action==='observe'){
  const raw=await inspect(m.webContainerId,'web',m.webImage);assert(raw.State.Running);
  const start=performance.now();const slots=Math.floor(m.durationSeconds*1000/2000);let consecutive=0;let healthyStart=null;
  for(let i=0;i<slots;i++){
   const scheduled=i*2000;const remaining=scheduled-(performance.now()-start);if(remaining>0)await new Promise(r=>setTimeout(r,remaining));
   const dispatched=performance.now()-start;
   if(dispatched-scheduled>=2000){consecutive++;healthyStart=null;await record({event:'coverage_gap',slot:i,scheduledMs:scheduled,dispatchMs:dispatched});if(consecutive===3)await record({event:'alert',deduplicationKey:`${m.actionId}:readiness`,consecutiveFailures:3,reason:'coverage_gap'});continue;}
   let status=null,requestId=null,transport='ok';
   try{
    const output=await docker(['exec',m.webContainerId,'node','-e',"fetch('http://api:3001/health/ready',{cache:'no-store',signal:AbortSignal.timeout(1000)}).then(async r=>{await r.arrayBuffer();console.log(JSON.stringify({status:r.status,requestId:r.headers.get('x-request-id')}))}).catch(()=>process.exit(2))"],{timeoutMs:1000});
    const sample=JSON.parse(output);status=sample.status;if(typeof sample.requestId==='string'&&/^[a-f0-9-]{36}$/.test(sample.requestId))requestId=sample.requestId;
   }catch{transport='timeout_or_transport_error';}
   const completed=performance.now()-start,healthy=status===200&&transport==='ok';
   if(healthy){consecutive=0;healthyStart??=completed;}else{consecutive++;healthyStart=null;}
   await record({event:'observer_sample',slot:i,scheduledMs:scheduled,dispatchMs:dispatched,completionMs:completed,status,requestId,transport,healthy,healthyContinuousMs:healthyStart===null?0:completed-healthyStart});
   if(consecutive===3)await record({event:'alert',deduplicationKey:`${m.actionId}:readiness`,consecutiveFailures:3});
  }
  await record({event:'observation_complete',durationMs:performance.now()-start});
 }else if(m.action==='recover'){
  const raw=await inspect(m.apiContainerId,'api',m.apiImage);
  await record({event:'reconciled',running:raw.State.Running,image:raw.Image});
  if(!raw.State.Running){await record({event:'start_dispatch'});await docker(['start',m.apiContainerId]);}
  const after=await inspect(m.apiContainerId,'api',m.apiImage);assert(after.State.Running);
  await record({event:'action_completed',running:true,recoveryVerdict:'await independent readiness,180s restoration and60s sustained confirmation'});
 }else if(m.action==='prepare-migration'){
  // The stage driver binds the candidate/config and uses its dedicated setup service.
  const backupManifest=JSON.parse(await readFile(await publicFile(m.backupManifestRef.ref)));
  assert.equal(backupManifest.target,m.target);assert.equal(backupManifest.project,m.project);assert.equal(backupManifest.schemaSha256,m.schemaBefore);
  assert.equal(sha(await readFile(await publicFile(backupManifest.backupRef))),backupManifest.backupSha256);
  assert.equal(process.env.BB_TARGET,m.target);assert.equal(process.env.BB_API_IMAGE,m.apiImage);
  assert.equal(process.env.BB_RELEASE_ID,m.releaseSha256);assert.equal(process.env.BB_CONFIG_ID,m.configId);
  const args=['compose','--project-name',m.project,'--file',path.join(appRoot,'ops/containers.yaml')];
  const ledger=async()=>{
   const out=await docker([...args,'exec','-T','db','psql','-U','borrowbench','-d','borrowbench','-Atc',"SELECT coalesce(string_agg(name,E'\\n' ORDER BY id),'') FROM pgmigrations"]);
   return sha(out.trim());
  };
  assert.equal(await ledger(),m.schemaBefore,'Unexpected schema ledger before migration');
  await record({event:'migration_dispatch',schemaBefore:m.schemaBefore,expectedSchemaAfter:m.schemaAfter});
  await docker([...args,'run','--rm','--no-deps','setup','migrate'],{timeoutMs:60000});
  const after=await ledger();assert.equal(after,m.schemaAfter,'Unexpected schema ledger after migration');
  await record({event:'migration_complete',schemaAfter:after});
 }else{
  const raw=await inspect(m.databaseContainerId,'db',m.databaseImage);assert(raw.State.Running);
  const backup=await publicFile(m.backupRef);assert.equal(sha(await readFile(backup)),m.backupSha256);
  // Never overwrite an existing database. A unique disposable database name is mandatory.
  const exists=(await docker(['exec',m.databaseContainerId,'psql','-U','borrowbench','-d','postgres','-Atc',`SELECT 1 FROM pg_database WHERE datname='${m.destinationDatabase}'`])).trim();assert.equal(exists,'','Restore destination already exists');
  await record({event:'restore_dispatch',destinationDatabase:m.destinationDatabase,backupSha256:m.backupSha256});
  await docker(['exec',m.databaseContainerId,'createdb','-U','borrowbench','--template=template0',m.destinationDatabase]);
  await docker(['exec','-i',m.databaseContainerId,'pg_restore','-U','borrowbench','--dbname='+m.destinationDatabase,'--single-transaction','--exit-on-error','--no-owner','--no-privileges'],{inputFile:backup,timeoutMs:60000});
  const inventory=JSON.parse(await docker(['exec',m.databaseContainerId,'psql','-U','borrowbench','-d',m.destinationDatabase,'-Atc',"SELECT json_build_object('accounts',(SELECT count(*) FROM accounts),'equipment',(SELECT count(*) FROM equipment),'loans',(SELECT count(*) FROM loans),'operations',(SELECT count(*) FROM operations),'audit_events',(SELECT count(*) FROM audit_events),'active_loans',(SELECT count(*) FROM loans WHERE returned_at IS NULL),'invalid_states',(SELECT count(*) FROM equipment e JOIN loans l ON l.equipment_id=e.id WHERE e.maintenance AND l.returned_at IS NULL),'invalid_times',(SELECT count(*) FROM loans WHERE returned_at<checked_out_at),'unresolved_operations',(SELECT count(*) FROM operations WHERE outcome IS NULL OR completed_at IS NULL OR http_status IS NULL))"]));
  assert.deepEqual(inventory,m.expectedInventory,'Restored inventory differs from backup manifest');
  assert.equal(inventory.invalid_states,0);assert.equal(inventory.invalid_times,0);assert.equal(inventory.unresolved_operations,0);
  const schema=(await docker(['exec',m.databaseContainerId,'psql','-U','borrowbench','-d',m.destinationDatabase,'-Atc',"SELECT coalesce(string_agg(name,E'\\n' ORDER BY id),'') FROM pgmigrations"])).trim();assert.equal(sha(schema),m.schemaSha256);
  const rowDigests={};
  for(const table of ['accounts','equipment','loans','operations','audit_events']){
    const order=table==='operations'?'actor_id,key':'id';
    const rows=(await docker(['exec',m.databaseContainerId,'psql','-U','borrowbench','-d',m.destinationDatabase,'-Atc',`SELECT coalesce(json_agg(row_to_json(t) ORDER BY ${order})::text,'[]') FROM ${table} t`])).trim();
    rowDigests[table]=sha(rows);
  }
  assert.deepEqual(rowDigests,m.expectedRowDigests,'Restored IDs/rows/receipts/audits differ from backup');
  await record({event:'restore_complete',inventory,rowDigests,destinationDatabase:m.destinationDatabase,independentSemanticVerification:'required'});
 }
}catch(error){await record({event:'operation_failed',reason:'Target,command or postcondition failed; reconcile journal and actual state before retry'});process.exitCode=1;}
finally{await journal.close();}
