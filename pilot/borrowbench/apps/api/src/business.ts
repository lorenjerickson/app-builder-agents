import pg from 'pg';
import { telemetry } from './telemetry.js';
import type { Config } from './config.js';
import { randomUUID } from 'node:crypto';
import { BusinessError, canonicalIntent, decodeCursor, encodeCursor, limitValue, queryFields, uuid, type Command, type Receipt } from './business-contract.js';
export type Principal = { id: string; role: 'member' | 'custodian' };
type Row = Record<string, any>;
const iso = (v: Date | string): string => new Date(v).toISOString();
const summary = (r: Row) => ({ id: r.equipment_id, inventoryCode: r.inventory_code, name: r.name });
const loan = (r: Row) => ({ id: r.id, equipment: summary(r), state: r.returned_at ? 'returned' : 'active', checkedOutAt: iso(r.checked_out_at), returnedAt: r.returned_at ? iso(r.returned_at) : null });
const loanSelect = 'SELECT l.*,e.inventory_code,e.name FROM loans l JOIN equipment e ON e.id=l.equipment_id';
export class Business {
 constructor(readonly pool: pg.Pool, private readonly config: Pick<Config,'authMode'|'releaseId'|'configId'> = {authMode:'local'}) {}
 async principal(subject: string, role: Principal['role']): Promise<Principal> {
  const r = await this.pool.query('SELECT id,role FROM accounts WHERE provider_subject=$1', [subject]);
  if (r.rows.length !== 1 || r.rows[0].role !== role) throw new BusinessError('FORBIDDEN', 403);
  return r.rows[0];
 }
 async equipment(actor: Principal, query: Record<string, unknown>, itemId?: string) {
  queryFields(query, itemId ? [] : ['availableOnly']);
  if (query.availableOnly !== undefined && query.availableOnly !== 'true' && query.availableOnly !== 'false') throw new BusinessError('INVALID_REQUEST', 400, { availableOnly: 'Use true or false.' });
  const id = itemId === undefined ? null : uuid(itemId, 'itemId');
  const r = await this.pool.query(`SELECT e.*,l.id AS loan_id,l.borrower_id FROM equipment e
   LEFT JOIN loans l ON l.equipment_id=e.id AND l.returned_at IS NULL
   WHERE ($1::uuid IS NULL OR e.id=$1) AND (NOT $2::boolean OR (NOT e.maintenance AND l.id IS NULL)) ORDER BY e.inventory_code`, [id, query.availableOnly === 'true']);
  const items = r.rows.map(r => ({ id: r.id, inventoryCode: r.inventory_code, name: r.name, description: r.description,
   state: r.loan_id ? 'on_loan' : r.maintenance ? 'maintenance' : 'available', ownActiveLoanId: r.borrower_id === actor.id ? r.loan_id : null }));
  if (id && !items.length) throw new BusinessError('NOT_FOUND', 404);
  return id ? items[0] : { items };
 }
 async ownLoans(actor: Principal, query: Record<string, unknown>) {
  queryFields(query, ['cursor','limit']);
  const limit = limitValue(query.limit); const c = decodeCursor(query.cursor, 'returned', null);
  const active = await this.pool.query(`${loanSelect} WHERE l.borrower_id=$1 AND l.returned_at IS NULL ORDER BY l.checked_out_at DESC,l.id DESC`, [actor.id]);
  const returned = await this.pool.query(`${loanSelect} WHERE l.borrower_id=$1 AND l.returned_at IS NOT NULL
   AND ($2::timestamptz IS NULL OR (l.checked_out_at,l.id)<($2::timestamptz,$3::uuid)) ORDER BY l.checked_out_at DESC,l.id DESC LIMIT $4`, [actor.id,c?.time ?? null,c?.id ?? null,limit+1]);
  const page = returned.rows.slice(0,limit); const last = page.at(-1);
  return { active: active.rows.map(loan), returned: page.map(loan), nextReturnedCursor: returned.rows.length > limit && last ? encodeCursor({ v:1,kind:'returned',time:iso(last.checked_out_at),id:last.id,equipmentId:null }) : null };
 }
 async ownLoan(actor: Principal, id: string, query: Record<string, unknown>) {
  queryFields(query, []);
  const r = await this.pool.query(`${loanSelect} WHERE l.id=$1 AND l.borrower_id=$2`, [uuid(id,'loanId'),actor.id]);
  if (!r.rows.length) throw new BusinessError('NOT_FOUND',404);
  return loan(r.rows[0]);
 }
 async audit(actor: Principal, query: Record<string, unknown>) {
  if (actor.role !== 'custodian') throw new BusinessError('FORBIDDEN',403);
  queryFields(query,['cursor','limit','equipmentId']);
  const equipmentId = query.equipmentId === undefined ? null : uuid(query.equipmentId,'equipmentId');
  const limit = limitValue(query.limit); const c = decodeCursor(query.cursor,'audit',equipmentId);
  const r = await this.pool.query(`SELECT a.*,e.inventory_code,e.name,ac.display_label FROM audit_events a
   JOIN equipment e ON e.id=a.equipment_id JOIN accounts ac ON ac.id=a.actor_id
   WHERE ($1::uuid IS NULL OR a.equipment_id=$1) AND ($2::timestamptz IS NULL OR (a.occurred_at,a.id)<($2::timestamptz,$3::uuid))
   ORDER BY a.occurred_at DESC,a.id DESC LIMIT $4`,[equipmentId,c?.time ?? null,c?.id ?? null,limit+1]);
  const page = r.rows.slice(0,limit); const last = page.at(-1);
  return { events: page.map(r => ({ id:r.id,actor:{id:r.actor_id,displayLabel:r.display_label},equipment:summary(r),loanId:r.loan_id,
   action:r.action,occurredAt:iso(r.occurred_at),correlationId:r.correlation_id,operationKey:r.operation_key })),
   nextCursor: r.rows.length > limit && last ? encodeCursor({v:1,kind:'audit',time:iso(last.occurred_at),id:last.id,equipmentId}) : null };
 }
 async lookup(actor: Principal, key: string) {
  const r = await this.pool.query('SELECT http_status,outcome FROM operations WHERE actor_id=$1 AND key=$2',[actor.id,key]);
  if (!r.rows.length) throw new BusinessError('OPERATION_NOT_FOUND',404);
  return { httpStatus:r.rows[0].http_status,operation:r.rows[0].outcome as Receipt };
 }
 async mutate(actor: Principal, key: string, cmd: Command, correlationId: string) {
  if (cmd.type === 'set_maintenance' && actor.role !== 'custodian') throw new BusinessError('FORBIDDEN',403);
  const intent = canonicalIntent(cmd);
  const waitStart = performance.now();
  const client = await this.pool.connect();
  telemetry(this.config,'pool_wait_ms',{value:performance.now()-waitStart});
  let broken = false;
  try {
   await client.query('BEGIN ISOLATION LEVEL READ COMMITTED');
   await client.query("SET LOCAL lock_timeout='2s'");
   await client.query("SET LOCAL statement_timeout='3s'");
   const inserted = await client.query(`INSERT INTO operations(actor_id,key,type,target,canonical_intent,intent_digest,original_correlation_id)
    VALUES($1,$2,$3,$4,$5,$6,$7) ON CONFLICT(actor_id,key) DO NOTHING RETURNING key`,[actor.id,key,cmd.type,cmd.target,intent.bytes,intent.digest,correlationId]);
   if (!inserted.rows.length) {
    const prior = (await client.query('SELECT canonical_intent,intent_digest,http_status,outcome FROM operations WHERE actor_id=$1 AND key=$2',[actor.id,key])).rows[0];
    if (!prior || prior.canonical_intent !== intent.bytes || prior.intent_digest !== intent.digest) throw new BusinessError('KEY_REUSE',409);
    await client.query('COMMIT');
    return {httpStatus:prior.http_status as number,operation:prior.outcome as Receipt,replay:true};
   }
   let itemId = cmd.target;
   if (cmd.type === 'return') {
    const owned = await client.query('SELECT equipment_id FROM loans WHERE id=$1 AND borrower_id=$2',[cmd.target,actor.id]);
    itemId = owned.rows[0]?.equipment_id;
   }
   const item = itemId ? (await client.query('SELECT id,maintenance FROM equipment WHERE id=$1 FOR UPDATE',[itemId])).rows[0] : undefined;
   let code = 'NOT_FOUND'; let status = 404; let changed = false; let result: Receipt['result'] = null;
   let action: string | null = null; let loanId: string | null = null;
   // Date is sampled after item locking so returned_at cannot precede a concurrent checkout.
   let now = new Date().toISOString();
   if (item) {
    if (cmd.type === 'return') {
     const owned = (await client.query('SELECT id,returned_at,checked_out_at FROM loans WHERE id=$1 AND borrower_id=$2 FOR UPDATE',[cmd.target,actor.id])).rows[0];
     if (owned) {
      if (owned.returned_at) { code='LOAN_ALREADY_RETURNED';status=409; }
      else {
       now = new Date(Math.max(Date.now(),new Date(owned.checked_out_at).valueOf())).toISOString();
       const returnedAt = now;
       await client.query('UPDATE loans SET returned_at=$1 WHERE id=$2',[returnedAt,cmd.target]);
       code='RETURNED';status=200;changed=true;loanId=cmd.target;action='return';result={loanId,returnedAt};
      }
     }
    } else {
     const active = await client.query('SELECT id FROM loans WHERE equipment_id=$1 AND returned_at IS NULL',[itemId]);
     if (cmd.type === 'checkout') {
      if (item.maintenance || active.rows.length) { code='ITEM_UNAVAILABLE';status=409; }
      else {
       loanId=randomUUID();await client.query('INSERT INTO loans(id,equipment_id,borrower_id,checked_out_at) VALUES($1,$2,$3,$4)',[loanId,itemId,actor.id,now]);
       code='CHECKED_OUT';status=201;changed=true;action='checkout';result={loanId,checkedOutAt:now};
      }
     } else if (active.rows.length) { code='ITEM_ON_LOAN';status=409; }
     else {
      const enabled = (cmd.payload as {enabled:boolean}).enabled;
      changed = item.maintenance !== enabled;status=200;
      code=changed ? enabled ? 'MAINTENANCE_STARTED' : 'MAINTENANCE_ENDED' : 'MAINTENANCE_UNCHANGED';
      result={itemId,state:enabled?'maintenance':'available'};
      if (changed) { await client.query('UPDATE equipment SET maintenance=$1 WHERE id=$2',[enabled,itemId]);action=enabled?'maintenance_started':'maintenance_ended'; }
     }
    }
   }
   const receipt: Receipt = {key,type:cmd.type,target:cmd.target,outcome:status===404?'not_found':status===409?'conflict':'succeeded',code,changed,result,completedAt:now,originalCorrelationId:correlationId};
   if (action) await client.query(`INSERT INTO audit_events(id,actor_id,equipment_id,loan_id,action,occurred_at,correlation_id,operation_key)
    VALUES($1,$2,$3,$4,$5,$6,$7,$8)`,[randomUUID(),actor.id,itemId,loanId,action,now,correlationId,key]);
   await client.query('UPDATE operations SET http_status=$1,outcome=$2,completed_at=$3 WHERE actor_id=$4 AND key=$5',[status,receipt,receipt.completedAt,actor.id,key]);
   await client.query('COMMIT');
   return {httpStatus:status,operation:receipt,replay:false};
  } catch(error) {
   try { await client.query('ROLLBACK'); } catch { broken = true; /* Lost commit acknowledgment stays unresolved. */ }
   throw error;
  } finally { client.release(broken ? new Error('Transaction connection unavailable') : undefined); }
 }
}
