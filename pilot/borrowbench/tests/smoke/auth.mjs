import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';

const web = fileURLToPath(new URL('../../apps/web/', import.meta.url));
const origin = 'http://127.0.0.1:3199';
for (const configured of [false, true]) {
  // Explicit synthetic overrides: no test reads or prints any real environment file.
  const child = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '-H', '127.0.0.1', '-p', '3199'], {
    cwd: web, stdio: 'ignore', env: {
      PATH: process.env.PATH, NODE_ENV: 'production', NEXT_TELEMETRY_DISABLED: '1',
      APP_BASE_URL: origin, AUTH0_DOMAIN: 'example.invalid', AUTH0_CLIENT_ID: 'synthetic-client',
      AUTH0_CLIENT_SECRET: configured ? 'synthetic-test-only' : '',
      AUTH0_SECRET: 'ab'.repeat(32), AUTH0_AUDIENCE: '', BORROWBENCH_ENV: 'verify',
    },
  });
  try {
    let ready = false;
    for (let attempt = 0; attempt < 100; attempt++) {
      try { await fetch(origin); ready = true; break; } catch { await delay(100); }
    }
    assert(ready, 'server must start');
    const home = await fetch(origin);
    assert.equal(home.status, 200);
    const html = await home.text();
    assert(html.includes(configured ? 'Sign in with your assigned pilot account' : 'Sign-in setup is not complete'));
    assert(!html.includes('synthetic-test-only'));
    assert(!html.includes('screen_hint=signup'));
    if (!configured) {
      const login = await fetch(origin + '/auth/login', {redirect:'manual'});
      assert.equal(login.status, 503);
    } else {
      const profile = await fetch(origin + '/auth/profile', {redirect:'manual'});
      assert.equal(profile.status, 401);
      const token = await fetch(origin + '/auth/access-token', {redirect:'manual'});
      assert.equal(token.status, 404);
      const callback = await fetch(origin + '/auth/callback?error=access_denied&error_description=DO_NOT_REFLECT', {redirect:'manual'});
      assert.equal(new URL(callback.headers.get('location'), origin).href, origin + '/sign-in-error');
      assert(!(await callback.text()).includes('DO_NOT_REFLECT'));
      const errorPage = await fetch(origin + '/sign-in-error');
      assert((await errorPage.text()).includes('Try signing in again'));
    }
    console.log(`PASS: ${configured ? 'anonymous session, token boundary and callback recovery' : 'missing-configuration behavior'}`);
  } finally {
    child.kill('SIGTERM');
    await new Promise(resolve => child.once('exit', resolve));
  }
}
