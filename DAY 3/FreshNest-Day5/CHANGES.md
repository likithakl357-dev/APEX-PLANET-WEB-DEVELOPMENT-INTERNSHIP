# FreshNest Day 5: change list

New: src/components/Logo.jsx · src/lib/{searchLexicon,geolocation,geocode}.js · src/data/productImages.js · public/{favicon.svg,favicon-32.png,apple-touch-icon.png,icon-512.png,brand/*,products/README.md} · scripts/{run-tests,check-images,export-product-list,search-report}.mjs · server/geocode-proxy.example.mjs · .env.example · image-review/product-list.csv
Rewritten: src/lib/search.js · src/components/{ProductImage,LocationModal}.jsx
Edited: Header.jsx (logo, suggestions, keyboard nav, clear) · AddressManager.jsx (onSaved/onChange/submitLabel) · Search.jsx (relevance sort, did-you-mean, empty state, clear search) · Home.jsx (logo in hero circle, thumbs) · main.jsx (footer logo) · Login.jsx (logo) · CartDrawer.jsx / Checkout.jsx (thumbs) · Product.jsx (image note) · catalogData.js (emoji order fix: "Butter Bun" no longer shows butter) · styles/extra.css · index.html · package.json (scripts, v5.0.0) · README.md
Unchanged: cart, wishlist, checkout, pricing, coupons, orders, tracking, account, support, admin/seller logic and data.
Behaviour notes: popular-search chip "Maggi" → "Noodles" (no MAGGI products exist; it returned nothing). Picking an address in the location modal (including manual entry) now selects it immediately.
