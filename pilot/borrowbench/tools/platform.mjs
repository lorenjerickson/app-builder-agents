import { randomBytes } from 'node:crypto';
import { mkdir, writeFile, lstat, access } from 'node:fs/promises';
import { globSync } from 'node:fs';
import { createServer } from 'node:net';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const targets = { dev: { db: 55432, api: 3101 }, verify: { db: 55433, api: 3201 }, pilot: { db: 55434, api: 3301 } };
const [command, flag, target, ...extra] = process.argv.slice(2);
const commands = ['init', 'up', 'migrate', 'status', 'run-api', 'dev-api', 'test', 'test-api', 'test-db', 'local'];
if (!commands.includes(command) || flag !== '--target' || !Object.hasOwn(targets, target) || extra.length) {
  console.error('Usage: node tools/platform.mjs init|up|migrate|status|run-api|dev-api|test|test-api|test-db|local --target dev|verify|pilot (tests require verify)');
  process.exit(1);
}
if (command === 'local' && target !== 'dev') {
  console.error('Local authentication requires --target dev.');
  process.exit(1);
}
const ports = targets[target];
const local = path.join(root, '.local');
const envFile = path.join(local, `${target}.env`);
const accountsFile = path.join(local, `${target}-accounts.json`);
if (['test', 'test-api', 'test-db'].includes(command) && target !== 'verify') {
  console.error('Tests require --target verify. Other target data is not used.');
  process.exit(1);
}

async function exclusiveFile(filename, content) {
  try {
    await writeFile(filename, content, { flag: 'wx', mode: 0o600 });
    return true;
  } catch (error) {
    if (error.code === 'EEXIST') return false;
    throw error;
  }
}

async function initialize() {
  await mkdir(local, { recursive: true, mode: 0o700 });
  const directory = await lstat(local);
  if (!directory.isDirectory() || directory.isSymbolicLink() || (directory.mode & 0o077)) {
    throw new Error('The .local directory must be a private directory (mode 700), not a link.');
  }
  const created = await exclusiveFile(envFile, `BORROWBENCH_DB_PASSWORD=${randomBytes(32).toString('hex')}\n`);
  await exclusiveFile(accountsFile, '{}\n');
  console.log(`${target}: private configuration ${created ? 'created' : 'preserved'}; populate .local/${target}-accounts.json to allow pilot identities.`);
}

async function loadConfiguration() {
  for (const filename of [envFile, accountsFile]) {
    const info = await lstat(filename).catch(() => { throw new Error(`Initialize ${target} first.`); });
    if (!info.isFile() || info.isSymbolicLink() || (info.mode & 0o077)) {
      throw new Error('Local configuration must be private regular files (mode 600).');
    }
  }
  // Load only at runtime; never print or return credentials to the operator.
  delete process.env.BORROWBENCH_DB_PASSWORD;
  process.loadEnvFile(envFile);
  const password = process.env.BORROWBENCH_DB_PASSWORD;
  if (!/^[a-f0-9]{64}$/.test(password ?? '')) throw new Error('Target database credential is missing or invalid.');
  process.env.BORROWBENCH_DB_PORT = String(ports.db);
  process.env.DATABASE_URL = `postgresql://borrowbench:${password}@127.0.0.1:${ports.db}/borrowbench`;
  process.env.AUTH0_ISSUER = 'https://dev-vaonng6ouuwr50kl.us.auth0.com/';
  process.env.AUTH0_AUDIENCE = 'https://borrowbench.local/api';
  process.env.PILOT_ACCOUNT_MAP_FILE = accountsFile;
  process.env.API_HOST = '127.0.0.1';
  process.env.API_PORT = String(ports.api);
}

async function availablePort(port) {
  await new Promise((resolve, reject) => {
    const server = createServer();
    server.once('error', () => reject(new Error(`Loopback port ${port} is unavailable; no service was replaced.`)));
    server.listen(port, '127.0.0.1', () => server.close(resolve));
  });
}

function docker(args) {
  return new Promise((resolve, reject) => {
    const child = spawn('docker', ['compose', '--project-name', `borrowbench-${target}`, '--file', path.join(root, 'ops/compose.yaml'), ...args], {
      cwd: root, env: process.env, stdio: ['ignore', 'pipe', 'pipe'],
    });
    let output = '';
    child.stdout.on('data', (chunk) => { output += chunk; });
    // Docker diagnostics can interpolate environment values. Never forward them.
    child.stderr.resume();
    child.once('error', () => reject(new Error('Docker Compose could not start. Check Docker Desktop and Compose availability.')));
    child.once('exit', (code) => code === 0 ? resolve(output) : reject(new Error('Docker Compose failed. Check daemon availability, image access and target port availability; existing data was preserved.')));
  });
}

async function migrate() {
  const { runner } = await import('node-pg-migrate');
  await runner({
    databaseUrl: process.env.DATABASE_URL,
    dir: path.join(root, 'database/migrations'),
    direction: 'up',
    migrationsTable: 'pgmigrations',
    count: Infinity,
    checkOrder: true,
    noLock: false,
    log: () => {},
    logger: { debug() {}, info() {}, warn() {}, error() {} },
  });
  console.log(`${target}: migrations applied with migration locking.`);
}

async function status() {
  const { Client } = await import('pg');
  const db = new Client({ connectionString: process.env.DATABASE_URL, connectionTimeoutMillis: 3000 });
  try {
    await db.connect();
    const { rows } = await db.query('SELECT value FROM platform_metadata WHERE singleton = true');
    if (rows.length !== 1 || rows[0].value !== 'BorrowBench') throw new Error('Metadata mismatch');
    console.log(`${target}: PostgreSQL reachable; platform metadata verified.`);
  } finally {
    await db.end();
  }
}

async function runApi() {
  process.env.NODE_ENV = command === 'dev-api' ? 'development' : 'production';
  delete process.env.TEST_JWKS_URL;
  if (command === 'dev-api') {
    await availablePort(ports.api);
    await runNode([path.join(root, 'apps/api/tools/dev.mjs')], path.join(root, 'apps/api'));
    return;
  }
  const entry = path.join(root, 'apps/api/dist/src/main.js');
  await access(entry).catch(() => { throw new Error('Build the API before run-api.'); });
  await availablePort(ports.api);
  await runNode([entry]);
}

async function runLocal() {
  await availablePort(3100);
  await availablePort(3101);
  await status();
  delete process.env.TEST_JWKS_URL;
  Object.assign(process.env, {
    NODE_ENV: 'production', BORROWBENCH_ENV: 'dev', BORROWBENCH_AUTH_MODE: 'local',
    BORROWBENCH_LOCAL_AUTH_KEY: randomBytes(32).toString('hex'),
    APP_BASE_URL: 'http://localhost:3100', API_INTERNAL_URL: 'http://127.0.0.1:3101',
  });
  // The key is process-only, shared by these two loopback services, never persisted.
  const children = [
    spawn(process.execPath, ['apps/api/dist/src/main.js'], { cwd: root, env: process.env, stdio: 'inherit' }),
    spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '-H', '127.0.0.1', '-p', '3100'], {
      cwd: path.join(root, 'apps/web'), env: process.env, stdio: 'inherit',
    }),
  ];
  let stopping = false;
  const stop = () => { stopping = true; for (const child of children) child.kill('SIGTERM'); };
  for (const signal of ['SIGINT', 'SIGTERM']) process.once(signal, stop);
  console.log('Local development authentication enabled at http://localhost:3100; choose a test account.');
  await Promise.all(children.map(child => new Promise(resolve => {
    child.once('error', () => { process.exitCode = 1; stop(); resolve(); });
    child.once('exit', code => { if (!stopping) { process.exitCode = code ?? 1; stop(); } resolve(); });
  })));
}

async function runNode(args, cwd = root) {
  const child = spawn(process.execPath, args, { cwd, env: process.env, stdio: 'inherit' });
  for (const signal of ['SIGTERM', 'SIGINT']) process.once(signal, () => child.kill(signal));
  await new Promise((resolve, reject) => {
    child.once('error', () => reject(new Error('API could not start.')));
    child.once('exit', (code, signal) => {
      process.exitCode = signal ? 1 : (code ?? 1);
      resolve();
    });
  });
}

async function runTests() {
  process.env.TEST_DATABASE_URL = process.env.DATABASE_URL;
  const files = command === 'test-api'
    ? globSync('apps/api/dist/test/*.test.js', { cwd: root })
    : command === 'test-db' ? ['tests/integration/database-capabilities.mjs'] : ['tests/integration/platform.mjs'];
  if (!files.length) throw new Error('Build the API before test-api.');
  await runNode(['--test', ...files]);
}

try {
  if (command === 'init') await initialize();
  else {
    await loadConfiguration();
    if (command === 'up') {
      const running = await docker(['ps', '--status', 'running', '--services']);
      if (!running.trim().split(/\s+/).includes('db')) await availablePort(ports.db);
      await docker(['up', '--detach', '--wait', '--wait-timeout', '90', 'db']);
      console.log(`${target}: database healthy on 127.0.0.1:${ports.db}; persistent target volume retained.`);
    } else if (command === 'migrate') await migrate();
    else if (command === 'status') await status();
    else if (command === 'local') await runLocal();
    else if (['run-api', 'dev-api'].includes(command)) await runApi();
    else await runTests();
  }
} catch (error) {
  // Dependency errors may include credentials or user-controlled values.
  const safeMessages = /^(Initialize |Local configuration |Target database |The \.local |Loopback port |Docker Compose |Build the API |API could not start\.)/;
  console.error(safeMessages.test(error.message) ? error.message : `${target}: ${command} failed. Check private configuration, database availability and migration state; credentials are withheld.`);
  process.exitCode = 1;
}
