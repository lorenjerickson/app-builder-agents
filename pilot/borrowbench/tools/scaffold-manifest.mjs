import { createHash } from 'node:crypto';
import { lstat, readdir, readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const workspace = fileURLToPath(new URL('../', import.meta.url));
const evidenceDirectory = path.resolve(workspace, '../../docs/pilot/evidence/scaffold');
const skipped = new Set(['node_modules', '.next', 'dist', '.local', '.git', '.turbo', 'test-results', 'playwright-report']);
const roots = ['apps', 'database', 'ops', 'tests', 'tools', 'package.json', 'pnpm-lock.yaml', 'pnpm-workspace.yaml', '.nvmrc', '.dockerignore', '.gitignore', 'README.md', 'turbo.json', 'playwright.config.mjs'];
const hash = data => createHash('sha256').update(data).digest('hex');

export async function sourceManifest(root = workspace) {
  const files = [];
  async function visit(relative) {
    const name = path.basename(relative);
    // Skip private/generated paths before opening or traversing them.
    if (skipped.has(name) || (name.startsWith('.env') && name !== '.env.example') || name.endsWith('.tsbuildinfo') || name === 'next-env.d.ts') return;
    const absolute = path.join(root, relative);
    const info = await lstat(absolute);
    if (info.isSymbolicLink()) throw new Error('Source symlinks are not supported');
    if (info.isDirectory()) {
      for (const entry of (await readdir(absolute)).sort()) await visit(path.join(relative, entry));
    } else if (info.isFile()) {
      files.push({ path: relative.split(path.sep).join('/'), bytes: info.size, sha256: hash(await readFile(absolute)) });
    } else throw new Error('Unsupported source entry');
  }
  for (const entry of roots) await visit(entry);
  files.sort((a,b) => a.path < b.path ? -1 : a.path > b.path ? 1 : 0);
  const payload = { format: 'borrowbench-scaffold-source-v1', scope: 'source-only; excludes private configuration, generated output and dependencies', files };
  return { ...payload, source_sha256: hash(JSON.stringify(payload)) };
}

export function compareManifests(expected, actual) {
  if (JSON.stringify(expected) !== JSON.stringify(actual)) throw new Error('Scaffold source differs from the baseline; create a new baseline after reviewing and verifying changes');
}

async function main() {
  const [command, filename, ...extra] = process.argv.slice(2);
  if (extra.length || !['write','check'].includes(command) || (command === 'check' && !filename) || (command === 'write' && filename)) {
    throw new Error('Usage: node tools/scaffold-manifest.mjs write | check <manifest.json>');
  }
  const actual = await sourceManifest();
  if (command === 'check') {
    // Only published baseline records may be read, never arbitrary private configuration.
    const selected = path.resolve(filename);
    if (path.dirname(selected) !== evidenceDirectory || !/^source-[a-f0-9]{64}\.json$/.test(path.basename(selected))) throw new Error('Select a published scaffold source manifest');
    if (!(await lstat(selected)).isFile() || (await lstat(selected)).isSymbolicLink()) throw new Error('Manifest must be a regular file');
    compareManifests(JSON.parse(await readFile(selected, 'utf8')), actual);
    console.log(`PASS: ${actual.files.length} source files match ${actual.source_sha256}`);
  } else {
    await mkdir(evidenceDirectory, {recursive:true});
    const output = path.join(evidenceDirectory, `source-${actual.source_sha256}.json`);
    const content = JSON.stringify(actual, null, 2) + '\n';
    try { await writeFile(output, content, {flag:'wx'}); }
    catch (error) { if (error.code !== 'EEXIST') throw error; compareManifests(JSON.parse(await readFile(output,'utf8')), actual); }
    console.log(`Source baseline: ${output}\nFiles: ${actual.files.length}\nSHA256: ${actual.source_sha256}`);
  }
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch(error => { console.error(error.message); process.exitCode = 1; });
}
