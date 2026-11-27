# Google Sign-In

1. Open Google Cloud Console and create or select the project that will own FreshNest sign-in.
2. In Google Auth Platform, configure Branding and Audience with your application name, support contact, developer contact and intended audience. If using an external testing configuration, list the accounts that will test it.
3. In Clients, create an OAuth client of type Web application.
4. Add http://localhost and http://localhost:5173 to Authorized JavaScript origins for the default local setup. Add the exact production HTTPS origin for deployment. Origins use the scheme, hostname and port where applicable.
5. Copy the client ID to GOOGLE_CLIENT_ID in backend/.env. Restart Express. This uses the Google Identity Services JavaScript callback and does not need a redirect URI or client secret.
6. Open FreshNest and select Continue with Google. Confirm that the Google-managed account chooser opens and that a repeat sign-in reaches the same FreshNest account. Test with an email-verified FreshNest account and confirm that the existing record is reused for a Gmail or Google Workspace identity.
7. Before public launch, complete Google Auth Platform publishing and any branding or domain verification requested in the console. If you configure CSP or COOP on your frontend, allow the documented Google Identity Services resources and popup behavior.

FreshNest validates Google token signatures, issuer, audience, age and verified email. Its account association uses Google's stable subject. A Google account using a third-party email address without a Workspace claim is kept separate from an email-code account. Existing profile emails and phone users are not automatically merged.

[Google Identity Services setup](https://developers.google.com/identity/gsi/web/guides/get-google-api-clientid) · [ID token verification](https://developers.google.com/identity/gsi/web/guides/verify-google-id-token)
