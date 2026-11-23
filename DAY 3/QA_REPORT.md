# QA report

## Checks executed in the build workspace

| Check | Result |
|---|---|
| Existing frontend test suite | 32 passed, 0 failed |
| Backend order-pricing unit tests | 4 passed, 0 failed |
| Backend JavaScript syntax checks (`node --check`) | Passed |
| Product catalogue export | 400 rows |
| Product image audit script | 400 products, 0 verified photos, 400 placeholders |
| Product image-map safety check | Passed |
| Frontend production build | Not run: dependencies could not be installed in the build workspace |
| Prisma schema validation/generation | Not run: Prisma packages could not be installed in the build workspace |
| PostgreSQL migration execution | Not run: no PostgreSQL server available in the build workspace |
| Full API integration tests | Not run: require PostgreSQL and installed backend dependencies |

## Manual verification required on Windows

1. Install PostgreSQL and create the `freshnest` database.
2. Install backend and frontend npm dependencies.
3. Generate Prisma Client, deploy migration and run seed.
4. Check `/api/health`.
5. Register/login using development OTP.
6. Verify product list, cart, wishlist and addresses survive logout/re-login.
7. Create a COD order; verify order record and stock decrement in PostgreSQL.
8. Cancel an eligible order; verify stock is restored.
9. Promote an account to ADMIN and verify admin routes reject customer accounts.
10. Verify admin order status and inventory changes are persisted.

The above manual checks have not been represented as passed in this report.
