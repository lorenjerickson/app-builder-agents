import { HttpException } from '@nestjs/common';
import { createHash } from 'node:crypto';
export type OperationType = 'checkout' | 'return' | 'set_maintenance';
export type Command = { type: OperationType; target: string; payload: Record<string, never> | { enabled: boolean } };
export type Receipt = { key: string; type: OperationType; target: string; outcome: 'succeeded' | 'conflict' | 'not_found'; code: string; changed: boolean; result: Record<string, string> | null; completedAt: string; originalCorrelationId: string };
export class BusinessError extends HttpException {
  constructor(readonly code: string, status: number, readonly fieldErrors?: Record<string, string>) { super(code, status); }
}
export const messages: Record<string, string> = {
 INVALID_REQUEST: 'Check the request fields.', INVALID_OPERATION_KEY: 'Provide a valid operation key.',
 SESSION_REQUIRED: 'Sign in to continue.', FORBIDDEN: 'This action is not permitted.', NOT_FOUND: 'This record is not available.',
 OPERATION_NOT_FOUND: 'No recorded result is visible yet. Check again before retrying.',
 ITEM_UNAVAILABLE: 'This item is not available to borrow.', ITEM_ON_LOAN: 'Return this item before changing maintenance.',
 LOAN_ALREADY_RETURNED: 'This loan has already been returned.', KEY_REUSE: 'This key belongs to a different action. Check the original result.',
 SERVICE_UNAVAILABLE: 'The service is unavailable. Try reading again.', OPERATION_UNRESOLVED: 'The result is unknown. Check the result or retry the same action with the same key.',
 PAYLOAD_TOO_LARGE: 'The request is too large.',
};
export function invalid(field?: string): never { throw new BusinessError('INVALID_REQUEST', 400, field ? { [field]: 'Invalid value.' } : undefined); }
export function uuid(value: unknown, field: string): string {
 if (typeof value !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)) invalid(field);
 return value.toLowerCase();
}
export function operationKey(value: unknown): string {
 if (typeof value !== 'string' || !/^[ -~]{1,128}$/.test(value)) throw new BusinessError('INVALID_OPERATION_KEY', 400, { 'Idempotency-Key': 'Use 1–128 printable ASCII characters.' });
 return value;
}
export function command(type: OperationType, target: unknown, body: unknown): Command {
 const id = uuid(target, type === 'return' ? 'loanId' : 'itemId');
 if (!body || typeof body !== 'object' || Array.isArray(body)) invalid();
 const keys = Object.keys(body);
 if (type === 'set_maintenance') {
  if (keys.length !== 1 || keys[0] !== 'enabled' || typeof (body as { enabled?: unknown }).enabled !== 'boolean') invalid('enabled');
  return { type, target: id, payload: { enabled: (body as { enabled: boolean }).enabled } };
 }
 if (keys.length) invalid();
 return { type, target: id, payload: {} };
}
export function canonicalIntent(cmd: Command) {
 const bytes = JSON.stringify({ version: 1, type: cmd.type, target: cmd.target, payload: cmd.payload });
 return { bytes, digest: createHash('sha256').update(bytes, 'utf8').digest('hex') };
}
export function queryFields(query: Record<string, unknown>, allowed: string[]) { if (Object.keys(query).some(k => !allowed.includes(k))) invalid(); }
export function limitValue(value: unknown): number {
 if (value === undefined) return 50;
 if (typeof value !== 'string' || !/^[1-9][0-9]{0,2}$/.test(value) || Number(value) > 100) invalid('limit');
 return Number(value);
}
export type Cursor = { v: 1; kind: 'returned' | 'audit'; time: string; id: string; equipmentId: string | null };
export function encodeCursor(value: Cursor): string { return Buffer.from(JSON.stringify(value), 'utf8').toString('base64url'); }
export function decodeCursor(value: unknown, kind: Cursor['kind'], equipmentId: string | null): Cursor | null {
 if (value === undefined) return null;
 try {
  if (typeof value !== 'string' || value.length > 1024 || !/^[A-Za-z0-9_-]+$/.test(value)) invalid('cursor');
  const raw = Buffer.from(value, 'base64url');
  if (raw.toString('base64url') !== value) invalid('cursor');
  const c = JSON.parse(raw.toString('utf8')) as Cursor;
  if (!c || typeof c !== 'object' || Array.isArray(c) || Object.keys(c).sort().join(',') !== 'equipmentId,id,kind,time,v'
   || c.v !== 1 || c.kind !== kind || c.equipmentId !== equipmentId || typeof c.time !== 'string'
   || !/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{3}Z$/.test(c.time) || new Date(c.time).toISOString() !== c.time) invalid('cursor');
  if (uuid(c.id, 'cursor') !== c.id) invalid('cursor');
  return c;
 } catch { return invalid('cursor'); }
}
