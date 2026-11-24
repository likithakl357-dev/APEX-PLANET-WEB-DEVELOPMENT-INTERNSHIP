// Example reverse-geocoding proxy (Node 18+, no dependencies). It keeps the PRIVATE API key on the server.
//
//   GOOGLE_MAPS_API_KEY=xxxx ALLOWED_ORIGIN=http://localhost:5173 node server/geocode-proxy.example.mjs
//   then in .env.local:  VITE_GEOCODE_ENDPOINT=http://localhost:8787/api/reverse-geocode
//
// Contract (what the frontend expects):  GET /api/reverse-geocode?lat=..&lon=..
//   → 200 { "text": "12 Sample St, Adyar, Chennai", "pin": "600020", "city": "Chennai", "state": "Tamil Nadu", "country": "India", "countryCode": "in" }
//   → 4xx/5xx on failure (the app then asks the customer to type the address).
// Swap the `lookup` function to use Mapbox / LocationIQ / OpenCage instead. Restrict the key (API + server IP) in the provider console.
import http from 'node:http';

const PORT = Number(process.env.PORT || 8787);
const KEY = process.env.GOOGLE_MAPS_API_KEY || '';
const UPSTREAM = process.env.GEOCODE_UPSTREAM || 'https://maps.googleapis.com/maps/api/geocode/json'; // override only for tests
const ORIGIN = process.env.ALLOWED_ORIGIN || 'http://localhost:5173';
const hits = new Map(); // naive per-IP limit: 30 requests / minute. Use a real rate limiter in production.

const pick = (c, ...types) => c.find(x => types.some(t => x.types.includes(t)))?.long_name || '';
async function lookup(lat, lon) {
  const r = await fetch(`${UPSTREAM}?latlng=${lat},${lon}&language=en&key=${encodeURIComponent(KEY)}`);
  const j = await r.json();
  if (j.status !== 'OK' || !j.results?.length) throw new Error(`upstream: ${j.status || r.status}`);
  const res = j.results[0], c = res.address_components;
  const line1 = [pick(c, 'street_number'), pick(c, 'route')].filter(Boolean).join(' ');
  const text = [...new Set([line1, pick(c, 'neighborhood'), pick(c, 'sublocality_level_1', 'sublocality'), pick(c, 'locality')].filter(Boolean))].join(', ') || res.formatted_address;
  const cc = c.find(x => x.types.includes('country'));
  return { text, pin: pick(c, 'postal_code'), city: pick(c, 'locality'), state: pick(c, 'administrative_area_level_1'), country: cc?.long_name || '', countryCode: (cc?.short_name || '').toLowerCase() };
}

http.createServer(async (req, res) => {
  const send = (code, body) => { res.writeHead(code, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': ORIGIN, Vary: 'Origin' }); res.end(JSON.stringify(body)); };
  const u = new URL(req.url, 'http://x');
  if (req.method === 'OPTIONS') return send(204, {});
  if (u.pathname !== '/api/reverse-geocode' || req.method !== 'GET') return send(404, { error: 'not found' });
  const ip = req.socket.remoteAddress, now = Date.now(); const h = (hits.get(ip) || []).filter(t => now - t < 60000);
  if (h.length >= 30) return send(429, { error: 'too many requests' }); h.push(now); hits.set(ip, h);
  const lat = Number(u.searchParams.get('lat')), lon = Number(u.searchParams.get('lon'));
  if (!Number.isFinite(lat) || !Number.isFinite(lon) || Math.abs(lat) > 90 || Math.abs(lon) > 180) return send(400, { error: 'invalid coordinates' });
  if (!KEY && UPSTREAM.includes('googleapis')) return send(500, { error: 'GOOGLE_MAPS_API_KEY is not set on the server' });
  try { send(200, await lookup(lat, lon)); } catch (e) { send(502, { error: String(e.message || e) }); }
}).listen(PORT, () => console.log(`reverse-geocode proxy on :${PORT}`));
