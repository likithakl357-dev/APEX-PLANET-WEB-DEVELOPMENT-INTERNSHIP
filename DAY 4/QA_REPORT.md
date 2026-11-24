# FreshNest release verification

Checks ran on Windows with Node.js 26 and a disposable local PostgreSQL 18 database. The existing user database was untouched.

| Check | Observed result |
| --- | --- |
| Frontend production build | Passed with Vite 7.3.8. Built files are in dist. |
| Frontend automated checks | 32 passed. |
| Backend automated tests | 5 passed with the integration API enabled, including 4 pricing tests. |
| Prisma Client generation and schema validation | Passed. |
| Blank database migration and seed | All three migrations applied. The seed imported 400 products, 20 categories and 105 brands. |
| PostgreSQL integration | Local sign-in and code reuse rejection, auth and ownership checks, addresses, cart, wishlist, order placement, concurrent duplicate retry, stock decrement and restoration, cancellation and ticket creation passed. |
| Operations API smoke checks | Admin support reply, customer follow-up, seller approval and listing publication, partial address and product updates, delivery assignment and completion, COD payment status and return request passed. |
| Chrome browser smoke checks | Desktop and 390 px mobile storefront, local sign-in, egg search, add to cart, checkout address entry, COD order confirmation and tracking passed. |
| Catalogue image audit | 400 placeholders and 0 verified product photos. Image mapping checks passed. |
| Dependency audit | Zero frontend advisories. Four high-severity entries remained in the Prisma 6 package and its toolchain dependency chain. |

Existing database upgrades, Docker build, CI execution, commercial go-live, physical delivery, GPS permission flows and manual money movement were outside runtime verification. See [the handoff](DEVELOPMENT_HANDOFF.md) for release limitations.
