# FreshNest changes

- Applied a light mint, ivory and pastel palette to the storefront, account and checkout, with a light login screen and visible keyboard focus.
- Removed simulated online checkout, invented reviews, speculative product variants, fake cashback, the restarting sale timer and inactive social links. Customer account-deletion requests now create support tickets.
- Kept local sign-in codes and Cash on Delivery. Added database-backed order idempotency and repaired the blank-database migration.
- Added an admin ticket queue and customer replies. Customers see their own tickets and can follow their status.
- Updated Vite and Zod, added lockfiles and verified the source with a live isolated PostgreSQL database.

## Task 5

- Added a header PIN lookup that reads the backend's configured delivery coverage before customers enter an address.
- Added downloadable PDF receipts to order confirmation and tracking. The receipt includes item totals, discounts, fees and payment status.
- Added receipt generation tests, an evaluator walkthrough and screenshots.

## Task 5 photo update

- Bundled nine licensed representative produce photos as optimized local WebP files and added source credits.

## Full catalogue photo update

- Connected all 400 supplied photos by product ID and retained full-image fitting on desktop and mobile.
- Corrected visible catalogue brands and mislabeled products. Replaced rotating pack sizes with observed quantities or an unspecified status.
- Added a migration to update seeded product metadata on existing databases.

## Email and payments update

- Added Resend email delivery, email OTP sign-in and an animated verification state.
- Added Google Identity Services sign-in and server-side ID token validation.
- Added Razorpay checkout, signed capture reconciliation and payment retry from Order Tracking. COD remains available.

## Commercial workflow update

- Added public catalogue browsing, a persistent guest cart and idempotent stock-capped merging at sign-in.
- Enabled authenticated session revocation and removed on-screen email codes.
- Added PostgreSQL delivery zones and fee management, status and stock notifications, server quotes, store-specific inventory, seller picking queues and seller commission and settlement records.
- Added delivery proof, opt-in location reporting, availability, optional automatic assignment, provider-verified online refunds and admin-managed coupons.
- Added the deployment, provider, security and buyer documentation for this release.
