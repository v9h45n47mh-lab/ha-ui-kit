import {readFile, writeFile, mkdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {createHash} from 'node:crypto';
const root = fileURLToPath(new URL('../', import.meta.url));
const read = p => readFile(path.join(root, p), 'utf8');
const pkg = JSON.parse(await read('package.json'));
const tokens = JSON.parse(await read('src/tokens.json'));
const css = `:host{${Object.entries(tokens.variables).map(([name,value]) => `${name}:${value}`).join(';')}}\n${await read('src/styles.css')}`;
const icons = await read('src/icons.js');
const components = (await read('src/components.js')).replace("import { icon } from './icons.js';\n", '');
const module = `/* HA UI Kit ${pkg.version} | MIT | Shutter Manager 1.4.0 */\nexport const UI_VERSION = ${JSON.stringify(pkg.version)};\nexport const UI_CSS = ${JSON.stringify(css)};\n${icons}\n${components}`;
const hash = text => createHash('sha256').update(text).digest('hex');
const manifest = JSON.stringify({name:pkg.name,version:pkg.version,layout:'shutter-manager-1.4.0',files:{'family-ui.js':hash(module),'family-ui.css':hash(css)}},null,2)+'\n';
const outputs = {'family-ui.js':module,'family-ui.css':css,'manifest.json':manifest};
await mkdir(path.join(root, 'dist'), {recursive:true});
for (const [file, content] of Object.entries(outputs)) {
  if (process.argv.includes('--check')) {
    if (await read(`dist/${file}`) !== content) throw new Error(`dist/${file} is outdated; run npm run build`);
  } else await writeFile(path.join(root,'dist',file), content);
}
const demo = (await read('examples/family-ui-example-card.js')).replace(/^import .*;\n/, '');
const preview = (await read('examples/index.html')).replace('<script type="module" src="./family-ui-example-card.js"></script>',`<script type="module">\n${module}\n${demo}\n</script>`);
if (process.argv.includes('--check')) {
  if (await read('preview.html') !== preview) throw new Error('preview.html is outdated; run npm run build');
} else await writeFile(path.join(root,'preview.html'),preview);
console.log(`${process.argv.includes('--check') ? 'Verified' : 'Built'} HA UI Kit ${pkg.version}`);
