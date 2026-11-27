# FreshNest maps and delivery upgrade

Source: FreshNest-Commercial-Final.zip. The existing theme, product catalogue, images, authentication, payment code and database schema are retained. No new migration is required for the maps upgrade; it uses existing coordinate fields and order JSON snapshots. Any original commercial migrations that have not been applied still need to be deployed after a backup.

## Windows local setup

Extract the archive to Downloads/FreshNest-Maps-Upgrade. The project root is the inner FreshNest folder. Stop previous servers. Copy the working backend/.env from the commercial version (do not share or commit it).

```powershell
cd "$env:USERPROFILE\Downloads\FreshNest-Maps-Upgrade\FreshNest"
Copy-Item "$env:USERPROFILE\Downloads\FreshNest-Commercial-Final\FreshNest\backend\.env" "backend\.env"
npm install leaflet@1.9.4 --save-exact
cd backend
npm ci
npm run prisma:generate
npm run dev
```

The Leaflet package is deliberately installed on your machine: npm registry access was unavailable in the packaging environment, so the original dependency manifest and lockfile are retained until the install command updates both. Do not use npm ci alone for the frontend on this archive.

In a second terminal, from project root: `npm run dev -- --port 5173 --strictPort`.

## Distance pricing and ETA

Add these to backend/.env (edit existing entries if any):

```
DELIVERY_PER_KM=5
DELIVERY_INCLUDED_KM=2
DELIVERY_SPEED_KMH=20
DELIVERY_PREP_MINUTES=10
FULFILMENT_LAT=
FULFILMENT_LON=
```

Fill the last two fields with your actual central dispatch location decimal coordinates, if using centralized stock. Leave them blank if unknown. Approved seller stores already support coordinates; the seller workspace now lets you select a store pin. Restart backend after editing. The surcharge is optional (default zero) and applies above the included straight-line distance, rounded up in whole rupees. For multiple stores, use the farthest straight-line distance, not the sum of road legs. Standard zone fees apply if any fulfilment point or the delivery pin lacks coordinates. Existing free-delivery threshold and coupons override the surcharge. Estimates use preparation plus distance/speed, with configured zone ETA as a minimum. No actual road navigation, traffic, guarantees, or verified street geocoding. Browser GPS or manually chosen pins may be inaccurate or spoofed; validate against actual service zones and addresses before commercial use.

## Tests on your PC

1. Customer: sign in, open delivery address, click Use current GPS location, allow permission, choose location on map, verify the address and save. Manual address entry is supported; automatic street-address lookup still requires a configured VITE_GEOCODE_ENDPOINT. Never send confidential address information to public geocoding services.
2. Seller: create store with actual pickup pin, serviceable PIN(s), radius and stock; approve store and listings via admin. Existing nearest eligible seller per item selection is retained. With multiple stores, this is not route optimization; central stock fallback still exists.
3. Checkout: select a serviceable address with a saved pin. The server quote uses store/central origin and applies configured distance surcharge. Test under free-delivery threshold without a free-delivery coupon, then verify free delivery above threshold. Verify COD and test Razorpay totals match the quote.
4. Admin: confirm, process, pack and assign the order using existing workflows. Seller sub-orders must be packed first.
5. Driver: in a separate browser profile, log in as assigned driver, accept, pick up, move out for delivery, and enable Share delivery location. Keep the page open. The customer tracking page polls approximately every 15 seconds; open Show delivery map. Check marker movement and timestamp; stale reports are labelled. Complete using existing delivery confirmation code. GPS stops on page close or toggle off, and terminal order updates are rejected by backend.
6. GPS works on localhost or HTTPS; a phone accessing a laptop's plain HTTP LAN IP generally cannot access GPS. Use authenticated HTTPS deployment or a secure development setup for cross-device testing. Browser background throttling means this is not a native background tracking service.

## Map provider

Leaflet is free/open-source. Development tiles use OpenStreetMap with attribution. Public tile service is subject to https://operations.osmfoundation.org/policies/tiles/ and has no guaranteed service level; configure an appropriate provider before commercial deployment via VITE_MAP_TILE_URL and VITE_MAP_ATTRIBUTION in frontend .env.local. Map tile requests reveal the viewed region to that provider. Do not use private keys in VITE_* settings. The map opens on explicit user click. Existing reverse-geocoder endpoint remains optional.

## Verification

Executed 5 new delivery math tests, 4 existing pricing tests, 33 existing dependency-free frontend checks (all passed). Modified backend JS syntax checks passed. npm registry unavailable: frontend dependency install/build, JSX runtime, real browser maps, live DB, GPS, and full provider regression tests were not run in this environment. Run `npm run build`, `npm test`, and `npm --prefix backend test` after installing dependencies; some integration tests require a dedicated database. No claim of production readiness.
