// Reverse geocoding: coordinates → a readable address.
//
// Default: OpenStreetMap Nominatim (free, no API key, called straight from the browser).
//   Good for demos and light use. Its usage policy forbids heavy/bulk use, so for production
//   use your own backend (below).
// Production: set VITE_GEOCODE_ENDPOINT to a backend route you control. The backend holds the private API key
//   (Google Geocoding, Mapbox, LocationIQ, OpenCage…) and returns the normalised JSON described in
//   server/geocode-proxy.example.mjs. NEVER put a private geocoding key in frontend code or VITE_* variables.

const ENDPOINT = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GEOCODE_ENDPOINT) || '';
export const geocoderName = () => (ENDPOINT ? 'your configured address service' : 'OpenStreetMap Nominatim');

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
  const ctl = new AbortController(); const timer = setTimeout(() => ctl.abort(), timeoutMs);
  const abort = () => ctl.abort(); signal?.addEventListener('abort', abort);
  try {
    const url = ENDPOINT
      ? `${ENDPOINT}${ENDPOINT.includes('?') ? '&' : '?'}lat=${lat}&lon=${lon}`
      : `https://nominatim.openstreetmap.org/reverse?format=jsonv2&addressdetails=1&zoom=18&accept-language=en&lat=${lat}&lon=${lon}`;
    const res = await fetch(url, { signal: ctl.signal, headers: { Accept: 'application/json' } });
    if (!res.ok) throw new Error(`Address lookup failed (${res.status})`);
    const parsed = (ENDPOINT ? parseBackend : parseNominatim)(await res.json());
    if (!parsed) throw new Error('No address found for these coordinates');
    return parsed;
  } finally { clearTimeout(timer); signal?.removeEventListener('abort', abort); }
}
