import { randomBytes, createHash } from 'node:crypto';
import { mkdir, writeFile, readFile, lstat, mkdtemp, rm, realpath } from 'node:fs/promises';
import path from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';
import assert from 'node:assert/strict';
import { sourceManifest } from './scaffold-manifest.mjs';
const root = fileURLToPath(new URL('../',import.meta.url));
const records = path.resolve(process.env.BORROWBENCH_RECORDS_DIR ?? path.resolve(root,'../../docs/pilot/evidence/containers'));
const pilotDocs=path.resolve(root,'../../docs/pilot')+path.sep;
if (!records.startsWith(pilotDocs)) throw new Error('Evidence directory must be inside project pilot documentation');
const sha = data => createHash('sha256').update(data).digest('hex');
export function fixtureMode(extra, target) {
  if (!extra.length) return {mode:'seed-empty-baseline'};
  assert.equal(target,'verify','Preserved fixture restaging is verify-only');
  assert.equal(extra.length,4,'Provide both prior receipt and its exact SHA256');
  assert.equal(extra[0],'--preserve-existing-fixture');
  assert.equal(extra[2],'--receipt-sha256');
  assert.match(extra[3],/^[a-f0-9]{64}$/);
  return {mode:'preserve-existing-fixture',receiptFile:extra[1],receiptSha256:extra[3]};
}
const fixtureSha256='a75bd7b8d2b09e3410821304913d16e5821bdd19d28d2b2d04b07fdffb1b2250';
export function validatePriorFixture(receipt,target,fixture) {
  assert.equal(receipt.target,`borrowbench-containers-${target}`,'Prior receipt target mismatch');
  assert.equal(receipt.fixtureId,'BB-FIXTURE-0.1');assert.equal(receipt.dataset,'baseline');
  assert.equal(receipt.fixture_sha256,fixtureSha256,'Prior fixture identity mismatch');
  assert.equal(fixture.fixtureId,receipt.fixtureId);assert.equal(typeof receipt.actionId,'string');assert(receipt.actionId);
  for(const check of ['account_ids_labels_roles_match','equipment_rows_exact_match','empty_loans_operations_events'])assert.equal(receipt.checks?.[check],true,'Prior initial seed was not verified');
}
async function evidenceFile(file,expectedHash) {
  const selected=path.resolve(file);assert(selected.startsWith(pilotDocs),'Use a retained pilot evidence receipt');
  assert.equal(await realpath(selected),selected,'Symlinked receipt path rejected');
  const info=await lstat(selected);assert(info.isFile()&&!info.isSymbolicLink());
  const bytes=await readFile(selected);assert.equal(sha(bytes),expectedHash,'Prior receipt/evidence hash mismatch');
  return {selected,bytes};
}
export async function fixturePlan(extra,target) {
  const plan=fixtureMode(extra,target);
  const bytes=await readFile(path.join(root,'database/fixtures/pilot-fixtures.json'));
  assert.equal(sha(bytes),fixtureSha256,'Frozen fixture file changed');
  const fixture=JSON.parse(bytes);
  if(plan.mode==='seed-empty-baseline')return {...plan,fixture};
  const prior=await evidenceFile(plan.receiptFile,plan.receiptSha256);const receipt=JSON.parse(prior.bytes);
  validatePriorFixture(receipt,target,fixture);
  // Retain and verify the original independently captured initial inventory/state too.
  for(const field of ['inventory_ref','state_ref']){
    assert(receipt[field]&&/^[a-f0-9]{64}$/.test(receipt[field].sha256));
    await evidenceFile(path.resolve(root,'../..',receipt[field].ref),receipt[field].sha256);
  }
  return {...plan,fixture,priorReceipt:{ref:path.relative(path.resolve(root,'../..'),prior.selected),sha256:plan.receiptSha256,actionId:receipt.actionId,observedAt:receipt.observed_at}};
}
export const inventorySql=`SELECT json_build_object(
 'accounts',(SELECT coalesce(json_agg(json_build_object('id',id,'displayLabel',display_label,'role',role,'subjectSha256',encode(sha256(convert_to(provider_subject,'UTF8')),'hex')) ORDER BY id),'[]'::json) FROM accounts),
 'equipment',(SELECT coalesce(json_agg(json_build_object('id',id,'inventoryCode',inventory_code,'name',name,'description',description,'maintenance',maintenance) ORDER BY id),'[]'::json) FROM equipment),
 'counts',json_build_object('accounts',(SELECT count(*) FROM accounts),'equipment',(SELECT count(*) FROM equipment),'loans',(SELECT count(*) FROM loans),'activeLoans',(SELECT count(*) FROM loans WHERE returned_at IS NULL),'events',(SELECT count(*) FROM audit_events),'operations',(SELECT count(*) FROM operations),'maintenance',(SELECT count(*) FROM equipment WHERE maintenance),'available',(SELECT count(*) FROM equipment e WHERE NOT maintenance AND NOT EXISTS(SELECT 1 FROM loans l WHERE l.equipment_id=e.id AND l.returned_at IS NULL))),
 'rowDigests',json_build_object(
 'accounts',(SELECT encode(sha256(convert_to(coalesce(json_agg(row_to_json(t) ORDER BY id)::text,'[]'),'UTF8')),'hex') FROM accounts t),
 'equipment',(SELECT encode(sha256(convert_to(coalesce(json_agg(row_to_json(t) ORDER BY id)::text,'[]'),'UTF8')),'hex') FROM equipment t),
 'loans',(SELECT encode(sha256(convert_to(coalesce(json_agg(row_to_json(t) ORDER BY id)::text,'[]'),'UTF8')),'hex') FROM loans t),
 'operations',(SELECT encode(sha256(convert_to(coalesce(json_agg(row_to_json(t) ORDER BY actor_id,key)::text,'[]'),'UTF8')),'hex') FROM operations t),
 'audit_events',(SELECT encode(sha256(convert_to(coalesce(json_agg(row_to_json(t) ORDER BY id)::text,'[]'),'UTF8')),'hex') FROM audit_events t)))`;
export async function readBusinessInventory(runCompose) {
  const output=await runCompose(['exec','-T','db','psql','-X','-v','ON_ERROR_STOP=1','-U','borrowbench','-d','borrowbench','-Atc',`BEGIN READ ONLY; ${inventorySql}; COMMIT;`]);
  // Ignore transaction command tags and require exactly one JSON inventory line.
  const lines=output.trim().split('\n').filter(line=>line.startsWith('{'));
  assert.equal(lines.length,1,'Expected one atomic read-only inventory');
  return {observedAt:new Date().toISOString(),...JSON.parse(lines[0])};
}
export function validateFixedIdentity(inventory,fixture) {
  const expectedAccounts=fixture.accounts.map(a=>({id:a.id,displayLabel:a.displayLabel,role:a.role,subjectSha256:sha(a.providerSubject)})).sort((a,b)=>a.id.localeCompare(b.id));
  const identity=e=>({id:e.id,inventoryCode:e.inventoryCode,name:e.name,description:e.description});
  const expectedEquipment=fixture.datasets.baseline.equipment.map(identity).sort((a,b)=>a.id.localeCompare(b.id));
  assert.deepEqual(inventory.accounts,expectedAccounts,'Fixed account identities differ from prior fixture');
  assert.deepEqual(inventory.equipment.map(identity),expectedEquipment,'Fixed equipment identities differ from prior fixture');
  assert.equal(inventory.counts.accounts,expectedAccounts.length);assert.equal(inventory.counts.equipment,expectedEquipment.length);
  for(const value of Object.values(inventory.counts))assert(Number.isSafeInteger(value)&&value>=0,'Invalid inventory count');
  for(const name of ['accounts','equipment','loans','operations','audit_events'])assert.match(inventory.rowDigests[name],/^[a-f0-9]{64}$/);
  return inventory;
}
export async function applyFixturePlan(plan,{readInventory,seedEmpty},preservedBefore=null) {
  if(plan.mode==='preserve-existing-fixture') {
    assert(preservedBefore,'Capture retained data before migration/setup');
    validateFixedIdentity(preservedBefore,plan.fixture);
    const after=validateFixedIdentity(await readInventory(),plan.fixture);
    assert.deepEqual(after.rowDigests,preservedBefore.rowDigests,'Business records changed during setup; preserve evidence and investigate');
    assert.deepEqual(after.counts,preservedBefore.counts,'Business inventory changed during setup');
    return {mode:plan.mode,seedExecuted:false,pristineBaseline:false,fixtureSha256,priorReceipt:plan.priorReceipt,before:preservedBefore,after};
  }
  assert.equal(plan.mode,'seed-empty-baseline');
  await seedEmpty(); // Existing loader remains the sole empty-schema guard and seed writer.
  const after=validateFixedIdentity(await readInventory(),plan.fixture);
  assert.equal(after.counts.loans,0);assert.equal(after.counts.events,0);assert.equal(after.counts.operations,0);
  return {mode:plan.mode,seedExecuted:true,pristineBaseline:true,fixtureSha256,after};
}
async function docker(args, env={}) {
  return new Promise((resolve,reject)=>{
    const child=spawn('docker',args,{cwd:root,env:{...process.env,...env},stdio:['ignore','pipe','pipe']});
    let out='',err=''; child.stdout.on('data',v=>out+=v);child.stderr.on('data',v=>{err+=v; if(args[0]==='build') process.stderr.write(v);});
    child.on('error',()=>reject(new Error('Docker unavailable')));
    child.on('exit',code=>code===0?resolve(out):reject(new Error(`Docker ${args[0]} failed${args[0]==='build'?`: ${err.slice(-4000)}`:''}`)));
  });
}
async function publish(prefix, data) {
  await mkdir(records,{recursive:true});
  const file=path.join(records,`${prefix}-${sha(JSON.stringify(data))}.json`);
  try {await writeFile(file,JSON.stringify(data,null,2)+'\n',{flag:'wx'});} catch(e){if(e.code!=='EEXIST')throw e;}
  return file;
}
async function build() {
  const source=await sourceManifest();
  const context=await mkdtemp(path.join(tmpdir(),'borrowbench-build-'));
  try {
    for(const entry of source.files) {
      const data=await readFile(path.join(root,entry.path));
      assert.equal(sha(data),entry.sha256,'Source changed during snapshot');
      await mkdir(path.dirname(path.join(context,entry.path)),{recursive:true});
      await writeFile(path.join(context,entry.path),data);
    }
    const images={};
    for(const service of ['api','web']) {
      const tag=`borrowbench-${service}:source-${source.source_sha256.slice(0,16)}`;
      console.log(`Building ${service} from frozen source ${source.source_sha256.slice(0,16)}…`);
      await docker(['build','--platform','linux/amd64','--target',service,'--label',`org.borrowbench.source=${source.source_sha256}`,'-f',path.join(context,'ops/Dockerfile'),'-t',tag,context]);
      images[service]=(await docker(['image','inspect',tag,'--format','{{.Id}}'])).trim();
    }
    const manifest={format:'borrowbench-container-release-v1',purpose:'local-container-test-only',source_sha256:source.source_sha256,source_files:source.files,images,platform:'linux/amd64',compose_sha256:source.files.find(f=>f.path==='ops/containers.yaml').sha256,schema_files:source.files.filter(f=>f.path.startsWith('database/migrations/'))};
    console.log(`Release manifest: ${await publish('release',manifest)}`);
  } finally {await rm(context,{recursive:true,force:true});}
}
async function release(file) {
  const selected=path.resolve(file);
  assert.equal(path.dirname(selected),records,'Use published release path');
  assert.match(path.basename(selected),/^release-[a-f0-9]{64}\.json$/);
  assert(!(await lstat(selected)).isSymbolicLink());
  const m=JSON.parse(await readFile(selected,'utf8'));
  assert.equal(path.basename(selected),`release-${sha(JSON.stringify(m))}.json`,'Release manifest altered');
  assert.equal(m.format,'borrowbench-container-release-v1');
  assert.equal(m.purpose,'local-container-test-only');
  assert.equal(m.compose_sha256,sha(await readFile(path.join(root,'ops/containers.yaml'))),'Compose changed; build a reviewed release');
  for(const service of ['api','web']) {
    assert.match(m.images[service],/^sha256:[a-f0-9]{64}$/);
    assert.equal((await docker(['image','inspect',m.images[service],'--format','{{index .Config.Labels "org.borrowbench.source"}}'])).trim(),m.source_sha256);
  }
  return m;
}
function settings(target,m) {
  assert(['verify','pilot'].includes(target),'Target must be verify or pilot');
  return {BB_RELEASE_ID:m?sha(JSON.stringify(m)):'unbound',BB_CONFIG_ID:m?sha(JSON.stringify({target,source:m.source_sha256,compose:m.compose_sha256,images:m.images,auth:'container-test'})):'unbound',BB_TARGET:target,BB_WEB_PORT:target==='verify'?'3200':'3300',BB_SECRET_DIR:path.join(root,'.local',`containers-${target}`),BB_API_IMAGE:m?.images.api??'unused',BB_WEB_IMAGE:m?.images.web??'unused'};
}
function compose(target,m,args) {
  return docker(['compose','--project-name',`borrowbench-containers-${target}`,'--file',path.join(root,'ops/containers.yaml'),...args],settings(target,m));
}
async function initialize(target) {
  const dir=settings(target).BB_SECRET_DIR;
  await mkdir(dir,{recursive:true,mode:0o700});
  const info=await lstat(dir);assert(info.isDirectory()&&!info.isSymbolicLink()&&(info.mode&0o077)===0,'Private directory required');
  for(const name of ['test-auth','db-password','api-db-password']) {
    const file=path.join(dir,name);
    // Files readable in containers; private host parent prevents other users traversing.
    try {await writeFile(file,randomBytes(32).toString('hex')+'\n',{flag:'wx',mode:0o444});} catch(e){if(e.code!=='EEXIST')throw e;}
    const stat=await lstat(file);assert(stat.isFile()&&!stat.isSymbolicLink()&&(stat.mode&0o222)===0,'Read-only secret file required');
  }
}
async function inspect(target,m) {
  const result={};
  for(const service of ['web','api','db']) {
    const id=(await compose(target,m,['ps','-q',service])).trim();assert(id,`${target} ${service} absent`);
    const raw=JSON.parse(await docker(['inspect',id,'--format','{{json .}}']));
    assert.equal(raw.State.Running,true);assert.equal(raw.State.Health.Status,'healthy');
    if(service!=='db')assert.equal(raw.Image,m.images[service]);
    const budget={web:[750000000,1073741824],api:[500000000,805306368],db:[500000000,1073741824]}[service];
    assert.equal(raw.HostConfig.NanoCpus,budget[0],'Container CPU budget mismatch');
    assert.equal(raw.HostConfig.Memory,budget[1],'Container memory budget mismatch');
    const ports=raw.NetworkSettings.Ports??{};
    if(service==='web')assert.deepEqual(ports['3000/tcp'],[{HostIp:'127.0.0.1',HostPort:settings(target).BB_WEB_PORT}]);
    else assert(Object.values(ports).every(p=>p===null),'API/database must not be published');
    const networks=Object.entries(raw.NetworkSettings.Networks).map(([name,n])=>({name,id:n.NetworkID}));
    for(const network of networks) {
      assert(network.name.startsWith(`borrowbench-containers-${target}_`));
      const edge=network.name===`borrowbench-containers-${target}_edge`;
      if(edge)assert.equal(service,'web','Only web may join the edge network');
      assert.equal((await docker(['network','inspect',network.id,'--format','{{.Internal}}'])).trim(),edge?'false':'true');
    }
    result[service]={id,image:raw.Image,limits:{nano_cpus:raw.HostConfig.NanoCpus,memory_bytes:raw.HostConfig.Memory},networks,volumes:raw.Mounts.filter(v=>v.Type==='volume').map(v=>v.Name),ports};
  }
  return result;
}
async function smoke(target) {
  const base=`http://localhost:${settings(target).BB_WEB_PORT}`;
  assert.match(await (await fetch(base)).text(),/Container test mode/);
  assert.equal((await fetch(`${base}/api/platform`)).status,401);
  for(const [id,label,role] of [['member-a','Member A','member'],['member-b','Member B','member'],['custodian','Custodian','custodian']]) {
    const response=await fetch(`${base}/local-session`,{method:'POST',headers:{origin:base},body:new URLSearchParams({account:id}),redirect:'manual'});
    assert.equal(response.status,303);
    const cookie=response.headers.getSetCookie().map(value=>value.split(';')[0]).join('; ');
    assert(cookie.startsWith(`borrowbench_${target}_test_account=`));
    const data=await fetch(`${base}/api/platform`,{headers:{cookie}});assert.equal(data.status,200);
    assert.deepEqual(await data.json(),{label,role,platform:'BorrowBench'});
    const other=target==='verify'?'pilot':'verify';
    assert.equal((await fetch(`${base}/api/platform`,{headers:{cookie:cookie.replace(`_${target}_`,`_${other}_`)}})).status,401);
  }
  assert.equal((await fetch(`${base}/local-session`,{method:'POST',headers:{origin:'https://untrusted.invalid'},body:new URLSearchParams({account:'custodian'})})).status,403);
  return {accounts:3,anonymous_denied:true,cross_target_cookie_denied:true,cross_origin_denied:true,database_marker:'BorrowBench'};
}
async function stage(target,file,extra=[]) {
  const plan=await fixturePlan(extra,target);
  const m=await release(file);
  const actionId=process.env.BORROWBENCH_ACTION_ID;
  assert(typeof actionId==='string'&&/^[A-Za-z0-9_-]{1,80}$/.test(actionId),'Bind a unique authorized BORROWBENCH_ACTION_ID');
  await mkdir(records,{recursive:true});
  const intentFile=path.join(records,`action-${actionId}.json`);
  const before=await compose(target,m,['ps','--all','--format','json']);
  await writeFile(intentFile,JSON.stringify({actionId,target,release_sha256:sha(JSON.stringify(m)),config_sha256:settings(target,m).BB_CONFIG_ID,source_sha256:m.source_sha256,phase:'intent',fixtureMode:plan.mode,priorFixtureReceipt:plan.priorReceipt??null,beforeContainers:before,created_at:new Date().toISOString()},null,2)+'\n',{flag:'wx'});

  if(target==='pilot') {
    const staged=JSON.parse(await readFile(path.join(records,`staged-${sha(JSON.stringify(m))}.json`),'utf8'));
    assert.equal(staged.release_sha256,sha(JSON.stringify(m)));
    await inspect('verify',m);await smoke('verify');
  }
  await initialize(target);
  await compose(target,m,['up','-d','--wait','--wait-timeout','90','db']);
  const activeApps=(await compose(target,m,['ps','--status','running','-q','api','web'])).trim();
  assert(!activeApps,'Stop this target application under its approved runbook before migration; no implicit service interruption');
  const readInventory=()=>readBusinessInventory(args=>compose(target,m,args));
  const preservedBefore=plan.mode==='preserve-existing-fixture'?validateFixedIdentity(await readInventory(),plan.fixture):null;
  if(preservedBefore)await publish('preserved-inventory-before',{actionId,target,priorReceipt:plan.priorReceipt,inventory:preservedBefore});
  await compose(target,m,['run','--rm','--no-deps','setup','migrate']);
  await compose(target,m,['run','--rm','--no-deps','setup','provision-role']);
  const fixtureDecision=await applyFixturePlan(plan,{readInventory,seedEmpty:()=>compose(target,m,['run','--rm','--no-deps','setup','load-baseline'])},preservedBefore);
  await publish('fixture-decision',{actionId,target,...fixtureDecision});
  await compose(target,m,['up','-d','--no-build','--wait','--wait-timeout','120','api','web']);
  const services=await inspect(target,m);const checks=await smoke(target);
  await compose(target,m,['exec','-T','api','node','ops/test-container-boundaries.mjs']);
  checks.api_key_and_role_denials=true;
  const receipt={actionId,target,config_sha256:settings(target,m).BB_CONFIG_ID,fixture:'BB-FIXTURE-0.1/baseline',fixtureDecision,runtime_database_role:'borrowbench_runtime',release_sha256:sha(JSON.stringify(m)),images:m.images,services,checks,verified_at:new Date().toISOString()};
  console.log(`PASS: ${target} isolated web/API/database; three synthetic accounts; same image IDs. Receipt: ${await publish(target,receipt)}`);
  if(target==='verify')await writeFile(path.join(records,`staged-${sha(JSON.stringify(m))}.json`),JSON.stringify(receipt,null,2)+'\n');
}
async function main() {
 const [command,reference,...extra]=process.argv.slice(2);
 assert(['build','stage','promote','status','stop'].includes(command),'Select a supported command');
 assert(command==='build'?!reference:Boolean(reference),'Provide the required release or target');
 assert(command==='stage'||!extra.length,'Fixture preservation options are supported only by verify stage');
 if(command==='stage')fixtureMode(extra,'verify');
 try {
  if(command==='build')await build();
  else if(command==='stage'||command==='promote')await stage(command==='stage'?'verify':'pilot',reference,extra);
  else if(command==='stop') {await compose(reference,null,['stop']);console.log(`${reference} stopped; volumes and secrets retained.`);}
  else console.log(await compose(reference,null,['ps','--format','table']));
 } catch(error) {console.error(`Container operation failed: ${error.message}`);process.exitCode=1;}
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))main().catch(()=>{console.error('Invalid container command/options.');process.exitCode=1;});
