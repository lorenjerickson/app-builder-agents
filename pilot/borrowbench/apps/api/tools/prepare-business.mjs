// Development-authored, Deployment-executed. Never invoked by application startup.
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import pg from 'pg';
const [action, target, dataset] = process.argv.slice(2);
if (!['provision-role','load-fixture'].includes(action) || !['verify','pilot'].includes(target)
 || process.env.BORROWBENCH_ENV !== target || process.env.BORROWBENCH_TEST_ONLY !== '1') throw new Error('Explicit isolated target required');
const connectionString=process.env.BORROWBENCH_ADMIN_DATABASE_URL;
if (!connectionString) throw new Error('Operator database reference required');
const url=new URL(connectionString);
const loopbackPort=target==='verify'?'55433':'55434';
if (url.pathname!=='/borrowbench' || !((url.hostname==='db' && (!url.port || url.port==='5432')) ||
 (url.hostname==='127.0.0.1' && url.port===loopbackPort))) throw new Error('Target does not match isolated database boundary');
const client=new pg.Client({connectionString,connectionTimeoutMillis:2000,statement_timeout:3000});
try {
 await client.connect();
 await client.query('BEGIN');
 await client.query("SET LOCAL lock_timeout='2s'");
 await client.query("SELECT pg_advisory_xact_lock(hashtext('borrowbench-business-setup'))");
 if (action==='provision-role') {
  if (dataset!==undefined) throw new Error('Unexpected argument');
  const password=process.env.BORROWBENCH_API_DATABASE_PASSWORD;
  if (!password || password.length<32 || /\s/.test(password)) throw new Error('Dedicated runtime password required');
  const role=(await client.query("SELECT rolsuper,rolcreatedb,rolcreaterole,rolbypassrls FROM pg_roles WHERE rolname='borrowbench_runtime'")).rows[0];
  if (role && Object.values(role).some(Boolean)) throw new Error('Existing runtime role has elevated privileges');
  const literal=(await client.query('SELECT quote_literal($1) AS value',[password])).rows[0].value;
  if (!role) await client.query(`CREATE ROLE borrowbench_runtime LOGIN NOINHERIT NOSUPERUSER NOCREATEDB NOCREATEROLE NOBYPASSRLS PASSWORD ${literal}`);
  else await client.query(`ALTER ROLE borrowbench_runtime LOGIN NOINHERIT PASSWORD ${literal}`);
  const memberships=await client.query("SELECT 1 FROM pg_auth_members m JOIN pg_roles r ON r.oid=m.member WHERE r.rolname='borrowbench_runtime'");
  if (memberships.rows.length) throw new Error('Runtime role must have no inherited or SET ROLE memberships');
  const owns=await client.query("SELECT 1 FROM pg_class c JOIN pg_roles r ON c.relowner=r.oid WHERE r.rolname='borrowbench_runtime'");
  if (owns.rows.length) throw new Error('Runtime role must not own database objects');
  await client.query('REVOKE ALL ON accounts,equipment,loans,operations,audit_events,platform_metadata FROM borrowbench_runtime');
  await client.query('GRANT CONNECT ON DATABASE borrowbench TO borrowbench_runtime');
  await client.query('GRANT USAGE ON SCHEMA public TO borrowbench_runtime');
  await client.query('GRANT SELECT ON accounts,equipment,loans,operations,audit_events,platform_metadata TO borrowbench_runtime');
  await client.query('GRANT INSERT ON loans,operations,audit_events TO borrowbench_runtime');
  await client.query('GRANT UPDATE(maintenance) ON equipment TO borrowbench_runtime');
  await client.query('GRANT UPDATE(returned_at) ON loans TO borrowbench_runtime');
  await client.query('GRANT UPDATE(http_status,outcome,completed_at) ON operations TO borrowbench_runtime');
 } else {
  if (!['baseline','race','paging'].includes(dataset)) throw new Error('Select exactly one frozen fixture dataset');
  const bytes=await readFile(new URL('../../../database/fixtures/pilot-fixtures.json',import.meta.url));
  const sha256=createHash('sha256').update(bytes).digest('hex');
  if (sha256!=='a75bd7b8d2b09e3410821304913d16e5821bdd19d28d2b2d04b07fdffb1b2250') throw new Error('Fixture identity mismatch');
  const fixture=JSON.parse(bytes);const data=fixture.datasets[dataset];
  await client.query('LOCK TABLE accounts,equipment,loans,operations,audit_events IN ACCESS EXCLUSIVE MODE');
  for (const table of ['accounts','equipment','loans','operations','audit_events']) {
   if ((await client.query(`SELECT 1 FROM ${table} LIMIT 1`)).rows.length) throw new Error('Fixture loader only accepts an empty business schema; archive and use a separately authorized disposable target');
  }
  for (const a of fixture.accounts) await client.query('INSERT INTO accounts(id,provider_subject,display_label,role) VALUES($1,$2,$3,$4)',[a.id,a.providerSubject,a.displayLabel,a.role]);
  for (const e of data.equipment) await client.query('INSERT INTO equipment(id,inventory_code,name,description,maintenance) VALUES($1,$2,$3,$4,$5)',[e.id,e.inventoryCode,e.name,e.description,e.maintenance]);
  for (const l of data.loans) await client.query('INSERT INTO loans(id,equipment_id,borrower_id,checked_out_at,returned_at) VALUES($1,$2,$3,$4,$5)',[l.id,l.equipmentId,l.borrowerId,l.checkedOutAt,l.returnedAt]);
  for (const o of data.operations) {
   if (createHash('sha256').update(o.canonicalIntent).digest('hex')!==o.intentSha256) throw new Error('Fixture intent mismatch');
   await client.query(`INSERT INTO operations(actor_id,key,type,target,canonical_intent,intent_digest,http_status,outcome,original_correlation_id,completed_at)
    VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,[o.actorId,o.key,o.intent.type,o.intent.target,o.canonicalIntent,o.intentSha256,o.httpStatus,o.operation,o.operation.originalCorrelationId,o.operation.completedAt]);
  }
  for (const a of data.auditEvents) await client.query(`INSERT INTO audit_events(id,actor_id,equipment_id,loan_id,action,occurred_at,correlation_id,operation_key)
   VALUES($1,$2,$3,$4,$5,$6,$7,$8)`,[a.id,a.actorId,a.equipmentId,a.loanId,a.action,a.occurredAt,a.correlationId,a.operationKey]);
 }
 await client.query('COMMIT');
 process.stdout.write(JSON.stringify({action,target,dataset:dataset??null,status:'committed',time:new Date().toISOString()})+'\n');
} catch {
 try {await client.query('ROLLBACK');} catch {}
 process.stderr.write('Business preparation failed; reconcile the target before retry. No credential or database error is disclosed.\n');
 process.exitCode=1;
} finally {await client.end();}
