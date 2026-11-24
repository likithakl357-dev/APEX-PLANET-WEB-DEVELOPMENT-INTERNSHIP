# FreshNest product-image audit

Audit generated from the current 400-item sample catalogue.

| Measure | Result |
|---|---:|
| Catalogue products | 400 |
| Verified genuine photographs | 0 |
| Products using safe placeholders | 400 |
| AI-generated product photographs | 0 |
| Broken product-photo references | 0 |

## Why no photos were marked verified

The current catalogue is a demo catalogue: several product names are generic rather than exact retail SKUs, pack sizes are generated from a small rotating list, and brand assignments are sample mappings. A genuine image cannot be safely matched to an exact brand, flavour, pack size and variant for many of these entries. The project therefore keeps the product-specific placeholder rather than using a random, AI-generated, mismatched or unlicensed image.

## Verification standard

An image can be added only after confirming the exact SKU/variant and pack size, checking that the image is genuine, recording the original product page, documenting permission/licence terms, and recording the verification date. The backend admin endpoint also requires an explicit verification flag and licence note. Do not treat a Google Images thumbnail as an image source.

See `public/products/README.md` and `src/data/productImages.js` for the image workflow. The current audit is not a claim that product photography is complete.
