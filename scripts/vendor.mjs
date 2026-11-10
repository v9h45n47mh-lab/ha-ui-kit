#!/usr/bin/env node
import {readFile, writeFile, mkdir, copyFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {createHash} from 'node:crypto';
const args = process.argv.slice(2);
const targetAt = args.indexOf('--target');
if (targetAt < 0 || !args[targetAt+1] || args[targetAt+1].startsWith('--')) {
  throw new Error('Usage: node scripts/vendor.mjs --target /path/to/frontend [--check]');
}
const target = path.resolve(args[targetAt+1]);
const source = fileURLToPath(new URL('../', import.meta.url));
const manifest = JSON.parse(await readFile(path.join(source,'dist/manifest.json'),'utf8'));
const prefix = `family-ui/${manifest.version}`;
const output = path.join(target,prefix);
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const license = await readFile(path.join(source,'LICENSE'));
const lock = {...manifest,module:`./${prefix}/family-ui.js`,licenseSha256:hash(license)};
// Validate the release before copying any file.
for (const [file, expected] of Object.entries(manifest.files)) {
  if (hash(await readFile(path.join(source,'dist',file))) !== expected) throw new Error(`Release checksum mismatch: ${file}`);
}
if (args.includes('--check')) {
  const installed = JSON.parse(await readFile(path.join(target,'family-ui.lock.json'),'utf8'));
  if (JSON.stringify(installed) !== JSON.stringify(lock)) throw new Error('Installed UI lock differs from this release');
  for (const [file, expected] of Object.entries(manifest.files)) {
    if (hash(await readFile(path.join(output,file))) !== expected) throw new Error(`Installed file differs: ${file}`);
  }
  if (hash(await readFile(path.join(output,'LICENSE'))) !== lock.licenseSha256) throw new Error('Installed license differs');
  console.log(`Verified UI ${manifest.version} in ${target}`);
} else {
  for (const file of Object.keys(manifest.files)) {
    let existing;
    try { existing = await readFile(path.join(output,file)); } catch(error) { if(error.code !== 'ENOENT') throw error; }
    if (existing && hash(existing) !== manifest.files[file]) throw new Error(`Refusing to replace changed ${file} under the same UI version`);
  }
  await mkdir(output,{recursive:true});
  for (const file of [...Object.keys(manifest.files),'manifest.json']) await copyFile(path.join(source,'dist',file),path.join(output,file));
  await writeFile(path.join(output,'LICENSE'),license);
  await writeFile(path.join(target,'family-ui.lock.json'),JSON.stringify(lock,null,2)+'\n');
  console.log(`Installed UI ${manifest.version}. Import ${lock.module}`);
}
