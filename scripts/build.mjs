import {readFile, writeFile, mkdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {createHash} from 'node:crypto';
const root = fileURLToPath(new URL('../', import.meta.url));
const read = p => readFile(path.join(root, p), 'utf8');
const pkg = JSON.parse(await read('package.json'));
const tokens = JSON.parse(await read('src/tokens.json'));
const css = `:host{${Object.entries(tokens.variables).map(([name,value]) => `${name}:${value}`).join(';')}}\n${await read('src/styles.css')}\n${await read('src/objects.css')}`;
const icons = await read('src/icons.js');
const components = (await Promise.all(['src/components.js','src/objects.js','src/controllers.js','src/music-player.js'].map(read))).map(s=>s.replace(/^import [^\n]*\n/gm,'')).join('\n');
const module = `/* HA UI Kit ${pkg.version} | MIT | Source priority: Shutter, Light, Essensplaner, Haushalt, Spuelmaschine, Access */\nexport const UI_VERSION = ${JSON.stringify(pkg.version)};\nexport const UI_CSS = ${JSON.stringify(css)};\n${icons}\nexport const MUSIC_PLAYER_CSS = ${JSON.stringify(await read('src/music-player.css'))};\n${components}`;
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
const galleryScript=(await read('examples/gallery.js')).replace(/^import [^\n]*\n/gm,'');
const gallery=(await read('examples/gallery.html')).replace('<script type="module" src="./gallery.js"></script>',`<script type="module">\n${module}\n${galleryScript}\n</script>`);
if(process.argv.includes('--check')) { if(await read('gallery.html')!==gallery)throw new Error('gallery.html is outdated; run npm run build'); }
else await writeFile(path.join(root,'gallery.html'),gallery);
console.log(`${process.argv.includes('--check') ? 'Verified' : 'Built'} HA UI Kit ${pkg.version}`);
