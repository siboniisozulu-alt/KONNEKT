# KONNEKT authentication/backend implementation audit

## Interactive/local layer
- Demo-only registration, verification simulation, sign-in and local password reset remain available.
- PBKDF2/Web Crypto demo password hashing is for preview only and is not a replacement for a server identity provider.

## Connected staging layer (requires configuration)
- Supabase browser client loads with public anon/publishable key only.
- Supabase Auth sign-up captures display name, requires acceptance of testing terms/privacy notice, supports email confirmation, sign-in and reset.
- Auth trigger creates profile records.
- Profile editor syncs name, username, bio and avatar path.
- Direct chat starts by unique username through a SECURITY DEFINER RPC that verifies membership and block state.
- Message records use authenticated sender identity and conversation membership RLS; Supabase Realtime listens for inserts.
- Reels and Status upload to private buckets; published Reel audience and Status expiry are checked server-side.
- Follows, blocks, reports, notifications and push subscription tables have RLS policies.

## Trusted Edge Functions
- `delete-account`: removes user-linked messages/reports/media and deletes the Auth identity.
- `export-account`: returns account data visible to the signed-in user as JSON metadata.
- `moderation-inbox` / `moderation-review`: moderator-only report queue and status updates using trusted app metadata.
- `cleanup-expired-statuses`: secret-protected cleanup endpoint for scheduled expiry cleanup.
- `livekit-token`: checks conversation membership and block state before issuing a short-lived LiveKit token.
- `send-push`: verifies message sender, then sends web push to the other conversation members' registered subscriptions.

## Limitations
- No owner credentials have been supplied; no real Supabase project has been connected.
- Edge Functions have not been deployed or executed in a live environment.
- SMTP, rate limits/CAPTCHA, LiveKit account, VAPID keys, scheduled cleanup, monitoring and backups require owner configuration.
- Account export includes database records/metadata, not a packaged download of every media blob.
- PWA web push is scaffolded; native Android Firebase push is not included.
- Android wrapper is scaffolded with Capacitor; native project generation/signing and device QA remain.
- POPIA notice is a draft and must be completed/reviewed by a qualified professional.

## Security note
The Supabase service-role key, LiveKit API secret, VAPID private key, SMTP password and cleanup secret must only be stored in trusted Supabase Edge Function secrets. They must never be added to `konnekt_pwa/config.js`, browser JavaScript, screenshots or public Git history.
