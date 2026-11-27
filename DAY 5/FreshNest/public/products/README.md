# Product photos

Put **real product photographs** here (never AI-generated, never hotlinked, never Google result thumbnails), then register each one in `src/data/productImages.js`.

Workflow
1. `npm run images:list` → `image-review/product-list.csv` (id, brand, name, pack size, suggested file name).
2. For each product, find the photo of the *exact* product (brand, variant, pack size) on the brand's/manufacturer's product page or an authorised retailer; confirm you may reuse it (permission, licence, or a supplier-provided asset pack). Google Images is fine for *discovering* the page. Download the file from that page, not the thumbnail.
3. Save it here (e.g. `public/products/dairy/amul-taaza-toned-milk-500-ml.webp`; ≤ 400 KB, square or portrait, plain background).
4. Add the entry to `PRODUCT_IMAGES` (name, brand, src, alt, source, license, verified date).
5. `npm run images:check`: fails on missing files, stale names/brands, missing source/licence, or one photo reused for different products.

Products without a verified entry show a labelled placeholder (brand, name, pack size). A wrong photo is never preferred over a placeholder.

Representative photographs for loose produce are listed in [PHOTO_CREDITS.md](PHOTO_CREDITS.md). The storefront labels them as produce photos.
