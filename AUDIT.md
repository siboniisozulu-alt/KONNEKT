# KONNEKT real-world testing readiness audit

**Build:** 12 November 2026  
**Scope:** static source review and package preparation. This is not a live Supabase or security certification.

## Included in this package

- Purple-and-gold PWA design and six-section navigation preserved.
- Local preview features and demo-only authentication retained.
- Supabase staging configuration, sign-up/sign-in/password reset integration and profile creation flow.
- Profile sync, username-based direct conversation RPC, database-backed messaging and Realtime subscription.
- Discovery of authenticated profiles, follow/unfollow, block and account report actions.
- Private avatar, Reel and Status storage upload paths; signed media access; Reel publish/like/comment actions.
- Status expiry enforcement and cleanup Edge Function scaffold.
- LiveKit token Edge Function and audio/video client integration.
- Web Push subscription, service worker display and message push sender scaffold.
- Account export/deletion Edge Functions and moderator inbox/review functions/dashboard.
- Base SQL + staging migration, RLS plan, deployment instructions, legal draft notices, GitHub Pages workflow and Capacitor Android wrapper.

## Static validation completed

- Inline JavaScript blocks: syntax checks passed.
- `backend.js`, `sw.js`, `config.js`, `config.example.js`: Node syntax checks passed.
- PWA manifest: JSON parse passed.
- Supabase Edge Function TypeScript source: all Edge Function files passed TypeScript transpilation/syntax checks; no Deno/Supabase runtime available in this environment.
- Browser/device smoke test: attempted with local Chromium but blocked by the execution environment's browser policy. No claim of manual UI/device test.
- SQL: source-reviewed and ordered as CLI migrations; not applied to a live PostgreSQL/Supabase project.
- Supabase Realtime, Auth SMTP, Storage, Edge Functions, LiveKit and Push: not connected or tested against owner credentials.

## Still required before inviting real testers

1. Add the staging Supabase URL and public anon/publishable key to `konnekt_pwa/config.js`.
2. Link Supabase CLI and apply both migrations to a dedicated staging project.
3. Configure Auth redirect URLs, SMTP, email verification and rate limits/CAPTCHA.
4. Deploy all Edge Functions and set trusted secrets.
5. Configure LiveKit and optional VAPID push keys.
6. Enable scheduled Status cleanup and verify it runs.
7. Create two separate verified accounts and unique usernames.
8. Pass every positive and negative RLS/storage test in `backend/RLS_TEST_PLAN.md`.
9. Test messaging, Reels, Status, blocks, reports, account export/deletion and calls on real Android devices and real networks.
10. Complete legal/POPIA review, fill responsible-party/support contacts, configure backups/restore, monitoring and incident response.
11. Obtain an independent security review before expanding the cohort.

## Release assessment

**Package status:** code and deployment scaffold prepared for one coordinated source upload.  
**Backend status:** not live until deployed and configured.  
**Real-world test status:** not yet approved.  
**Public launch status:** not ready.

Do not label any production service as 100% complete until the relevant deployment and end-to-end tests have passed and evidence has been recorded.
