import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {validateOperation,assertContainer} from '../../ops/operation-contract.mjs';
const h='a'.repeat(64),image='sha256:'+h;
const common={format:'borrowbench-operation-v1',actionId:'fixture-only',target:'verify',project:'borrowbench-containers-verify',releaseSha256:h,configId:h,sourceSha256:h,authorityRef:{ref:'docs/pilot/authority.json',sha256:h},inputs:[{ref:'docs/pilot/candidate.json',sha256:h}]};
test('operator manifest rejects wrong targets, unbounded observer and missing authority',()=>{
 const observer={...common,action:'observe',webContainerId:h,webImage:image,intervalMs:2000,timeoutMs:1000,failureThreshold:3,durationSeconds:900};
 assert.deepEqual(validateOperation(observer,'observe'),observer);
 for(const patch of [{target:'dev'},{project:'unrelated'},{authorityRef:null},{durationSeconds:901},{timeoutMs:10000},{intervalMs:1000},{webImage:'latest'},{actionId:'../escape'}])assert.throws(()=>validateOperation({...observer,...patch},'observe'));
});
test('recovery binds exact same image/container/config and disallows automatic restart',()=>{
 const m={...common,action:'recover',apiContainerId:h,apiImage:image,approvedAction:'start_same_api'};validateOperation(m,'recover');
 const raw={Image:image,Config:{Labels:{'com.docker.compose.project':m.project,'com.docker.compose.service':'api','org.borrowbench.source':h},Env:[`BORROWBENCH_RELEASE_ID=${h}`,`BORROWBENCH_CONFIG_ID=${h}`]},HostConfig:{RestartPolicy:{Name:'no'}}};
 assertContainer(raw,m,'api',image);
 assert.throws(()=>assertContainer({...raw,Image:'sha256:'+'b'.repeat(64)},m,'api',image));
 assert.throws(()=>assertContainer({...raw,HostConfig:{RestartPolicy:{Name:'always'}}},m,'api',image));
 assert.throws(()=>assertContainer({...raw,Config:{...raw.Config,Env:[]}},m,'api',image));
});
test('restore can only name new disposable verify database and must bind row digests',()=>{
 const m={...common,action:'restore',databaseContainerId:h,databaseImage:image,disposable:true,destinationDatabase:'bb_restore_case1',backupSha256:h,schemaSha256:h,backupFormat:'postgres-custom',expectedInventory:{},expectedRowDigests:Object.fromEntries(['accounts','equipment','loans','operations','audit_events'].map(t=>[t,h]))};
 validateOperation(m,'restore');
 for(const patch of [{target:'pilot',project:'borrowbench-containers-pilot'},{destinationDatabase:'borrowbench'},{disposable:false},{expectedRowDigests:{}}])assert.throws(()=>validateOperation({...m,...patch},'restore'));
});
test('container secret mounts and deadlines preserve accepted boundaries',()=>{
 const compose=readFileSync(new URL('../../ops/containers.yaml',import.meta.url),'utf8');
 const api=compose.split('  api:\n')[1].split('  setup:\n')[0];const web=compose.split('  web:\n')[1].split('\nsecrets:')[0];
 assert.match(api,/secrets: \[test_auth, api_db_password\]/);assert.doesNotMatch(api,/secrets:.*\bdb_password\b/);assert.doesNotMatch(web,/db_password/);
 const transport=readFileSync(new URL('../../apps/web/app/api/v1/[...path]/route.ts',import.meta.url),'utf8');assert.match(transport,/AbortSignal.timeout\(5000\)/);
 const ui=readFileSync(new URL('../../apps/web/app/components/product.tsx',import.meta.url),'utf8');assert.doesNotMatch(ui,/AbortSignal.timeout\((10000|12000)\)/);
});
