import { products, sellPrice, categoryList } from '../data/products.js';
import { SYNONYM_GROUPS, RELATED, GROUPS, SOFT_WORDS, PET_CONTEXT } from './searchLexicon.js';

export const POPULAR_SEARCHES = ['Milk', 'Atta', 'Bananas', 'Noodles', 'Eggs', 'Chocolate', 'Ghee', 'Dog Food'];

/* =============================================================================
   FreshNest search
   -----------------------------------------------------------------------------
   Ranking (highest first), as requested:
     1. exact product-name match            (query == whole product name)
     2. product-name match                  (query word is the product's head noun, e.g. "egg" → Farm Eggs;
                                             then matches on other words, e.g. "milk" → Milk Chocolate)
     3. synonym match                       (anda → egg, biscuit → cookie / cracker / rusk)
     4. brand match                         (amul, coca cola)
     5. category / aisle match              (only when the query *names* the aisle: "dairy", "snacks", "pooja")
   A word that merely appears inside a category name ("Eggs" in "Dairy, Bread & Eggs") never pulls in the
   whole category. Every query word must be satisfied by the product (AND), so unrelated items are not
   added to pad the list. Plurals, case, extra spaces, punctuation and small typos are tolerated.
   Lexicon (synonyms, aisle groups) lives in searchLexicon.js so it can be maintained separately.
   ============================================================================= */

/* ---------- normalisation ---------- */
const STOP = new Set(['and', 'the', 'of', 'for', 'with', 'in', 'a', 'an', 'by', 'to', 'from', 'on', 'or']);
const UNIT = { kg: 'kg', kgs: 'kg', g: 'g', gm: 'g', gms: 'g', gram: 'g', grams: 'g', ml: 'ml', l: 'l', ltr: 'l', litre: 'l', litres: 'l', liter: 'l', liters: 'l', pack: 'pack', packs: 'pack', pc: 'pieces', pcs: 'pieces', piece: 'pieces', pieces: 'pieces' };
const IRREGULAR = { leaves: 'leaf', loaves: 'loaf', knives: 'knife', mangoes: 'mango', potatoes: 'potato', tomatoes: 'tomato', chilies: 'chilli', chillies: 'chilli' };

const fold = s => String(s ?? '').toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
  .replace(/(\d+)(?:\.(\d+))?\s*(kgs?|gms?|grams?|g|ml|ltr|litres?|liters?|l|packs?|pcs?|pieces?)\b/g, (_, n, d, u) => ` ${n}${d ? 'p' + d : ''}${UNIT[u]} `)
  .replace(/[’'`]/g, '').replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, ' ').trim();

export function stem(w) {
  if (w.length <= 3 || /^\d/.test(w)) return w;
  if (IRREGULAR[w]) return IRREGULAR[w];
  if (w.endsWith('ies') && w.length > 4) return w.slice(0, -3) + 'y';
  if (w.endsWith('ie') && w.length > 4) return w.slice(0, -2) + 'y';        // cookie/cookies, brownie/brownies
  if (/(oes|ches|shes|xes|sses|zes)$/.test(w)) return w.slice(0, -2);
  if (w.endsWith('s') && !/(ss|us|is)$/.test(w)) return w.slice(0, -1);
  return w;
}
export const tokenize = s => fold(s).split(' ').filter(t => t && !STOP.has(t)).map(stem);

/* Damerau-Levenshtein (optimal string alignment), bounded by `max`. */
function distance(a, b, max) {
  if (a === b) return 0; if (Math.abs(a.length - b.length) > max) return max + 1;
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) {
    const c = a[i - 1] === b[j - 1] ? 0 : 1;
    d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + c);
    if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
  }
  return d[a.length][b.length];
}

/* ---------- lexicon, compiled once ---------- */
const phrase = s => tokenize(s);
const key = arr => arr.join(' ');
const EQUIV = SYNONYM_GROUPS.map(g => g.map(phrase));                       // true synonyms (both ways)
const RELATED_MAP = Object.entries(RELATED).map(([k, v]) => [phrase(k), v.map(phrase)]); // one-way "also relevant"
const GROUP_LIST = GROUPS.map(g => ({ ...g, phrases: g.aliases.map(phrase) }));
const SOFT = new Set(SOFT_WORDS.map(stem));
const PET = new Set(PET_CONTEXT.map(stem));

/* ---------- per-product index (rebuilt automatically if admin edits change a product) ---------- */
const indexCache = new WeakMap();
function indexOf(p) {
  const sig = `${p.name}|${p.brand}|${p.category}|${p.unit}`;
  const hit = indexCache.get(p);
  if (hit && hit.sig === sig) return hit;
  const ix = { sig, name: tokenize(p.name), brand: tokenize(p.brand), attr: tokenize(p.unit).filter(t => /^\d/.test(t)) };
  indexCache.set(p, ix); return ix;
}

let vocabCache = { sig: '', map: new Map(), list: [] };
function vocab() {
  const sig = products.length + ':' + products.map(p => `${p.name}|${p.brand}`).join('~');
  if (vocabCache.sig === sig) return vocabCache;
  const map = new Map(); const add = (t, w = 1) => { if (t.length > 1) map.set(t, (map.get(t) || 0) + w); };
  products.forEach(p => { const ix = indexOf(p); ix.name.forEach(t => add(t, 3)); ix.brand.forEach(t => add(t, 1)); ix.attr.forEach(t => map.set(t, 1)); });
  EQUIV.flat().forEach(ph => ph.forEach(t => add(t, 1))); RELATED_MAP.forEach(([, v]) => v.flat().forEach(t => add(t, 1)));
  GROUP_LIST.forEach(g => g.phrases.forEach(ph => ph.forEach(t => add(t, 1))));
  vocabCache = { sig, map, list: [...map.keys()] }; return vocabCache;
}

/* Resolve each query word against the vocabulary: exact, prefix (last word only, for type-ahead), or typo-corrected. */
function resolve(tokens) {
  const { map, list } = vocab();
  return tokens.map((t, i) => {
    if (/^\d/.test(t) || map.has(t)) return { t, kind: 'exact' };
    if (i === tokens.length - 1 && t.length >= 2 && list.some(v => v.startsWith(t))) return { t, kind: 'prefix' };
    const max = t.length <= 2 ? 0 : t.length <= 6 ? 1 : 2;
    if (max) {
      let best = [], bd = max + 1;
      for (const v of list) {
        if (t.length <= 4 && v[0] !== t[0]) continue;
        const dist = distance(t, v, max);
        if (dist < bd) { bd = dist; best = [v]; } else if (dist === bd && dist <= max) best.push(v);
      }
      if (best.length && bd <= max) { best.sort((a, b) => map.get(b) - map.get(a)); return { t: best[0], kind: 'fuzzy', from: t }; }
    }
    return { t, kind: 'unknown' };
  });
}

/* ---------- matching one product against one resolved query ---------- */
const SCORE = { lit: { head: 800, mod: 600, brand: 250, attr: 60 }, syn: { head: 400, mod: 300, brand: 220, attr: 60 } };
const hasToken = (arr, r) => {
  let found = -1;
  arr.forEach((x, i) => { if (r.kind === 'prefix' ? x.startsWith(r.t) : x === r.t) found = i; }); // prefer later (head) position
  return found;
};

function matchProduct(p, rq, mode) {
  const ix = indexOf(p); const S = SCORE[mode];
  let total = 0, headHit = false, nameHit = false, allBrand = true, nameCount = 0; const usedExact = new Set();
  for (const r of rq) {
    let best = 0, field = '';
    const ni = hasToken(ix.name, r);
    if (ni >= 0) { const head = ni === ix.name.length - 1; best = head ? S.head : S.mod; field = head ? 'head' : 'mod'; }
    if (best < S.brand && hasToken(ix.brand, r) >= 0) { best = S.brand; field = 'brand'; }
    if (!best && ix.attr.includes(r.t)) { best = S.attr; field = 'attr'; }
    if (!best) return null;                                   // every query word must be satisfied
    if (r.kind === 'prefix') best *= 0.9; if (r.kind === 'fuzzy') best -= 60;
    if (field === 'head') headHit = true; if (field === 'head' || field === 'mod') { nameHit = true; nameCount++; }
    if (field !== 'brand') allBrand = false;
    if (r.kind === 'exact') usedExact.add(r.t);
    total += best;
  }
  if (mode === 'syn' && nameHit && !headHit) return null;     // synonyms must hit the product's main noun (no "Pav Bhaji Masala" for bread)
  let score = total / rq.length;
  const exact = mode === 'lit' && ix.name.length === rq.length && rq.every(r => r.kind === 'exact' && ix.name.includes(r.t)) && ix.name.every(t => usedExact.has(t));
  if (exact) score += 400;
  if (nameHit) score += (nameCount / ix.name.length) * 100;  // shorter, more specific names rank higher
  if (allBrand && rq.length === ix.brand.length) score += 100; // whole-brand match ("coca cola")
  const cls = mode === 'syn' ? 'syn' : exact || headHit ? 'head' : nameHit ? 'mod' : allBrand ? 'brand' : 'attr';
  return { p, score, cls, exact };
}

/* ---------- synonym expansion & aisle groups ---------- */
function alternatives(tokens) {
  const out = []; const seen = new Set([key(tokens)]);
  const tryReplace = (from, tos) => {
    for (let i = 0; i + from.length <= tokens.length; i++) {
      if (key(tokens.slice(i, i + from.length)) !== key(from)) continue;
      for (const to of tos) { const alt = [...tokens.slice(0, i), ...to, ...tokens.slice(i + from.length)]; if (!seen.has(key(alt))) { seen.add(key(alt)); out.push(alt); } }
    }
  };
  EQUIV.forEach(g => g.forEach(ph => tryReplace(ph, g.filter(x => x !== ph))));
  RELATED_MAP.forEach(([from, tos]) => tryReplace(from, tos));
  return out;
}

const SORT_TIE = (a, b) => b.score - a.score || (Number(b.p.reviews) - Number(a.p.reviews)) || a.p.name.localeCompare(b.p.name);

function attempt(tokens) {
  const rq = resolve(tokens);
  if (rq.some(r => r.kind === 'unknown')) return { results: [], rq };
  const found = new Map(); const keep = r => { const old = found.get(r.p.id); if (!old || r.score > old.score) found.set(r.p.id, r); };
  products.forEach(p => { const m = matchProduct(p, rq, 'lit'); if (m) keep(m); });
  alternatives(rq.map(r => r.t)).forEach(alt => { const ra = alt.map(t => ({ t, kind: 'exact' })); products.forEach(p => { if (found.get(p.id)?.cls === 'head') return; const m = matchProduct(p, ra, 'syn'); if (m) keep(m); }); });

  // Aisle / category intent: only when the whole query names the aisle.
  const qKeys = [key(rq.map(r => r.t)), ...alternatives(rq.map(r => r.t)).map(key)];
  const hitGroups = GROUP_LIST.filter(g => g.phrases.some(ph => qKeys.includes(key(ph))));
  hitGroups.forEach(g => products.forEach(p => { if (g.test(p) && !found.has(p.id)) found.set(p.id, { p, score: 100, cls: 'group' }); }));

  let results = [...found.values()];
  // When the query names an aisle ("dairy", "fruits"), stay inside that aisle: partial brand/modifier hits elsewhere
  // (Mother Dairy A2 Ghee, Fruit Bread) are dropped, and aisle members are ordered by popularity.
  if (hitGroups.length) results = results.flatMap(r => r.cls === 'head' || r.cls === 'group' || r.cls === 'syn' ? [r] : hitGroups.some(g => g.test(r.p)) ? [{ ...r, score: 100, cls: 'group' }] : []);
  // "mod" matches (query word is a modifier, e.g. Milk Chocolate for "milk") are kept only in aisles where the
  // query is also the main noun of some product; this keeps "milk" away from chocolate and "apple" away from juice.
  const headCats = new Set(results.filter(r => r.cls === 'head').map(r => r.p.category));
  if (headCats.size) results = results.filter(r => r.cls !== 'mod' || headCats.has(r.p.category));
  // Pet-aisle products are for pet queries; drop them from general grocery queries when other results exist.
  const petQuery = tokens.some(t => PET.has(t));
  if (!petQuery && results.some(r => r.p.category !== 'Pet Supplies')) results = results.filter(r => r.p.category !== 'Pet Supplies' || r.cls === 'brand');
  return { results: results.sort(SORT_TIE), rq };
}

const runCache = new Map();
export function runSearch(raw) {
  const q = String(raw ?? '').trim(); const sig = vocab().sig.length + '|' + q;
  if (runCache.has(sig)) return runCache.get(sig);
  let tokens = tokenize(q); let out;
  if (!tokens.length) out = fold(q)
    ? { results: [], display: q, corrected: false, relaxed: false, all: false }          // only filler words, e.g. "a" or "the"
    : { results: products.map(p => ({ p, score: 0, cls: 'all' })), display: '', corrected: false, relaxed: false, all: true };
  else {
    let relaxed = false; let r = attempt(tokens);
    const lean = tokens.filter(t => !SOFT.has(t));
    if (!r.results.length && lean.length && lean.length < tokens.length) { r = attempt(lean); relaxed = true; tokens = lean; }
    const corrected = r.rq.some(x => x.kind === 'fuzzy');
    out = { results: r.results, display: corrected ? r.rq.map(x => x.t).join(' ') : q, corrected, relaxed, all: false };
  }
  if (runCache.size > 200) runCache.clear(); runCache.set(sig, out); return out;
}
export const searchMeta = q => { const { corrected, display, relaxed } = runSearch(q); return { corrected, display, relaxed }; };

/* ---------- type-ahead suggestions ---------- */
export function suggest(q) {
  const t = q.trim(); if (!t) return [];
  const r = runSearch(t); const out = [];
  if (r.corrected && r.results.length) out.push({ kind: 'Did you mean', label: r.display, q: r.display });
  r.results.filter(x => ['head', 'mod', 'syn'].includes(x.cls)).forEach(x => {
    if (out.filter(o => o.kind === 'Product').length >= 5) return;
    out.push({ kind: 'Product', label: x.p.name, sub: x.p.brand, q: x.p.name, id: x.p.id });
  });
  const qt = tokenize(t); const last = qt[qt.length - 1] || '';
  const brandSet = new Set();
  products.forEach(p => { const b = indexOf(p).brand; if (b.length && qt.every((w, i) => b.some(x => i === qt.length - 1 ? x.startsWith(w) : x === w))) brandSet.add(p.brand); });
  [...brandSet].slice(0, 2).forEach(b => out.push({ kind: 'Brand', label: b, q: b }));
  const seen = new Set();
  categoryList.forEach(c => {
    const names = tokenize(c.name); const g = GROUP_LIST.find(x => x.category === c.name);
    const hit = qt.length === 1
      ? last.length >= 3 && (names[0]?.startsWith(last) || g?.phrases.some(ph => ph.length === 1 && ph[0].startsWith(last)))
      : g?.phrases.some(ph => key(ph) === key(qt));
    if (hit && !seen.has(c.name)) { seen.add(c.name); out.push({ kind: 'Category', label: c.name, q: c.name, cat: c.name }); }
  });
  return out.slice(0, 8);
}

/* ---------- filters + sorting (existing behaviour preserved; text match is now the ranked search) ---------- */
export const DEFAULT_FILTERS = { category: 'All', brands: [], min: '', max: '', discount: 0, rating: 0, inStock: false, type: 'All' };

export function applyFilters(list, q, f, sort) {
  const ranked = q.trim() ? runSearch(q) : null;
  const order = ranked ? new Map(ranked.results.map((x, i) => [x.p.id, i])) : null;
  let out = list.filter(p => {
    if (order && !order.has(p.id)) return false;
    if (f.category !== 'All' && p.category !== f.category) return false;
    if (f.brands.length && !f.brands.includes(p.brand)) return false;
    const price = sellPrice(p);
    if (f.min !== '' && price < Number(f.min)) return false;
    if (f.max !== '' && price > Number(f.max)) return false;
    if (p.discount < f.discount) return false;
    if (Number(p.rating) < f.rating) return false;
    if (f.inStock && p.stock === 0) return false;
    if (f.type === 'Branded' && p.brand.startsWith('FreshNest')) return false;
    if (f.type === 'FreshNest own' && !p.brand.startsWith('FreshNest')) return false;
    return true;
  });
  const by = { low: (a, b) => sellPrice(a) - sellPrice(b), high: (a, b) => sellPrice(b) - sellPrice(a), discount: (a, b) => b.discount - a.discount,
    rating: (a, b) => Number(b.rating) - Number(a.rating), az: (a, b) => a.name.localeCompare(b.name), popular: (a, b) => b.reviews - a.reviews,
    relevance: order ? (a, b) => order.get(a.id) - order.get(b.id) : (a, b) => b.reviews - a.reviews }[sort];
  if (by) out = [...out].sort(by);
  return out;
}
