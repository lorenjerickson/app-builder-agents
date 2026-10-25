import { test, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { compileFunction } from 'node:vm';
import ts from 'typescript';
import { NextRequest } from 'next/server.js';
import * as security from '../lib/transport-security.ts';
const require = createRequire(import.meta.url);
const source = readFileSync(new URL('../app/api/v1/[...path]/route.ts', import.meta.url), 'utf8');
const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
const session = { actor: 'actor-a', csrf: 'a'.repeat(64), headers: { Authorization: 'Bearer synthetic-server-only', 'X-BorrowBench-Local-Account': 'member-a' } };
let signedIn = true;
const compiledModule = { exports: {} };
compileFunction(code, ['require', 'module', 'exports'])(name => name === '@/lib/business-session' ? { businessSession: async () => signedIn ? session : null, apiBase: () => 'http://internal-api:3001' } : name === '@/lib/transport-security' ? security : require(name), compiledModule, compiledModule.exports);
const route = compiledModule.exports;
const originalFetch = globalThis.fetch;
const originalBase = process.env.APP_BASE_URL;
afterEach(() => { globalThis.fetch = originalFetch; signedIn = true; if (originalBase === undefined) delete process.env.APP_BASE_URL; else process.env.APP_BASE_URL = originalBase; });
const id = '00000002-0000-4000-8000-000000000001';
function request(method = 'POST', patch = {}, body = '{}') {
  process.env.APP_BASE_URL = 'http://localhost:3200';
  return new NextRequest(`http://localhost:3200/api/v1/equipment/${id}/checkout`, { method, headers: { Origin: 'http://localhost:3200', 'Content-Type': 'application/json', 'X-CSRF-Token': session.csrf, 'Idempotency-Key': 'original-key', ...patch }, ...(method === 'GET' ? {} : { body }) });
}
const context = { params: Promise.resolve({ path: ['equipment', id, 'checkout'] }) };
test('missing/mismatched CSRF, origin and stale actor reject before any upstream dispatch', async () => {
  let count = 0; globalThis.fetch = async () => { count++; throw new Error('must not dispatch'); };
  for (const patch of [{ 'X-CSRF-Token': '' }, { Origin: 'http://attacker.example' }, { Origin: '', 'X-Forwarded-Host': 'localhost:3200' }, { 'Content-Type': 'text/plain' }]) assert.equal((await route.POST(request('POST', patch), context)).status, 403);
  assert.equal((await route.POST(request('POST', { 'X-BorrowBench-Actor': 'member-b' }), context)).status, 401);
  signedIn = false;
  assert.equal((await route.POST(request(), context)).status, 401);
  assert.equal(count, 0);
});
test('proxy forwards exact method/body/key to fixed origin and strips browser identity and CSRF', async () => {
  let observed;
  globalThis.fetch = async (url, options) => { observed = { url: String(url), options }; return Response.json({ operation: { code: 'CHECKED_OUT' } }, { status: 201 }); };
  const response = await route.POST(request('POST', { Authorization: 'Bearer forged-browser', 'X-BorrowBench-Local-Account': 'custodian', 'X-Forwarded-Host': 'attacker.example' }), context);
  assert.equal(response.status, 201);
  assert.equal(response.headers.get('cache-control'), 'no-store');
  assert.equal(observed.url, `http://internal-api:3001/v1/equipment/${id}/checkout`);
  assert.deepEqual(observed.options.headers, { Authorization: 'Bearer synthetic-server-only', 'X-BorrowBench-Local-Account': 'member-a', 'Idempotency-Key': 'original-key', 'Content-Type': 'application/json' });
  assert.equal(observed.options.method, 'POST'); assert.equal(observed.options.body, '{}'); assert.equal(observed.options.redirect, 'error');
});
test('oversize rejected before upstream and network loss remains unresolved', async () => {
  let count = 0; globalThis.fetch = async () => { count++; throw new Error('simulated response loss'); };
  assert.equal((await route.POST(request('POST', {}, ' '.repeat(8193)), context)).status, 413);
  assert.equal(count, 0);
  const response = await route.POST(request(), context);
  assert.equal(response.status, 503);
  assert.equal((await response.json()).error.code, 'OPERATION_UNRESOLVED');
  assert.equal(count, 1);
});
test('reads retain private no-store response and stale-actor check, without mutation CSRF', async () => {
  let observed;
  globalThis.fetch = async (url, options) => { observed = { url: String(url), options }; return Response.json({ items: [] }); };
  const response = await route.GET(new NextRequest('http://localhost:3200/api/v1/equipment?availableOnly=true', { headers: { 'X-BorrowBench-Actor': session.actor } }), { params: Promise.resolve({ path: ['equipment'] }) });
  assert.equal(response.status, 200); assert.equal(observed.url, 'http://internal-api:3001/v1/equipment?availableOnly=true');
  assert.equal(observed.options.cache, 'no-store');
});

test('recognized equipment and loan endpoints return400 INVALID_REQUEST for malformed identifiers', async () => {
  let dispatched = 0;
  globalThis.fetch = async () => { dispatched++; throw new Error('invalid identifiers must not be sent upstream'); };
  const cases = [
    ['GET', ['equipment', 'not-a-uuid']],
    ['GET', ['loans', 'not-a-uuid']],
    ['POST', ['equipment', '00000002-0000-4000-8000-00000000000Z', 'checkout']],
    ['POST', ['loans', '00000003000040008000000000000001', 'return']],
    ['PUT', ['equipment', 'bad-target', 'maintenance']],
  ];
  for (const [method, path] of cases) {
    const response = await route[method](request(method), { params: Promise.resolve({ path }) });
    assert.equal(response.status, 400, `${method} /${path.join('/')}`);
    const payload = await response.json();
    assert.equal(payload.error.code, 'INVALID_REQUEST');
    assert.equal(response.headers.get('cache-control'), 'no-store');
    assert.equal('operation' in payload, false);
    assert.equal(JSON.stringify(payload).includes(path[1]), false, 'error does not echo the malformed input');
  }
  assert.equal(dispatched, 0);
});
test('unknown paths and unsupported operation shapes stay404 rather than becoming invalid-parameter responses', async () => {
  let dispatched = 0;
  globalThis.fetch = async () => { dispatched++; throw new Error('unknown routes must not reach upstream'); };
  for (const [method, path] of [
    ['GET', ['unknown', 'not-a-uuid']], ['GET', ['equipment', id, 'extra']],
    ['POST', ['equipment', id, 'return']], ['PUT', ['loans', id, 'return']],
    ['POST', ['equipment']], ['GET', ['operations', 'not-lookup']],
  ]) {
    const response = await route[method](request(method), { params: Promise.resolve({ path }) });
    assert.equal(response.status, 404, `${method} /${path.join('/')}`);
    assert.equal((await response.json()).error.code, 'NOT_FOUND');
  }
  assert.equal(dispatched, 0);
});
test('malformed mutation identifiers do not bypass authentication, actor or CSRF guards', async () => {
  let dispatched = 0;
  globalThis.fetch = async () => { dispatched++; throw new Error('rejected request must not reach upstream'); };
  const malformed = { params: Promise.resolve({ path: ['equipment', 'not-a-uuid', 'checkout'] }) };
  signedIn = false;
  assert.equal((await route.POST(request(), malformed)).status, 401);
  signedIn = true;
  assert.equal((await route.POST(request('POST', { 'X-BorrowBench-Actor': 'different-actor' }), malformed)).status, 401);
  assert.equal((await route.POST(request('POST', { 'X-CSRF-Token': '' }), malformed)).status, 403);
  assert.equal((await route.POST(request('POST', { Origin: 'http://untrusted.example' }), malformed)).status, 403);
  assert.equal(dispatched, 0);
});
