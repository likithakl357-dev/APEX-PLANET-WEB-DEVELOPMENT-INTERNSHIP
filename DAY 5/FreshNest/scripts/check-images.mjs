// Validates src/data/productImages.js against the catalogue and public/products/.
// Usage: npm run images:check      (exit code 1 on any problem)
import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
import { PRODUCT_IMAGES } from '../src/data/productImages.js';
import { products, productById } from '../src/data/products.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const errors = []; const warnings = []; const bySrc = new Map();
const ids = Object.keys(PRODUCT_IMAGES);

for (const id of ids) {
  const e = PRODUCT_IMAGES[id]; const p = productById[id]; const where = `[${id}]`;
  if (!p) { errors.push(`${where} no such product id in the catalogue`); continue; }
  if (e.name !== p.name || e.brand !== p.brand) errors.push(`${where} entry is for "${e.brand} ${e.name}" but the catalogue has "${p.brand} ${p.name}": re-verify the photo`);
  if (!e.src || !e.src.startsWith('/products/')) errors.push(`${where} src must be a local file under /products/ (no remote or hotlinked URLs): got "${e.src}"`);
  else if (!fs.existsSync(path.join(root, 'public', e.src))) errors.push(`${where} file not found: public${e.src}`);
  else { const kb = fs.statSync(path.join(root, 'public', e.src)).size / 1024; if (kb > 400) warnings.push(`${where} ${e.src} is ${Math.round(kb)} KB: consider compressing (≤ 400 KB)`); }
  for (const f of (e.supplied ? ['alt'] : ['alt', 'source', 'license', 'verified'])) if (!e[f]) errors.push(`${where} missing "${f}"`);
  if (e.source && !/^https?:\/\//.test(e.source)) errors.push(`${where} "source" must be the http(s) page the photo came from`);
  if (e.src) { if (bySrc.has(e.src)) errors.push(`${where} reuses ${e.src}, already used by [${bySrc.get(e.src)}]: one photo must not stand in for different products`); else bySrc.set(e.src, id); }
}
// Files on disk that nothing references
const dir = path.join(root, 'public', 'products');
const walk = d => fs.readdirSync(d, { withFileTypes: true }).flatMap(x => x.isDirectory() ? walk(path.join(d, x.name)) : [path.join(d, x.name)]);
if (fs.existsSync(dir)) walk(dir).filter(f => /\.(png|jpe?g|webp|avif|svg)$/i.test(f)).forEach(f => { const rel = '/products/' + path.relative(dir, f).split(path.sep).join('/'); if (!bySrc.has(rel)) warnings.push(`unreferenced image file: public${rel}`); });

const representative = ids.filter(id => PRODUCT_IMAGES[id].representative).length;
console.log(`Catalogue: ${products.length} products · exact photos: ${ids.length - representative} · representative photos: ${representative} · placeholders: ${products.length - ids.length}`);
warnings.forEach(w => console.log('  warn  ' + w)); errors.forEach(e => console.log('  ERROR ' + e));
if (errors.length) { console.log(`\n${errors.length} problem(s). Fix them before shipping.`); process.exit(1); }
console.log('Image map OK.');
