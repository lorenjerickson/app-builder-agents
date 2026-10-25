import { test } from 'node:test';
import assert from 'node:assert/strict';
import { actionPath, validIntent, terminalReceipt, resultCopy } from '../lib/product-contract.ts';
import { actorHandle, sessionToken, trustedMutation, validCsrf, allowedRoute } from '../lib/transport-security.ts';
const actor = 'current-member-a';
const itemA = '00000002-0000-4000-8000-000000000001';
const itemB = '00000002-0000-4000-8000-000000000002';
const loan = '00000003-0000-4000-8000-000000000001';
const intent = { actor, key: 'exact-original-key', type: 'checkout', target: itemA, body: {}, name: 'Field recorder', inventoryCode: 'BB-001' };
const receipt = { key: intent.key, type: 'checkout', target: itemA, outcome: 'succeeded', code: 'CHECKED_OUT', changed: true, result: { loanId: loan, checkedOutAt: '2026-10-24T01:00:00Z' }, completedAt: '2026-10-24T01:00:00Z' };
test('actual row targets and names are carried through checkout, not a fixed prototype item', () => {
  assert.equal(actionPath(intent), `/equipment/${itemA}/checkout`);
  const second = { ...intent, target: itemB, name: 'Tripod' };
  assert.equal(actionPath(second), `/equipment/${itemB}/checkout`);
  assert.equal(resultCopy({ ...receipt, target: itemB }, second, false), 'You borrowed Tripod.');
  assert.equal(terminalReceipt({ operation: receipt }, 201, second, false), null);
  assert.equal(terminalReceipt({ operation: receipt }, 201, intent, false), receipt);
});
test('lookup success HTTP200 never turns an original conflict/not-found into success', () => {
  const conflict = { ...receipt, outcome: 'conflict', code: 'ITEM_UNAVAILABLE', changed: false, result: null };
  assert.equal(terminalReceipt({ operation: conflict, httpStatus: 409 }, 200, intent, true), conflict);
  assert.equal(terminalReceipt({ operation: conflict, httpStatus: 201 }, 200, intent, true), null);
  assert.equal(resultCopy(conflict, intent, true), 'This item is no longer available to borrow.');
  assert.equal(terminalReceipt({ error: { code: 'OPERATION_NOT_FOUND' } }, 404, intent, true), null);
  const missing = { ...conflict, outcome: 'not_found', code: 'NOT_FOUND' };
  assert.equal(terminalReceipt({ operation: missing, httpStatus: 404 }, 200, intent, true), missing);
});
test('historical receipts separate completed action from present equipment state', () => {
  assert.equal(resultCopy(receipt, intent, true), 'Your earlier change completed.');
  assert.equal(terminalReceipt({ operation: receipt, httpStatus: 201 }, 200, intent, true), receipt);
  assert.equal(terminalReceipt({ operation: receipt }, 200, intent, false), null);
});
test('saved intents require original actor and exact normalized shape; return targets exact loan', () => {
  assert.equal(validIntent(intent, actor), true);
  assert.equal(validIntent(intent, 'member-b'), false);
  assert.equal(validIntent({ ...intent, body: { borrower: true } }, actor), false);
  assert.equal(validIntent({ ...intent, key: 'bad\nkey' }, actor), false);
  const returned = { ...intent, type: 'return', target: loan };
  assert.equal(actionPath(returned), `/loans/${loan}/return`);
  assert.equal(terminalReceipt({ operation: { ...receipt, type: 'return', target: loan, code: 'RETURNED', result: { loanId: itemA } } }, 200, returned, false), null);
});
test('maintenance no-op and direction must match the original body', () => {
  const maintenance = { ...intent, type: 'set_maintenance', body: { enabled: true } };
  const noop = { ...receipt, type: 'set_maintenance', code: 'MAINTENANCE_UNCHANGED', changed: false, result: { itemId: itemA, state: 'maintenance' } };
  assert.equal(terminalReceipt({ operation: noop }, 200, maintenance, false), noop);
  assert.equal(resultCopy(noop, maintenance, false), 'Field recorder is already in maintenance.');
  assert.equal(terminalReceipt({ operation: { ...noop, result: { itemId: itemA, state: 'available' } } }, 200, maintenance, false), null);
});
test('CSRF is bound to actor, login nonce and environment secret, with exact trusted origin', () => {
  const secret = 'synthetic-test-secret-never-used-by-an-environment';
  const token = sessionToken(secret, actor, 'login-1');
  assert.equal(validCsrf(token, token), true);
  for (const other of [sessionToken(secret, actor, 'login-2'), sessionToken(secret, 'member-b', 'login-1'), sessionToken(secret + 'other', actor, 'login-1'), null, 'bad']) assert.equal(validCsrf(other, token), false);
  const headers = new Headers({ Origin: 'http://localhost:3200', 'Content-Type': 'application/json', 'X-CSRF-Token': token });
  assert.equal(trustedMutation(headers, 'http://localhost:3200', token), true);
  assert.equal(trustedMutation(headers, 'http://localhost:3300', token), false);
  headers.delete('origin'); headers.set('x-forwarded-host', 'localhost:3200');
  assert.equal(trustedMutation(headers, 'http://localhost:3200', token), false);
  assert.notEqual(actorHandle(secret, actor), actorHandle(secret, 'member-b'));
});
test('transport route allowlist rejects arbitrary routing, unsupported verbs and path injection', () => {
  assert.equal(allowedRoute('GET', ['equipment']), true);
  assert.equal(allowedRoute('POST', ['equipment', itemA, 'checkout']), true);
  assert.equal(allowedRoute('PUT', ['equipment', itemA, 'maintenance']), true);
  assert.equal(allowedRoute('GET', ['operations', 'lookup']), true);
  for (const [method, path] of [['DELETE', ['equipment', itemA]], ['GET', ['admin', 'platform']], ['POST', ['equipment']], ['GET', ['https:', 'evil.example']], ['GET', ['equipment', '..']], ['PUT', ['loans', loan, 'return']]]) assert.equal(allowedRoute(method, path), false);
});
