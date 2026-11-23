// Exports the catalogue as a CSV checklist for sourcing real product photos.
// Usage: npm run images:list   → image-review/product-list.csv
import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
import { products } from '../src/data/products.js'; import { PRODUCT_IMAGES } from '../src/data/productImages.js';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..'); const out = path.join(root, 'image-review'); fs.mkdirSync(out, { recursive: true });
const q = v => `"${String(v).replace(/"/g, '""')}"`;
const rows = [['id', 'category', 'brand', 'name', 'pack_size', 'has_verified_photo', 'suggested_file_name', 'source_url', 'license_or_permission', 'notes'].join(',')];
const slug = s => s.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
products.forEach(p => rows.push([p.id, p.category, p.brand, p.name, p.unit, PRODUCT_IMAGES[p.id] ? 'yes' : 'no', `${slug(p.category)}/${slug(p.brand)}-${slug(p.name)}-${slug(p.unit)}.webp`, '', '', ''].map(q).join(',')));
fs.writeFileSync(path.join(out, 'product-list.csv'), rows.join('\n') + '\n'); console.log(`Wrote image-review/product-list.csv (${products.length} rows)`);
