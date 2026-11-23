# FreshNest — Day 5 Frontend (React + Vite)

Quick-commerce grocery storefront. Builds on the Day 3 project; the FreshNest theme (cream/green palette, DM Sans + Manrope, rounded cards) is preserved.
**Everything is a frontend demo: no backend, no real payments, no live tracking.**

## Run
```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build
npm test           # search accuracy, address parsing and image-map safety tests (no extra dependencies)
npm run images:check   # validate src/data/productImages.js against the catalogue and public/products
npm run images:list    # export the catalogue as a CSV checklist for sourcing real photos
```
Demo login: any valid 10-digit Indian mobile (starts 6–9), OTP **1234**.
Demo service-area PINs: 600001, 600020, 600040, 600096, 560001 (serviceable); 999999 (not serviceable).
Coupons: FRESH50 (min ₹399), NEST10 (min ₹299), FIRST25 (first order only, min ₹199), FREEDEL (min ₹199).

## Day 5 changes
1. **Product images** — `src/data/productImages.js` is the single, verified-only image map (see `public/products/README.md`). The Day 4 runtime Open Food Facts lookup (slow, fuzzy, source of mismatches) was removed. Products without a verified photo show a labelled placeholder (brand, name, pack size). **No real photos are bundled yet** — see Limitations.
2. **Logo** — original SVG mark (basket + leaves) in `public/brand/` (`logo-mark`, `logo-full`, `logo-stacked`, SVG + PNG), `favicon.svg` + PNG icons, `components/Logo.jsx`. Used in the header, footer, login screen and inside the existing hero circle.
3. **Search** — `lib/search.js` + `lib/searchLexicon.js`: ranked exact-name → name → synonym → brand → aisle; plural/case/space/typo tolerant; every query word must match (no padding with unrelated items); category words no longer dump a whole aisle; suggestions with keyboard navigation, "Did you mean", clear button, proper empty state. Add synonyms/aisles in `searchLexicon.js`.
4. **Use current location** — in the location modal. `lib/geolocation.js` (browser API, only after a click), `lib/geocode.js` (reverse geocoding), `components/LocationModal.jsx`. Detected address is shown for confirm/edit, saved through the existing address store (with coordinates) and used for the PIN serviceability check.

### Location setup
* Browsers only allow geolocation on **HTTPS or `localhost`** (`npm run dev` is fine).
* Default geocoder: OpenStreetMap Nominatim, called from the browser, **no API key**. Fine for demos; its usage policy forbids heavy use, and it must not be used for type-ahead.
* Production: run a small backend that holds a private key (Google Geocoding, Mapbox, LocationIQ, OpenCage…) and set `VITE_GEOCODE_ENDPOINT` (see `.env.example`). `server/geocode-proxy.example.mjs` is a dependency-free example for Google (`GOOGLE_MAPS_API_KEY=… node server/geocode-proxy.example.mjs`). Never expose a private key through `VITE_*` variables.
* If the lookup fails, the customer sees the coordinates and types the address instead; the manual flow is always available.

## Structure
```
src/
  main.jsx              app shell, routing, footer, logout confirm
  lib/store.jsx         state (cart, wishlist, addresses, orders…) + localStorage + hash router
  lib/pricing.js        bill, per-product GST, coupons    lib/search.js  search/filter/sort
  lib/overrides.js      admin/seller edits (localStorage)
  data/                 catalogData.js (Day 3 catalogue), products.js, config.js (fees, coupons, areas, stages)
  components/           Header, ProductCard/Row, ProductImage, CartDrawer, LocationModal, AddressManager
  pages/                Home, Search, Product, Offers, Checkout, Tracking(+Confirmation), Account, Support, Info, Admin(+Seller), Login
  styles/extra.css      new styles (style.css from Day 3 is unchanged)
```
Routes (hash): `/`, `/search?q=&cat=`, `/product/:id`, `/offers`, `/checkout`, `/confirmed/:id`, `/track/:id`, `/account/:section`, `/support`, `/info/:slug`, `/admin`, `/seller`.
A backup of the untouched Day 3 source is in `../freshnest-day2-backup` (not included in the zip).

## Simulated (frontend-only)
Login/OTP · payments (incl. failure/retry toggle) · delivery ETA & serviceability · order tracking (stage advances every 12 s; map is an illustration) · delivery partner · support chat replies · tickets/returns/refund status · wallet · cashback/bank offers · price-drop & back-in-stock alerts · seller registration · admin/seller data and role switch (NOT security) · reviews & ratings · product variants · GST rates (sample slabs).

## Needs backend integration
Auth/OTP service · product/inventory/pricing API · orders & order state machine · payment gateway & refunds · live GPS / delivery-partner tracking, production geocoding backend · delivery-partner dispatch · notifications (push/SMS/email) · support ticketing/chat · file upload for evidence · coupon engine & first-order checks · GST/tax engine · real authorization for admin/seller · recommendation engine (current logic is deterministic rules).

## Known limitations
- Product photos: none verified yet. Every product shows a labelled placeholder until a real photo is added to `src/data/productImages.js`. The catalogue itself is sample data (many brand/name/pack-size combinations are not real SKUs), so some products may have no genuine photo to find until the catalogue is replaced with real SKUs.
- Ingredients, nutrition, manufacturer and shelf-life are **not** provided and are labelled "Not provided (sample data)". Reviews are generated samples.
- Day 3 catalogue quirks kept (not silently changed): six names occur in two categories (Buttermilk, Trail Mix, Donut, Pizza Base, Cotton Buds, Matchbox) and some brand assignments are loose (e.g. Buttermilk under a drinks brand).
- Catalogue has the existing 20 categories (not the 20 named in the new brief, e.g. no Meat & Seafood, Stationery or Electronics, since no suitable data exists).
- Delivery slots/serviceability are mock; cancellation allowed only before the "Packed" stage (sample policy, not legal text).
- Not done: BOGO/bundle price calculation (display only), saved-address default sync with header location beyond selection, evidence file upload (filename only), Day 3 packshot lookup is not cached across sessions.
