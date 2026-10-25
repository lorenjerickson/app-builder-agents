import { test } from 'node:test';
import assert from 'node:assert/strict';
import { localAuthEnabled, localCookie } from '../lib/local-auth-config.ts';
const fixture = { BORROWBENCH_AUTH_MODE: 'container-test', BORROWBENCH_ENV: 'verify',
  BORROWBENCH_TEST_ONLY: '1', BORROWBENCH_LOCAL_AUTH_KEY: 'test-fixture-only'.repeat(3),
  APP_BASE_URL: 'http://localhost:3200', API_INTERNAL_URL: 'http://api:3001' };
test('container targets require explicit opt-in and exact internal and browser origins', () => {
  assert.equal(localAuthEnabled(fixture), true);
  assert.equal(localAuthEnabled({ ...fixture, BORROWBENCH_ENV: 'pilot', APP_BASE_URL: 'http://localhost:3300' }), true);
  for (const patch of [
    { BORROWBENCH_TEST_ONLY: undefined }, { BORROWBENCH_TEST_ONLY: 'true' },
    { BORROWBENCH_ENV: 'dev' }, { BORROWBENCH_ENV: 'production' },
    { APP_BASE_URL: 'http://localhost:3300' }, { APP_BASE_URL: 'http://example.com:3200' },
    { API_INTERNAL_URL: 'http://example.com:3001' }, { API_INTERNAL_URL: undefined },
    { BORROWBENCH_LOCAL_AUTH_KEY: undefined }, { BORROWBENCH_LOCAL_AUTH_KEY: 'k'.repeat(31) },
    { BORROWBENCH_LOCAL_AUTH_KEY: 'k'.repeat(32) + '\n' },
  ]) assert.throws(() => localAuthEnabled({ ...fixture, ...patch }));
});
test('verify, pilot and host cookies are distinct; local retains dev restriction', () => {
  const local = { ...fixture, BORROWBENCH_AUTH_MODE: 'local', BORROWBENCH_ENV: 'dev', APP_BASE_URL: 'http://localhost:3100' };
  assert.equal(localAuthEnabled(local), true);
  assert.throws(() => localAuthEnabled({ ...local, BORROWBENCH_ENV: 'verify' }));
  assert.throws(() => localAuthEnabled({ ...local, APP_BASE_URL: 'http://0.0.0.0:3100' }));
  assert.equal(localCookie(local), 'borrowbench_local_account');
  assert.equal(localCookie(fixture), 'borrowbench_verify_test_account');
  assert.equal(localCookie({ ...fixture, BORROWBENCH_ENV: 'pilot', APP_BASE_URL: 'http://localhost:3300' }), 'borrowbench_pilot_test_account');
  assert.equal(localAuthEnabled({}), false);
  assert.equal(localAuthEnabled({ BORROWBENCH_AUTH_MODE: 'auth0' }), false);
  assert.throws(() => localAuthEnabled({ BORROWBENCH_AUTH_MODE: 'unknown' }));
});
