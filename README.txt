KONNEKT — CLOSED REAL-WORLD TESTING PWA
Build date: 12 November 2026

This PWA preserves the purple-and-gold KONNEKT design and the Reels → Chats → Calls → Status → Discover → Profile navigation.

LOCAL PREVIEW
The app still supports local preview data on this browser/device. Demo accounts are not production accounts.

REAL STAGING MODE
1. Create a dedicated Supabase STAGING project.
2. Edit config.js and enter only the project URL and public anon/publishable key.
3. Apply the Supabase migrations in ../supabase/migrations using Supabase CLI.
4. Deploy the Edge Functions and configure Auth redirect URLs, SMTP, LiveKit and optional VAPID secrets as described in ../README_REAL_WORLD_TESTING.md.
5. Host this folder over HTTPS and open it in Chrome on Android.
6. Use Account → Connect staging to create and verify two separate test accounts.

REAL STAGING FEATURES
- Supabase email/password registration, email verification, sign-in and password reset.
- Profile sync and unique username-based direct chats.
- Database-backed conversations, messages and Realtime message updates.
- Follow/unfollow, block and account report actions.
- Private profile avatar, Reel draft and Status media uploads.
- Published Reel feed, likes and comments.
- Status audience access and 24-hour expiry cleanup job.
- LiveKit audio/video call token flow (requires LiveKit secrets).
- Web Push subscriptions and push sender (requires VAPID keys; browser PWA only).
- Account export/deletion and restricted moderator dashboard Edge Functions.

SECURITY
Never put a Supabase service_role key, LiveKit API secret, VAPID private key, SMTP password or cleanup secret in config.js or any browser code. Use Supabase Edge Function secrets. Keep staging separate from production. RLS and storage policies must pass the two-account negative-access tests before inviting testers.

LIMITATIONS / RELEASE GATES
The project is not connected to a real backend until your project credentials and deployments are supplied. SMTP, LiveKit, VAPID push and scheduled cleanup require provider/project configuration. Android native push, signed production app release, independent penetration testing, POPIA legal review, monitoring, backup-restore test and real-device QA remain required. The package is for controlled adult invited testing only, not a public launch.

See ../README_REAL_WORLD_TESTING.md, ../testing/REAL_WORLD_TEST_PLAN.md and ../backend/RLS_TEST_PLAN.md.
