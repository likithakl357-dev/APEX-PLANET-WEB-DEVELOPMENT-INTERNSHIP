// =============================================================================
// FreshNest product image map: the single source of truth for product photos.
// -----------------------------------------------------------------------------
// RULES
//  * A product shows a photo ONLY if it has an entry below AND the entry still matches the catalogue
//    (same product name + brand). Otherwise a clean, product-specific placeholder is shown. A wrong photo is
//    never preferred over a placeholder.
//  * Photos are real product photographs, stored LOCALLY under public/products/ (never hotlinked, never
//    Google thumbnail URLs, never AI-generated). Download them from the brand / manufacturer product page,
//    an authorised retailer, or a database whose licence allows reuse, and record where they came from.
//  * Keys are product ids ("<category index>-<item index>", e.g. "1-10"). Run `npm run images:list`
//    to export the full catalogue (ids, names, brands, pack sizes) as a sourcing checklist.
//  * Run `npm run images:check` after editing: it fails on missing files, stale names/brands,
//    missing source/licence info, and one photo reused for different products.
//
// ENTRY FORMAT
//   '1-10': {
//     name: 'Farm Eggs', brand: 'FreshNest Farm',            // must equal the catalogue values (safety check)
//     src: '/products/dairy/farm-eggs-6pc.webp',              // file inside public/products/
//     alt: 'Tray of six brown eggs',                          // describe what the photo actually shows
//     source: 'https://example.com/product-page',             // page the photo came from
//     credit: 'Brand name',                                   // shown as a small caption on the card (optional)
//     license: 'Permission from brand, 2026-11-20',           // REQUIRED: permission / licence under which it is used
//     verified: '2026-11-20',                                 // date a person confirmed brand, variant and pack match
//   },
// =============================================================================

export const PRODUCT_IMAGES = {
  // No photographs have been verified yet. See public/products/README.md for the sourcing workflow.
};

/** Returns the verified photo entry for a product, or null (→ placeholder). */
export function imageFor(product) {
  const e = PRODUCT_IMAGES[product.id];
  if (!e || !e.src || !e.verified || !e.license) return null;
  if (e.name !== product.name || e.brand !== product.brand) return null; // catalogue changed since verification
  return e;
}
