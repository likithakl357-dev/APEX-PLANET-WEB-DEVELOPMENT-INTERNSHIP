# FreshNest API

Base URL for local development is `http://localhost:4000/api`. JSON requests use `Content-Type: application/json`. Protected routes use `Authorization: Bearer <token>`. Request errors have an `error` property. All order and address access is scoped to the signed-in user.

| Purpose | Route |
| --- | --- |
| Health and public configuration | GET /health, /config, /service-areas |
| Catalogue | GET /categories, /products, /products/:id |
| Email sign-in | GET /auth/options, POST /auth/email/request {email}, POST /auth/email/verify {email, otp} |
| Google sign-in | POST /auth/google {credential} |
| Online checkout | POST /orders/:number/razorpay, POST /orders/:number/razorpay/verify |
| Razorpay capture webhook | POST /webhooks/razorpay |
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

## Commercial API additions

| Purpose | Route |
| --- | --- |
| Guest cart merge after sign-in | POST /cart/merge |
| Revoke sessions | POST /auth/logout and POST /auth/logout-all |
| Public configuration | GET /config, GET /service-areas |
| Adjust delivery zones and fees | PUT /admin/delivery-zones/:pin and PUT /admin/delivery-pricing |
| Authoritative checkout quote | POST /checkout/quote |
| Seller stores and listings | GET or POST /seller/stores and PUT /seller/stores/:id/listings/:product |
| Seller order fulfilment | GET /seller/fulfilment and PATCH /seller/fulfilment/:id |
| Admin store approval and settlement | GET /admin/stores, PATCH /admin/stores/:id, GET /admin/store-orders, POST /admin/store-orders/:id/settlement |
| Rider availability | GET or PUT /delivery/availability |
| Customer and rider delivery proof | POST /orders/:number/delivery-code and POST /delivery/assignments/:id/confirm |
| Payment reconciliation and refund | POST /orders/:number/razorpay/reconcile, POST /admin/orders/:id/refund-request, POST /admin/refunds/:id/razorpay |
| Notifications and restock | GET /notifications, POST /notifications/read, PUT /products/:id/stock-watch |
| Coupon management | GET /admin/coupons and PUT /admin/coupons/:code |
| Health and liveness | GET /health and GET /live |

Cart merge accepts mergeId (UUID) and items with productId and quantity. The UUID is scoped to a user and can be safely retried. Checkout quote accepts addressId, couponCode, gift and tip. Include the confirmed expectedTotal when placing the order to reject a changed payable amount. A refund request requires an amount in INR, a reason and a requestKey UUID; orderItemId is optional. Razorpay requests and callbacks use server-calculated paise.
