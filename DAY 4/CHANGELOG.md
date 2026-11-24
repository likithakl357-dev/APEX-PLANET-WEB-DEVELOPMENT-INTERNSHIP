# FreshNest changes

- Applied a light mint, ivory and pastel palette to the storefront, account and checkout, with a light login screen and visible keyboard focus.
- Removed simulated online checkout, invented reviews, speculative product variants, fake cashback, the restarting sale timer and inactive social links. Customer account-deletion requests now create support tickets.
- Kept local sign-in codes and Cash on Delivery. Added database-backed order idempotency and repaired the blank-database migration.
- Added an admin ticket queue and customer replies. Customers see their own tickets and can follow their status.
- Updated Vite and Zod, added lockfiles and verified the source with a live isolated PostgreSQL database.
