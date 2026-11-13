# KONNEKT 2.0 — controlled real-world testing checklist

This checklist is an implementation and release gate for the existing KONNEKT React 18/Vite/React Native Web + Capacitor app. Existing Supabase Auth, tables, storage buckets, policies and migrations are retained. Apply only reviewed additive migrations; never reset the database or expose a service-role key.

## Repository implementation baseline

- [x] Existing React/Vite application and screen registry retained.
- [x] Six main tab destinations are declared in order: Chats, Updates, Reels, Calls, Discover, Profile. Updates maps to Status and Reels maps to Watch.
- [x] Existing Supabase-backed chat, status, post, profile and call screens retained.
- [x] Existing authenticated Supabase client retained; browser publishable key is not a service-role secret.
- [x] Shared brand tokens, page theme metadata, PWA icon paths and Android launcher background updated additively.
- [ ] Verify all legacy screens and inline styles in both light and dark appearance.
- [ ] Rebuild and inspect Android launcher icons and splash screens on physical devices.

## Preflight — staging/test accounts

- [ ] Confirm intended Supabase project URL and publishable key in the deployment.
- [ ] Back up the project and compare each SQL migration against the deployed migration history before applying it.
- [ ] Confirm RLS is enabled and test with two ordinary authenticated accounts, not an admin/service-role session.
- [ ] Confirm storage bucket visibility, MIME and size limits, user-folder policies and signed URL expiry.
- [ ] Configure a secure TURN credentials endpoint for dependable calls; do not put permanent TURN credentials in Vite environment variables.
- [ ] Configure OneSignal/FCM if background Android push is required. In-app notifications while connected are not background push.
- [ ] Review legal drafts, safety escalation and moderation procedures before inviting external testers.

## Functional verification

### Navigation and profile
- [ ] Verify each of the six tabs opens the intended screen, active state is perceivable and back navigation returns correctly.
- [ ] Test narrow mobile, tablet and desktop widths; verify focus visibility and keyboard navigation.
- [ ] Test profile fetch/edit, username validation, save feedback, sign-out, privacy settings, block and report flows.

### Messaging
- [ ] With two test accounts, create a private conversation and verify only its participants can read messages and attachments.
- [ ] Send text and each supported attachment type; verify realtime arrival, timestamps, pagination, search, edit/delete permissions and reconnect behavior.
- [ ] Verify group creation, membership, administrator permissions and group media access.
- [ ] Validate unread/read/delivery indicators only where the schema and UI actually support them; do not imply end-to-end encryption.

### Updates and Reels
- [ ] Upload and view a real image and video status; confirm expiry filtering, privacy, failure behavior and owner deletion.
- [ ] Upload a real video Reel, then check playback, pause/resume, mute, feed navigation, comments, likes, follow state and creator profile on mobile.
- [ ] Confirm no test fixture or fabricated engagement count appears in production data.
- [ ] Verify status/reel media policies independently with an unauthorized account.

### Calls and notifications
- [ ] Use two accounts on separate devices; test voice and video calls, accept, decline, hang up, mute, camera toggle, camera switch, duration and reconnect.
- [ ] Test both Wi-Fi and mobile networks with TURN relay confirmed; record failures and call status for each attempt.
- [ ] Verify microphone/camera permission denial produces recoverable guidance.
- [ ] Verify incoming call behavior in foreground. Background delivery requires separately configured push services.

## Build and release evidence

- [ ] Run `npm ci` (or `npm install` when there is no lockfile) and `npm run build` in network-enabled CI.
- [ ] Run `npm run build:mobile`, `npx cap sync android`, then build/install the Android app with the existing signing setup.
- [ ] Check browser console, Android logs, Supabase logs, RLS denials, failed uploads and realtime disconnects.
- [ ] Attach test matrix, device/OS versions, browser versions, migration versions and known limitations to the release review.
- [ ] Do not label the app production-ready until real two-account, two-device tests pass and outstanding external configuration is completed.

## Known external dependencies and limits

- Calls use WebRTC and Supabase signalling; TURN configuration is required for reliable traversal of restrictive networks.
- Background push requires OneSignal/FCM setup and platform permissions.
- Supabase migrations, storage policies and RLS must be validated in the target project; this repo inspection did not execute SQL or modify a live backend.
- No live calls, authenticated user testing, real uploads, Android build, or production deployment were performed as part of this branch change.
