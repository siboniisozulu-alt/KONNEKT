# KONNEKT revised development package

Prepared: 9 November 2026

## Package origin and project protection

This package is reconstructed from the previously saved `KONNEKT-ALL-FIVE-STAGES-TEST-UPGRADE.zip` and merged with the later `KONNEKT-COMMUNICATIONS-FULL-UPGRADE(3).zip`. The five-stage archive is the foundation; later communications files replace matching files while stage-only screens, services, migrations, documentation, Android resources and workflows are retained.

The existing Supabase project URL and public publishable key in `src/lib_supabase.js` are preserved. No service-role key or `.env` file is included. The package does not reset, drop or delete existing Supabase data.

## Changes in this revision

- Added a central feature directory and Profile entry point.
- Added real Supabase group creation from existing member profiles.
- Added one-to-one WebRTC voice/video calls with Supabase signalling, incoming-call prompts and call lifecycle handling.
- Added group-call invitation prompts and group-call entry from group conversations. Group calls remain peer-to-peer mesh and are limited to four participants.
- Added authenticated TURN credential retrieval through `VITE_TURN_CREDENTIALS_URL`; the endpoint must return short-lived ICE server credentials.
- Added in-app voice recording, playback, upload and message delivery where the browser/device supports `MediaRecorder`.
- Connected account reports, content reports, block/unblock and blocked-account listing to the existing Supabase safety tables.
- Added Supabase Auth phone-number change verification and TOTP MFA enrolment/verification screens.
- Removed fictional creator earnings, payout transactions, sample creator profiles, test-contact call previews and local-only report success messages.
- Added local persistence for content and notification preferences.
- Added an additive migration for group descriptions, group invitation notifications, group-call realtime publication and block-aware call creation.

## Important remaining dependencies and limitations

A screen or button alone does not prove a production service is complete. The following still require configuration, implementation or real-device verification:

- The new and earlier SQL migrations must be applied to the existing Supabase project. Do not reset the project or rerun the initial schema as a reset.
- Reliable calling requires an authenticated TURN credential endpoint. STUN-only connections will fail on some carrier and restrictive networks.
- Group calling uses a peer-to-peer mesh and is limited to four participants. Larger groups require an SFU/media service.
- Background push notifications require OneSignal/FCM configuration and Android device testing. In-app notifications and incoming call prompts work while the app is open.
- Live video broadcast is not connected to a streaming provider. Live room metadata/chat do not broadcast the host's camera feed to viewers.
- Ordinary chat messages are not end-to-end encrypted. Do not describe chats as E2EE until the encryption implementation is integrated into every message path and independently tested.
- Creator verification, subscriptions, monetisation, payouts and brand campaigns are not active. The UI no longer shows fictional earnings, payments or submitted applications.
- Supabase Auth phone verification requires phone authentication and an SMS provider to be configured in the Supabase project.
- Two-step verification uses Supabase Auth TOTP MFA, but higher-assurance session enforcement must also be applied to protected routes and database policies.
- Legal terms and privacy materials remain drafts and require completion and legal review before public launch.

## Install and deploy

1. Download and extract the ZIP.
2. Open the `KONNEKT-main` folder and copy its contents into the existing `KONNEKT` GitHub repository, preserving the folder structure. Replace matching files; do not create a new Supabase project.
3. Do not upload `.env` files, service-role keys, TURN secrets, OneSignal REST keys or Android signing keystores.
4. Run `npm install`, then `npm run build` in a local development environment.
5. Confirm GitHub Pages uses the `/KONNEKT/` base path configured by `vite.config.js`.
6. Apply only migrations not already applied. Review `supabase/migrations/20261109_konnekt_realtime_and_call_readiness.sql` as an additive migration. Do not run destructive SQL.
7. Configure `VITE_TURN_CREDENTIALS_URL` only after deploying an authenticated endpoint that returns short-lived credentials. Never embed permanent TURN credentials in browser code.
8. Test with at least two accounts and physical Android devices before public launch.

## Validation status

The revised source was parsed with the available TypeScript JSX parser and passed syntax parsing. Relative imports and screen-file discovery were checked. A full Vite production build is not claimed as verified in this environment; run `npm install` and `npm run build` after extraction. SQL migrations have not been executed against the live Supabase project in this packaging step.
