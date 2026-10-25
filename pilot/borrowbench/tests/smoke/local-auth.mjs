import assert from 'node:assert/strict';
const base = 'http://localhost:3100';
assert.match(await (await fetch(base)).text(), /Local development mode/);
assert.equal((await fetch(`${base}/api/platform`)).status, 401);
assert.equal((await fetch('http://127.0.0.1:3101/me', {headers:{'X-BorrowBench-Local-Account':'custodian'}})).status,401);
for (const [account, label, role] of [['member-a','Member A','member'],['member-b','Member B','member'],['custodian','Custodian','custodian']]) {
  const select = await fetch(`${base}/local-session`, {method:'POST',redirect:'manual',headers:{origin:base},body:new URLSearchParams({account})});
  assert.equal(select.status,303);
  const cookie = select.headers.get('set-cookie').split(';')[0];
  const response = await fetch(`${base}/api/platform`,{headers:{cookie}});
  assert.equal(response.status,200);
  assert.deepEqual(await response.json(),{label,role,platform:'BorrowBench'});
  const logout = await fetch(`${base}/local-session`, {method:'POST',redirect:'manual',headers:{origin:base,cookie},body:new URLSearchParams({account:'logout'})});
  assert.equal(logout.status,303);
  assert.match(logout.headers.get('set-cookie'),/Max-Age=0/i);
}
assert.equal((await fetch(`${base}/local-session`, {method:'POST',headers:{origin:'https://other.invalid'},body:new URLSearchParams({account:'custodian'})})).status,403);
assert.equal((await fetch(`${base}/local-session`, {method:'POST',headers:{origin:base},body:new URLSearchParams({account:'invalid'})})).status,400);
console.log('PASS: all three local accounts reach API/database; anonymous/direct API denied; logout, invalid selection and cross-origin denial verified');
