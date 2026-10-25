import assert from 'node:assert/strict';
const hash=/^[a-f0-9]{64}$/;
const image=/^sha256:[a-f0-9]{64}$/;
export function validateOperation(m, action) {
 assert.equal(m.format,'borrowbench-operation-v1');
 assert.equal(m.action,action);assert(['verify','pilot'].includes(m.target));
 assert.equal(m.project,`borrowbench-containers-${m.target}`);
 assert.match(m.actionId,/^[A-Za-z0-9_-]{1,80}$/);
 assert.match(m.releaseSha256,hash);assert.match(m.configId,hash);assert.match(m.sourceSha256,hash);
 assert(m.authorityRef && typeof m.authorityRef.ref==='string');assert.match(m.authorityRef.sha256,hash);
 assert(Array.isArray(m.inputs)&&m.inputs.length>0);
 for(const ref of m.inputs){assert.equal(typeof ref.ref,'string');assert.match(ref.sha256,hash);}
 if(action==='observe'){
  assert.match(m.webContainerId,hash);assert.match(m.webImage,image);assert.equal(m.intervalMs,2000);assert.equal(m.timeoutMs,1000);assert.equal(m.failureThreshold,3);
  assert(Number.isInteger(m.durationSeconds)&&m.durationSeconds>=60&&m.durationSeconds<=900);
 } else if(action==='recover') {
  assert.match(m.apiContainerId,hash);assert.match(m.apiImage,image);assert.equal(m.approvedAction,'start_same_api');
 } else if(action==='prepare-migration') {
  assert.match(m.apiImage,image);assert.match(m.schemaBefore,hash);assert.match(m.schemaAfter,hash);
  assert(m.backupManifestRef);assert.match(m.backupManifestRef.sha256,hash);
 } else if(action==='restore') {
  assert.equal(m.target,'verify');assert.equal(m.disposable,true);
  assert.match(m.databaseContainerId,hash);assert.match(m.databaseImage,image);
  assert.match(m.destinationDatabase,/^bb_restore_[a-z0-9_]{1,40}$/);
  assert.match(m.backupSha256,hash);assert.match(m.schemaSha256,hash);
  assert.equal(m.backupFormat,'postgres-custom');assert(m.expectedInventory&&typeof m.expectedInventory==='object');
  for(const table of ['accounts','equipment','loans','operations','audit_events'])assert.match(m.expectedRowDigests?.[table]??'',hash);
 } else throw new Error('Unsupported operation');
 return m;
}
export function assertContainer(raw,m,service,imageId) {
 assert.equal(raw.Image,imageId);
 assert.equal(raw.Config.Labels['com.docker.compose.project'],m.project);
 assert.equal(raw.Config.Labels['com.docker.compose.service'],service);
 if(service==='api') assert(['no',''].includes(raw.HostConfig.RestartPolicy.Name),'Automatic restart must be disabled for attended recovery');
 if(service!=='db') {
  assert.equal(raw.Config.Labels['org.borrowbench.source'],m.sourceSha256);
  for(const pair of [`BORROWBENCH_RELEASE_ID=${m.releaseSha256}`,`BORROWBENCH_CONFIG_ID=${m.configId}`])assert(raw.Config.Env.includes(pair),'Runtime identity mismatch');
 }
}
