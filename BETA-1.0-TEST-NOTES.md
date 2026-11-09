# KONNEKT Beta 1.0 — package notes

This package consolidates the latest five-stage integration package recovered from the project library and adds a Profile-accessible Feature Centre so the major included modules have explicit navigation buttons. It also replaces the old no-op Home screen Status and Go Live shortcuts with their existing Create Status and Live Room setup screens.

## Main modules
- Accounts: email/password sign-up, login, password recovery, profile and account settings.
- Communication: direct and group chats, attachments, voice notes, message search, receipts, call screens and small-group call screens.
- Privacy and safety: blocking, reporting, two-step verification, key recovery, identity fingerprints and moderation queue.
- Social: Reels, uploads, likes, comments, follows, statuses, hashtags, Discover and creator tools.
- Mobile: PWA assets, Capacitor configuration and GitHub Actions Android build workflows.

## Important operational status
A visible button and a source-code screen do not prove the feature is operational. Live video broadcast still needs a streaming provider; background notifications need OneSignal/FCM setup; WebRTC calls need a TURN service for reliable cross-network operation; payment/payout processing is not connected; and end-to-end encryption/key recovery need two-account device testing. The in-app creator payout screens are not a live payment processor.

## Preserve existing data
Keep the existing Supabase project URL and publishable key in `src/lib_supabase.js`. Do not create a replacement project, reset the database, drop tables, or run the initial schema as a reset. Apply only missing additive migrations after checking the migration history. Never publish service-role keys, signing keys, TURN secrets, or push-provider secrets.

## Build and test
1. Run `npm install` in the project folder.
2. Run `npm run build`.
3. Run `npm run dev` and test account registration/login, two-user messaging, groups, status, Reels upload/playback, reporting and privacy settings.
4. Follow `docs/INTEGRATED-TEST-PLAN.md` on two physical Android devices and different networks.
5. Configure external providers and credentials only in their secure dashboards/secrets stores.

Build verification was not completed in this packaging session because dependency installation timed out in the available environment. Treat this ZIP as a consolidated beta test source package, not a certified production release.
