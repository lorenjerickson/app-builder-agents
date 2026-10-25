import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, rm, symlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { sourceManifest, compareManifests } from '../../tools/scaffold-manifest.mjs';

test('baseline detects edits, additions and deletion; excludes private/generated files; rejects source links', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'borrowbench-manifest-'));
  try {
    for (const dir of ['apps','database','ops','tests','tools']) await mkdir(path.join(root,dir));
    for (const name of ['package.json','pnpm-lock.yaml','pnpm-workspace.yaml','.nvmrc','.dockerignore','.gitignore','README.md','turbo.json','playwright.config.mjs']) await writeFile(path.join(root,name),'fixture');
    await writeFile(path.join(root,'apps','source.ts'),'original');
    const first = await sourceManifest(root);
    compareManifests(first, await sourceManifest(root));
    await writeFile(path.join(root,'apps','.env.local'),'synthetic-secret-fixture');
    await mkdir(path.join(root,'apps','node_modules'));
    await writeFile(path.join(root,'apps','node_modules','ignored.js'),'generated');
    compareManifests(first, await sourceManifest(root));
    await writeFile(path.join(root,'apps','source.ts'),'changed');
    const changed = await sourceManifest(root);
    assert.notEqual(changed.source_sha256, first.source_sha256);
    assert.throws(()=>compareManifests(first, changed), /differs/);
    await writeFile(path.join(root,'apps','added.ts'),'addition');
    assert.notEqual((await sourceManifest(root)).source_sha256, changed.source_sha256);
    await rm(path.join(root,'apps','source.ts'));
    assert.notEqual((await sourceManifest(root)).source_sha256, changed.source_sha256);
    await symlink(path.join(root,'package.json'),path.join(root,'apps','linked.json'));
    await assert.rejects(sourceManifest(root), /symlinks/);
  } finally { await rm(root,{recursive:true,force:true}); }
});
