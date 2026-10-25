import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
// Runtime-only secret consumption; output contains verdicts, never credentials.
const key=readFileSync('/run/secrets/test_auth','utf8').trim();
const endpoint='http://127.0.0.1:3001';
assert.equal((await fetch(`${endpoint}/me`)).status,401);
assert.equal((await fetch(`${endpoint}/me`,{headers:{authorization:'Bearer invalid','x-borrowbench-local-account':'custodian'}})).status,401);
assert.equal((await fetch(`${endpoint}/me`,{headers:{authorization:`Bearer ${key}`,'x-borrowbench-local-account':'unknown'}})).status,403);
for(const [account,status] of [['member-a',403],['member-b',403],['custodian',200]]) {
  assert.equal((await fetch(`${endpoint}/admin/platform`,{headers:{authorization:`Bearer ${key}`,'x-borrowbench-local-account':account}})).status,status);
}
console.log('PASS: container API rejects absent/wrong key and unknown identity; enforces member/custodian boundary.');
