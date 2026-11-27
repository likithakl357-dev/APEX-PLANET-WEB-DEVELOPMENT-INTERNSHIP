# Resend email sign-in

1. Create a sending API key in your own Resend account. Use your existing key if the integration already works.
2. Add and verify the sending domain in the Resend dashboard, then set RESEND_FROM to a sender on that domain. Set RESEND_API_KEY in backend/.env and restart Express.
3. With the Resend onboarding sender, test with your Resend account email. For other recipients, configure a verified domain and route mail through an address on it.
4. Request a code in FreshNest, check the recipient inbox, enter the six digits, then try the same code again to confirm it is single-use.

FreshNest generates the code and stores a keyed digest. Codes expire after five minutes. The API limits verification attempts and enforces a one-minute resend interval. The web UI never displays the sign-in code. A failed provider call does not show a success message.

[Resend Email API](https://resend.com/docs/api-reference/emails/send-email) · [Resend domain management](https://resend.com/docs/dashboard/domains/introduction)
