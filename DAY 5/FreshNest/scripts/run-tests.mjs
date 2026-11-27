// Dependency-free tests: search accuracy, address parsing, image-map safety. Run: npm test
import assert from 'node:assert/strict';
import { runSearch, suggest, applyFilters, DEFAULT_FILTERS } from '../src/lib/search.js';
import { products } from '../src/data/products.js';
import { parseNominatim, parseBackend } from '../src/lib/geocode.js';
import { imageFor } from '../src/data/productImages.js';

let pass = 0, fail = 0;
const t = (name, fn) => { try { fn(); pass++; console.log('  ✓', name); } catch (e) { fail++; console.log('  ✗', name, '\n     ', e.message.split('\n')[0]); } };
const names = q => runSearch(q).results.map(r => r.p.name);
const brandsOf = q => [...new Set(runSearch(q).results.map(r => r.p.brand))];

console.log('Search');
t('Egg / Eggs / EGGS / spaced → only eggs', () => { for (const q of ['Egg', 'Eggs', '  EGGS  ', 'eGg']) assert.deepEqual(names(q), ['Free-Range Eggs']); });
t('Milk → milk products only (no chocolate)', () => { const n = names('Milk'); assert.ok(n.includes('Full Cream Milk') && n.includes('Toned Milk')); assert.ok(!n.some(x => /chocolate|cookie|cake/i.test(x))); assert.ok(runSearch('Milk').results.every(r => r.p.category.startsWith('Dairy') || r.p.category.startsWith('Cold'))); });
t('Milk ranks real milk above buttermilk', () => { const r = runSearch('Milk').results; assert.equal(r[0].cls, 'head'); assert.ok(r.findIndex(x => x.p.name === 'Buttermilk') > r.findIndex(x => x.p.name === 'Toned Milk')); });
t('Amul → only Amul products', () => { assert.deepEqual(brandsOf('Amul'), ['Amul']); assert.ok(names('amul').length >= 5); });
t('Bread → bread products, not dairy/eggs', () => { const n = names('Bread'); assert.ok(n.includes('Brown Bread') && n.includes('Garlic Bread')); assert.ok(!n.includes('Free-Range Eggs') && !n.includes('Curd') && !n.includes('Full Cream Milk')); });
t('Apple → apples only (no other fruit, no juice)', () => assert.deepEqual(names('Apple'), ['Shimla Apple']));
t('Apples (plural) → same', () => assert.deepEqual(names('apples'), ['Shimla Apple']));
t('Atta → Whole Wheat Atta first, flours after', () => { const n = names('Atta'); assert.equal(n[0], 'Whole Wheat Atta'); assert.ok(n.every(x => /atta|flour/i.test(x))); });
t('Coca Cola / coca-cola / cocacola / coke → Coca-Cola products', () => { for (const q of ['Coca Cola', 'coca-cola', 'cocacola', 'coke']) { assert.deepEqual(brandsOf(q), ['Coca-Cola'], q); assert.equal(names(q)[0], 'Coca-Cola Original Taste', q); } });
t('Biscuit → biscuit-type products, no pet biscuits', () => { const n = names('Biscuit'); assert.deepEqual(n, ['Suji Rusk']); });
t('"dog biscuit" does not return unrelated products', () => assert.deepEqual(names('dog biscuit'), []));
t('Typos: milkk, egs, chese, bannana, tomatto', () => { assert.ok(names('milkk').includes('Toned Milk')); assert.deepEqual(names('egs'), ['Free-Range Eggs']); assert.ok(names('chese').includes('Cheddar Cheese')); assert.ok(names('bannana').includes('Robusta Banana')); assert.ok(names('tomatto').includes('Tomato')); });
t('Synonyms: anda → eggs, aata → atta, dahi → curd', () => { assert.deepEqual(names('anda'), ['Free-Range Eggs']); assert.equal(names('aata')[0], 'Whole Wheat Atta'); assert.equal(names('dahi')[0], 'Curd'); });
t('Multi-word: brown bread, amul milk', () => { assert.deepEqual(names('brown bread'), ['Brown Bread']); assert.ok(runSearch('amul milk').results.every(r => r.p.brand === 'Amul')); });
t('Aisle intent: dairy / fruits stay in their aisle', () => { assert.ok(runSearch('dairy').results.every(r => r.p.category === 'Dairy, Bread & Eggs')); assert.ok(runSearch('fruits').results.every(r => r.p.category === 'Fruits & Vegetables')); assert.ok(!names('dairy').includes('Free-Range Eggs')); });
t('Category words inside a category name do not dump the category', () => { assert.ok(names('eggs').length === 1); assert.ok(names('rice').every(x => /rice/i.test(x))); });
t('Nonsense / unrelated → no results', () => { for (const q of ['zzzz', 'iphone', 'laptop charger', 'milk xyz']) assert.equal(names(q).length, 0, q); });
t('Filler-only query returns nothing; empty returns all', () => { assert.equal(names('the').length, 0); assert.equal(runSearch('').results.length, products.length); });
t('Soft words: "fresh milk online" falls back to milk', () => assert.ok(names('fresh milk online').includes('Toned Milk')));
t('Exact product name ranks first', () => { assert.equal(names('Full Cream Milk')[0], 'Full Cream Milk'); assert.equal(names('curd')[0], 'Curd'); });
t('Type-ahead: "eg" → Free-Range Eggs, "ama" → Amul brand', () => { assert.deepEqual(names('eg'), ['Free-Range Eggs']); assert.ok(suggest('am').some(s => s.kind === 'Brand' && s.label === 'Amul')); });
t('Suggestions: "egg" → eggs product, no category dump; "dairy" → category', () => { const s = suggest('egg'); assert.equal(s[0].label, 'Free-Range Eggs'); assert.ok(!s.some(x => x.kind === 'Category')); assert.ok(suggest('dairy').some(x => x.kind === 'Category')); });
t('Suggestions: typo offers "Did you mean"', () => assert.equal(suggest('milkk')[0].kind, 'Did you mean'));
t('Every popular search returns results', () => ['Milk', 'Atta', 'Bananas', 'Noodles', 'Eggs', 'Chocolate', 'Ghee', 'Dog Food'].forEach(q => assert.ok(names(q).length > 0, q)));
t('applyFilters keeps filters + sort working with a query', () => { const out = applyFilters(products, 'milk', { ...DEFAULT_FILTERS, brands: ['Amul'] }, 'low'); assert.ok(out.length && out.every(p => p.brand === 'Amul')); });
t('No accidental dumping: no query returns > 40% of the catalogue except aisles/units', () => { for (const q of ['egg', 'milk', 'bread', 'apple', 'atta', 'amul', 'coca cola', 'biscuit', 'rice', 'oil']) assert.ok(names(q).length < products.length * 0.15, q); });

console.log('Address parsing');
t('Nominatim: Indian address → readable text + PIN', () => {
  const r = parseNominatim({ display_name: 'x', address: { house_number: '12', road: 'Sample Street', suburb: 'Adyar', city: 'Chennai', state: 'Tamil Nadu', postcode: '600 020', country: 'India', country_code: 'in' } });
  assert.deepEqual(r, { text: '12 Sample Street, Adyar, Chennai', pin: '600020', city: 'Chennai', state: 'Tamil Nadu', country: 'India', countryCode: 'in' });
});
t('Nominatim: falls back to display_name; bad postcode ignored', () => { const r = parseNominatim({ display_name: 'Somewhere, India', address: { postcode: 'ABC', country_code: 'in' } }); assert.equal(r.text, 'Somewhere, India'); assert.equal(r.pin, ''); });
t('Nominatim: error body → null', () => assert.equal(parseNominatim({ error: 'Unable to geocode' }), null));
t('Backend contract parsed; junk rejected', () => { assert.equal(parseBackend({ text: ' A  b ', pin: '560001' }).text, 'A b'); assert.equal(parseBackend({}), null); assert.equal(parseBackend({ text: 5 }), null); });

console.log('Images');
t('All 400 catalogue entries have photos and no rotating pack sizes', () => {
  assert.equal(products.length, 400);
  assert.ok(products.every(p => imageFor(p)));
  assert.equal(products.find(p => p.id === '13-9').unit, '4.5 g');
});
t('Unmapped product IDs have no photo', () => { assert.equal(imageFor({ id: 'missing', name: 'Unknown', brand: 'Unknown' }), null); });
t('Same id with changed name/brand never shows a stale photo (logic)', async () => {
  const mod = await import('../src/data/productImages.js'); mod.PRODUCT_IMAGES['t-1'] = { name: 'A', brand: 'B', src: '/products/x.webp', verified: '2026-01-01', license: 'x' };
  assert.ok(mod.imageFor({ id: 't-1', name: 'A', brand: 'B' })); assert.equal(mod.imageFor({ id: 't-1', name: 'A', brand: 'C' }), null); delete mod.PRODUCT_IMAGES['t-1'];
});

console.log(`\n${pass} passed, ${fail} failed`); process.exit(fail ? 1 : 0);
