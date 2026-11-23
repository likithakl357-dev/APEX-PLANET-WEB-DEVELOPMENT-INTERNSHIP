# FreshNest full-stack integration work

## Frontend
- Preserved the original FreshNest React/Vite structure, brand palette, routes and catalogue IDs.
- Replaced the fixed `1234` OTP demo with a backend-generated, expiring OTP flow and JWT session.
- Added API client and account hydration from PostgreSQL after login.
- Frontend catalogue is refreshed from the database so price, discount, brand, category, stock and verified image metadata come from the API.
- Cart, wishlist and address changes now persist through authenticated API calls.
- Checkout submits the saved address, coupon, gift option and tip to the server; the server recalculates totals and checks stock.
- Authenticated checkout exposes Cash on Delivery only; online payment options are disabled until a real gateway exists.
- Customer cancellation calls the backend and restores inventory in a transaction.
- Admin dashboard no longer permits browser-only role switching. It requires a server-side ADMIN role and uses database metrics, orders, product prices and inventory.
- Added explicit backend connection state in the top strip.

## Backend and database
- Added Express API, JWT authentication, bcrypt OTP hashing, Zod validation, Helmet, CORS and rate limiting.
- Added Prisma schema and PostgreSQL migration for users, addresses, products, images, inventory, stock movements, cart, wishlist, orders, payments, coupons, sellers, delivery, support, returns and audit logs.
- Added idempotent seed script for the original 400 catalogue items, categories, brands, stock and sample coupons.
- Added transactional order creation, server-side price/coupon calculation, stock decrement, order snapshots and cancellation stock restoration.
- Added admin-only product/inventory/order endpoints and a verified product-image registration endpoint.
- Added support, returns, seller application and delivery partner API foundations.

## Deliberately not represented as complete
- No genuine product photographs could be safely verified for the sample catalogue. All 400 items use placeholders; no AI or unrelated images were substituted.
- SMS provider, online payment gateway, production delivery dispatch/live tracking UI, and complete seller/support frontend workflows remain unconfigured.
- Full PostgreSQL integration tests and frontend production build could not be executed in this environment because npm dependency installation and a PostgreSQL service were unavailable.
