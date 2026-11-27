// Reverse geocoding: coordinates → a readable address.
//
// A configured reverse-geocoding endpoint is optional. Manual address entry remains available.

// FRESHNEST_GEOCODE_DEFAULT
const env = import.meta.env || {};
const ENDPOINT = env.VITE_GEOCODE_ENDPOINT || `${(env.VITE_API_URL || 'http://localhost:4000/api').replace(/\/$/, '')}/reverse-geocode`; 
export const geocoderName = () => (ENDPOINT ? 'Geoapify' : 'manual address entry');

const clean = s => String(s ?? '').replace(/\s+/g, ' ').trim();
const uniq = arr => arr.filter((x, i) => x && arr.findIndex(y => y.toLowerCase() === x.toLowerCase()) === i);
export const asPin = v => { const d = String(v ?? '').replace(/\s+/g, ''); return /^\d{6}$/.test(d) ? d : ''; };

/** Nominatim `jsonv2` (addressdetails=1) → { text, pin, city, state, country, countryCode } */
export function parseNominatim(json) {
  const a = json?.address; if (!a) return null;
  const city = a.city || a.town || a.village || a.municipality || a.county || a.state_district || '';
  const line1 = clean([a.house_number, a.building].filter(Boolean).join(' ') + (a.road ? ` ${a.road}` : ''));
  const text = uniq([line1, a.neighbourhood, a.suburb, a.city_district, city].map(clean)).join(', ') || clean(json.display_name);
  if (!text) return null;
  return { text, pin: asPin(a.postcode), city: clean(city), state: clean(a.state), country: clean(a.country), countryCode: String(a.country_code || '').toLowerCase() };
}

/** Backend contract: { text, pin?, city?, state?, country?, countryCode? } */
export function parseBackend(json) {
  if (!json || typeof json.text !== 'string' || !clean(json.text)) return null;
  return { text: clean(json.text), pin: asPin(json.pin), city: clean(json.city), state: clean(json.state), country: clean(json.country), countryCode: String(json.countryCode || '').toLowerCase() };
}

/** Resolves a parsed address, or throws. Caller decides how to fall back (show coordinates / manual entry). */
export async function reverseGeocode(lat, lon, { signal, timeoutMs = 10000 } = {}) {
  if (!ENDPOINT) throw new Error('Enter the address manually to confirm delivery.');
  const ctl = new AbortController(); const timer = setTimeout(() => ctl.abort(), timeoutMs);
  const abort = () => ctl.abort(); signal?.addEventListener('abort', abort);
  try {
    const url = `${ENDPOINT}${ENDPOINT.includes('?') ? '&' : '?'}lat=${lat}&lon=${lon}`;
    const res = await fetch(url, { signal: ctl.signal, headers: { Accept: 'application/json' } });
    if (!res.ok) throw new Error(`Address lookup failed (${res.status})`);
    const parsed = parseBackend(await res.json());
    if (!parsed) throw new Error('No address found for these coordinates');
    return parsed;
  } finally { clearTimeout(timer); signal?.removeEventListener('abort', abort); }
}
