import { products } from '../data/products.js';
import { load, save } from './money.js';
// Admin/seller edits are stored as overrides in localStorage (demo only; a backend will own this data).
export const applyOverrides = () => { const o = load('fn_overrides', {}); products.forEach(p => { if (o[p.id]) Object.assign(p, o[p.id]); }); };
export const setOverride = (p, patch) => { Object.assign(p, patch); const o = load('fn_overrides', {}); o[p.id] = { ...(o[p.id] || {}), ...patch }; save('fn_overrides', o); };
