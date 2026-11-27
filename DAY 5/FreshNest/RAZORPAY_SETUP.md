# Razorpay checkout and refunds

Set RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET and RAZORPAY_WEBHOOK_SECRET in backend/.env. Reuse your verified Test Mode credentials for testing. Restart Express and make a small test order. COD remains a separate option.

Create a webhook in the Razorpay dashboard at your publicly reachable HTTPS API endpoint with path /api/webhooks/razorpay. Subscribe to payment.captured, refund.processed and refund.failed. Set the same webhook secret at Razorpay and in FreshNest. For local verification use an HTTPS tunnel that forwards only the intended endpoint to the local API. Remove the tunnel after testing and keep its endpoint separate from production. Configure automatic payment capture and enable the payment methods you are eligible to offer.

Check the pending order and payment in Razorpay and FreshNest. The backend verifies the saved gateway order ID, amount in paise, currency and captured status. If a webhook arrives late, the customer can open the existing payment from tracking. The retry reconciles captured payments before it allows checkout to open.

Use the admin order actions to record a refund request, then use the Refunds tab to submit it. A gateway refund ID and signed webhook or reconciliation are required to mark the online refund complete. Item-linked refund caps are enforced by the API. COD requires verified manual refund evidence. Payment delivery methods shown within Razorpay are controlled by the merchant account, device and mode.

For an unpaid order whose gateway checkout already exists, reconcile the payment in Razorpay before any stock release. Orders without a gateway order can be cancelled by an administrator. Live Mode requires merchant activation, approved methods and a separate acceptance pass with your own legitimate account.

[Razorpay Web Standard Checkout](https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/integration-steps/) · [Idempotent refund requests](https://hdfcbank-collectnow-docs.razorpay.com/api/refunds/normal-refunds-idempotent/)
