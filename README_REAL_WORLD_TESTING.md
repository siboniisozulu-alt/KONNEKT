# KONNEKT — One-package closed real-world testing release

**Build:** 12 November 2026  
**Purpose:** prepare one source upload for a controlled, invited Android/PWA test.  
**Brand/UI:** existing purple-and-gold KONNEKT identity and six-tab navigation preserved.

## What this package contains

- Existing KONNEKT PWA UI and local preview features.
- Optional Supabase staging configuration and real hosted sign-up/sign-in/password reset.
- Remote profile editing, member discovery, follow/block/report actions.
- Real direct messaging by username, conversation membership RPC, database-backed messages and Supabase Realtime updates.
- Private profile avatar, Reel draft and Status uploads with signed media access.
- Reel publish, like and comment operations in the staging feed.
- Status audience checks, 24-hour expiry rules and cleanup Edge Function.
- LiveKit token Edge Function and audio/video call client integration.
- Web Push subscription and message notification sender scaffold.
- Account export/deletion Edge Functions and restricted moderator inbox/review tools.
- Supabase base schema + real-world migration, Edge Functions, RLS tests, legal draft notices, PWA deployment workflow and Capacitor Android wrapper.

## Important: what is not automatically live

The source code is prepared, but it is not connected to your Supabase or LiveKit projects until you add the correct project URL/public key and deploy the SQL and Edge Functions. Push delivery requires VAPID keys and a supported browser. Android native push is not included in this web-push setup. Email verification requires working SMTP. App-store signing, independent penetration testing, POPIA legal review, incident support and device/network testing remain release gates. Do not invite external testers until the test plan passes.

## One-time source upload

1. Create a private GitHub repository for KONNEKT staging.
2. Upload the contents of this package's root folder (not the outer ZIP) into the repository.
3. Edit `konnekt_pwa/config.js` and add only your Supabase project URL and public anon/publishable key. The public key is intended for browser use; never put service-role keys here.
4. In GitHub, enable Pages using **GitHub Actions**. The included workflow publishes `konnekt_pwa/` over HTTPS.
5. Add the deployed URL to `supabase/config.toml` and Supabase Authentication → URL Configuration.

The app source is uploaded once. Backend SQL and Edge Functions are then deployed to the Supabase project from the same repository using the CLI commands below. Those deployment steps cannot be replaced by uploading the PWA files to GitHub Pages.

## Connect Supabase staging

1. Create a separate Supabase project for staging. Do not use a production project.
2. Install Supabase CLI and run:

```bash
supabase login
supabase link --project-ref YOUR_PROJECT_REF
supabase db push
```

The two migrations create the tables, RLS policies, storage buckets, direct-chat RPC, notification tables and media visibility rules.

3. In Supabase Dashboard → Authentication → URL Configuration, set the Site URL to the deployed HTTPS URL and add that URL plus its `/**` redirect pattern.
4. Configure email SMTP under Authentication → SMTP Settings. Keep verification enabled. Use test inboxes.
5. In `konnekt_pwa/config.js`, set:

```js
window.KONNEKT_CONFIG = {
  SUPABASE_URL: 'https://YOUR_PROJECT.supabase.co',
  SUPABASE_ANON_KEY: 'YOUR_PUBLIC_ANON_OR_PUBLISHABLE_KEY',
  VAPID_PUBLIC_KEY: '',
  APP_ENV: 'staging',
  TERMS_VERSION: '2026-11-12',
  PRIVACY_VERSION: '2026-11-12'
};
```

6. Deploy Edge Functions:

```bash
supabase functions deploy delete-account
supabase functions deploy export-account
supabase functions deploy moderation-review
supabase functions deploy moderation-inbox
supabase functions deploy cleanup-expired-statuses --no-verify-jwt
supabase functions deploy livekit-token
supabase functions deploy send-push
```

7. Set trusted Edge Function secrets. `APP_ALLOWED_ORIGIN` must be only the website origin (scheme + hostname), without a repository path. Supabase injects its own `SUPABASE_URL`, `SUPABASE_ANON_KEY` and `SUPABASE_SERVICE_ROLE_KEY`; do not copy the service key into the app:

```bash
supabase secrets set APP_ALLOWED_ORIGIN=https://YOUR-KONNEKT-STAGING-DOMAIN
```

8. Assign a moderator only after choosing a trusted account. In Supabase SQL Editor, replace the email and run as project owner:

```sql
update auth.users
set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || '{"role":"moderator"}'::jsonb
where email = 'YOUR-MODERATOR-EMAIL';
```

The moderator must sign out and sign in again so the new role is present in the access token. The restricted dashboard is `/moderation.html`.

## Configure LiveKit audio/video calls

1. Create a LiveKit Cloud staging project (or a secured self-hosted LiveKit deployment).
2. Set its URL, API key and API secret only as Supabase Edge Function secrets:

```bash
supabase secrets set LIVEKIT_URL=wss://YOUR-LIVEKIT-HOST LIVEKIT_API_KEY=YOUR_API_KEY LIVEKIT_API_SECRET=YOUR_API_SECRET
```

3. Deploy `livekit-token` and test calls between two members of the same direct conversation. The server verifies conversation membership before minting a short-lived room token.
4. Review bandwidth, regional hosting, privacy terms and call recording policy. Do not record calls in the closed test.

## Configure web push (optional for first two-account test)

Generate a VAPID pair with a trusted web-push utility (for example, `npx web-push generate-vapid-keys --json`). Set the public key in `konnekt_pwa/config.js` and private key only in Supabase secrets:

```bash
supabase secrets set VAPID_PUBLIC_KEY=YOUR_PUBLIC_KEY VAPID_PRIVATE_KEY=YOUR_PRIVATE_KEY VAPID_SUBJECT=mailto:YOUR-MONITORED-SUPPORT-EMAIL
```

Push is supported through the PWA service worker in compatible browsers. Native Android Firebase push is not part of this package. If the push provider is not configured, messaging still works in-app and the sender function returns a configuration warning.

## Schedule expired Status cleanup

Enable `pg_cron`, `pg_net` and Vault in Supabase Dashboard → Database → Extensions. Set a long random cleanup secret as an Edge Function secret:

```bash
supabase secrets set CLEANUP_CRON_SECRET=YOUR_LONG_RANDOM_SECRET
```

Then use the SQL Editor to store the endpoint and secret in Vault and schedule the job (replace project URL and secret):

```sql
select vault.create_secret('https://YOUR_PROJECT.supabase.co/functions/v1/cleanup-expired-statuses','konnekt_cleanup_url');
select vault.create_secret('YOUR_LONG_RANDOM_SECRET','konnekt_cleanup_secret');
select cron.schedule('konnekt-status-cleanup','*/15 * * * *', $$
  select net.http_post(
    url := (select decrypted_secret from vault.decrypted_secrets where name='konnekt_cleanup_url'),
    headers := jsonb_build_object('Content-Type','application/json','x-cleanup-secret',(select decrypted_secret from vault.decrypted_secrets where name='konnekt_cleanup_secret')),
    body := '{}'::jsonb
  );
$$);
```

Verify the scheduled job and Edge Function logs. If Vault/cron is unavailable on the chosen plan, use a trusted external scheduler; do not expose the cleanup secret in browser code.

## Android installable build

The app can first be installed as a PWA from Chrome on Android after HTTPS deployment. For a native Android wrapper, install Node.js, Java and Android Studio, then run from the repository root:

```bash
npm install
npx cap add android
npx cap sync android
npx cap open android
```

Use Android Studio to build a debug APK for invited testers. A signed release APK/AAB, Play Console configuration, privacy disclosures and native push integration are separate tasks. Do not publish to the Play Store as part of this closed test.

## Required test order

1. Two verified test accounts and profile usernames.
2. Two-way direct chat and realtime delivery.
3. RLS negative tests and private media isolation.
4. Reel/Status upload, publish and expiry.
5. Follow/block/report and moderator queue.
6. LiveKit call with mic/camera permissions.
7. Export/delete, backup restore, error monitoring and device/network QA.
8. Legal/POPIA review and explicit approval before adding 5–10 invited adult testers.

Use `testing/REAL_WORLD_TEST_PLAN.md` and `backend/RLS_TEST_PLAN.md` as release gates. Keep a test evidence log. A passing SQL deployment alone is not a security sign-off.

## Legal and support completion before inviting anyone

Complete `legal/PRIVACY_NOTICE.md` with the responsible party name, physical/business address, monitored privacy contact, actual provider locations, retention periods and data request process. Review the testing Terms and Privacy Notice with a South African privacy professional. Set up a monitored support and incident-reporting email before the first invite.
