# FreshNest API

Base URL for local development is `http://localhost:4000/api`. JSON requests use `Content-Type: application/json`. Protected routes use `Authorization: Bearer <token>`. Request errors have an `error` property. All order and address access is scoped to the signed-in user.

| Purpose | Route |
| --- | --- |
| Health and public configuration | GET /health, /config, /service-areas |
| Catalogue | GET /categories, /products, /products/:id |
| Local sign-in | POST /auth/otp/request {phone}, POST /auth/otp/verify {phone, otp} |
| Account | GET /auth/me, PATCH /auth/profile |
| Cart | GET /cart, PUT or DELETE /cart/items/:productId |
| Wishlist | GET /wishlist, PUT /wishlist/:productId {saved} |
| Addresses | GET or POST /addresses, PUT or DELETE /addresses/:id |
| Checkout and order history | GET or POST /orders, GET /orders/:id |
| Cancellation | POST /orders/:id/cancel |
| Returns | POST /orders/:id/returns {reason} |
| Support | GET or POST /support/tickets, POST /support/tickets/:id/messages {message} |
| Admin support | GET /admin/support/tickets, PATCH /admin/support/tickets/:id {status, message?} |
| Admin dashboard | GET /admin/overview, /admin/products, /admin/orders, /admin/sellers, /admin/returns, /admin/refunds |
| Seller workspace | POST /seller/apply, GET /seller/me, GET or POST /seller/products |
| Delivery workspace | GET /delivery/assignments, PATCH /delivery/assignments/:id/status, POST /delivery/assignments/:id/location |

Product listing accepts page, limit, q, category, brand and sort. Cart updates take a quantity. Address creation requires line1, city, state and a six-digit pin. Support ticket creation requires subject and message. Admin ticket status is OPEN, IN_PROGRESS, RESOLVED or CLOSED.

Checkout takes `addressId` and accepts `idempotencyKey`, `couponCode`, `customerNote`, `gift`, `tip` and `checkoutDetails`. Payment defaults to COD. Send a UUID idempotency key for each new order attempt and reuse it when retrying that attempt. A successful response returns the same order for repeated requests under the same account and key. Use a new key for a new purchase. The API checks address coverage, cart inventory, coupon eligibility and pricing in a transaction.
