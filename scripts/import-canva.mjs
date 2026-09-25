// Imports only the public design data, images and fonts, never Canva's runtime.
// Usage: node scripts/import-canva.mjs /path/to/downloaded-page.html [--download]
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { execFileSync } from 'node:child_process';
const root = path.resolve(import.meta.dirname, '..');
const html = fs.readFileSync(process.argv[2], 'utf8');
const literal = html.match(/window\['bootstrap'\] = JSON.parse\(('(?:[^'\\]|\\.)*')\)/)?.[1];
if (!literal) throw new Error('Design data not found');
const { page } = JSON.parse(vm.runInNewContext(literal, {}, { timeout: 1000 }));
const media = Object.fromEntries(page.E.map(asset => [asset.id, asset]));
const fonts = page.B;
const paths = new Set();
for (const asset of Object.values(media)) for (const file of asset.files) paths.add(file.url);
for (const font of fonts) for (const style of font.D) for (const file of style.files) paths.add(file.url);
if (process.argv.includes('--download')) {
  for (const file of paths) {
    if (!/^_assets\/(media|fonts)\/[a-zA-Z0-9_.-]+$/.test(file)) throw new Error('Unexpected asset path');
    const target = path.join(root, 'public', file);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    if (!fs.existsSync(target)) execFileSync('curl', ['--silent', '--show-error', '--fail', '--location', '--max-time', '40', `https://bodaluquidanch.my.canva.site/${file}`, '-o', target]);
  }
}
fs.mkdirSync(path.join(root, 'src'), { recursive: true });
fs.writeFileSync(path.join(root, 'src/design.json'), JSON.stringify({ sections: page.A.A[0].t, media, fonts }, null, 2) + '\n');
console.log(`Imported ${page.A.A[0].t.length} sections, ${Object.keys(media).length} images, ${fonts.length} font families; ${paths.size} local assets.`);
