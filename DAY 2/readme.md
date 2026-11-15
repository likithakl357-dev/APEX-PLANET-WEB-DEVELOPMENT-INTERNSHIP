# FreshNest – Day 2 Updated

A React + Vite grocery storefront prototype.

## Run locally

```bash
npm install
npm run dev
```

Open the local URL printed by Vite (usually http://localhost:5173).

## Changes in this revision

- Product cards now display real photographic category imagery from the Unsplash CDN (not AI-generated art), with an emoji fallback if an image cannot load.
- Product records display recognisable Indian grocery brands (for example Amul, Britannia, Aashirvaad, Tata Sampann, Fortune, MAGGI, Kellogg's, Cadbury, Haldiram's, Kissan, Tata Tea and Nescafé).
- Search matches product names, brand names, categories and tags. Typing expands the result list; Enter scrolls to the product results; the clear control resets the search.
- Account/logout now opens a confirmation dialog. Cancel keeps the user signed in; confirmation logs out.

## Image note

The images are real food/product-category photographs served from Unsplash, not generated images. They are category-level illustrative photos, not verified packshots for every individual SKU. Exact branded packaging images should be added from approved brand/distributor product feeds or assets with permission before a public/commercial launch.

## Demo limitations

- OTP verification is local demo-only; OTP is `1234`.
- Login, cart and wishlist use browser localStorage.
- Product catalogue is generated sample data for UI testing, not live inventory or verified pricing.
- Location lookup remains browser-based and is intentionally not changed in this revision.
- No backend, SMS gateway, payment gateway or production order service is connected.


## Latest review revision
- Search is now a real form with a visible Search button and Enter submission; it clears category filters and scrolls to matching products.
- Catalogue is reduced to 400 distinct demo SKUs (20 per category) rather than multiplying 20 names into 100 near-duplicates.
- Each SKU is assigned an individual image URL from a pool of real Unsplash photographs. These are representative photographs, not verified exact brand packaging. For exact Amul/Britannia/etc. packshots, use approved product-feed assets or licensed image URLs; do not rely on scraping Google Images.
- The existing demo OTP, cart, logout confirmation and delivery-fee logic remain frontend-only.

## Latest catalogue and homepage correction
- Homepage leads with the category grid; product listings stay hidden until a category is selected or a search is submitted.
- Added a compact six-item offers section below the categories.
- Reduced the sample catalogue to five products per category (100 total).
- Removed the incorrect shared photo pool. Product cards now use product-specific illustrations (for example, curd uses a bowl and rice uses a rice bowl) instead of unrelated stock photos.
- Offer prices and discounts are demo values, not live pricing.
