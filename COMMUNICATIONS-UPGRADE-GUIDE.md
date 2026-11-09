# KONNEKT communications upgrade — implementation pack

This is an additive upgrade to the existing React/Vite + Supabase project. It does not reset accounts, profiles, posts, conversations, or messages.

## Included in this package

- Additive Supabase migration for call sessions/signalling, group member roles, message delivery/read receipts, and public device-key records.
- Supabase-backed call signalling service (`src/services/calls.js`). This is the server signalling layer, not a finished audio/video calling experience by itself.
- OneSignal Capacitor SDK dependency and login/permission initialisation (`src/services/pushNotifications.js`). The app ID is supplied through `VITE_ONESIGNAL_APP_ID`.
- Supabase Edge Function sample for authenticated push delivery (`supabase/functions/send-push/index.ts`). It limits sends to recipients who share a conversation with the sender.
- Existing Android APK workflow and Capacitor configuration retained.

## Step 1 — back up first

Download/export a copy of your current Supabase database schema and keep the current GitHub ZIP. Do not delete or replace existing Supabase tables.

## Step 2 — apply the additive database migration

In Supabase Dashboard → SQL Editor, open `supabase/migrations/20261107_communication_upgrade.sql`, paste the complete contents, and run it once. It uses `IF NOT EXISTS` and creates only additional columns/tables/policies. Review the result for errors before continuing. If `supabase_realtime` publication is unavailable, enable Realtime for `call_sessions`, `call_signals`, and `message_receipts` in the Supabase table settings.

## Step 3 — configure OneSignal

1. Create a OneSignal app for KONNEKT and configure its Android platform using your Android package ID `com.konnekt.app`.
2. Add the OneSignal App ID as `VITE_ONESIGNAL_APP_ID` in your local build environment or GitHub repository Actions variables. It is an app identifier, not the REST API key.
3. In Supabase → Edge Functions → Secrets, set `ONESIGNAL_APP_ID`, `ONESIGNAL_REST_API_KEY`, `SUPABASE_URL`, and `SUPABASE_ANON_KEY`. Never put the REST API key in browser code or GitHub source.
4. Deploy `supabase/functions/send-push` using the Supabase CLI. Do not expose the REST API key to clients.
5. Configure Android Firebase Cloud Messaging credentials in OneSignal. OneSignal push will not arrive until this provider setup and device permission are complete.

## Step 4 — calling infrastructure

The revised code now includes a WebRTC peer connection, microphone/camera capture, offer/answer/ICE signalling, mute/camera controls and an incoming-call prompt while the app is open. It also includes a Supabase Edge Function that creates short-lived coturn REST credentials. Deploy that function and configure `TURN_URLS` and `TURN_SHARED_SECRET` as server-side Supabase secrets. STUN-only fallback is provided but is not reliable across all mobile networks. Test calls on two physical devices and different networks before public launch. Incoming-call prompts while the app is closed still require native push/call integration.

## Step 5 — encryption safety

The migration adds a place to publish device public keys. It does **not** turn existing message bodies into end-to-end encrypted messages. Do not display an “End-to-end encrypted” badge yet. A secure implementation still needs a vetted Signal-protocol implementation (X3DH/PQXDH + Double Ratchet or a reviewed equivalent), authenticated device-key verification, multi-device key distribution, group sender-key handling, backup/recovery decisions, attachment encryption, and security review. Do not invent a shared static key or store private keys in Supabase. Existing chats remain readable and unchanged.

## Step 6 — Android build

Push the updated project to the `main` branch. In GitHub → Actions → “Build KONNEKT Android APK” → Run workflow, wait for the workflow to finish, then download the `KONNEKT-Android-APK` artifact. Install the debug APK on Android for testing. iPhone builds require macOS/Xcode and Apple signing; an APK cannot be installed on iPhone.

## Important status

The revised code adds the WebRTC client and in-app incoming-call flow, group/direct receipt handling, and best-effort push invocation. It has not been runtime-tested against your live Supabase project or on physical Android devices in this workspace. Provider credentials, Edge Function deployment, database migration, camera/microphone permission checks, and multi-device tests are still required. End-to-end encryption is deliberately not enabled; see `ENCRYPTION-IMPLEMENTATION-STATUS.md`.


## Revised code in this package

The revised project now includes:
- A WebRTC call client using browser/WebView media capture, Supabase offer/answer/ICE signalling, call controls, and an incoming-call prompt while the app is open.
- TURN credentials minted by the `turn-credentials` Edge Function using coturn's time-limited REST credential mechanism. The browser does not receive the long-lived TURN shared secret.
- Direct-message and group-message delivery/read receipt updates. A recipient's receipt is written when that recipient opens/views the message.
- Best-effort push invocation after message insertion. A push-provider failure does not undo the saved message.

## Additional setup required for calls

1. Deploy `supabase/functions/turn-credentials` with the Supabase CLI.
2. Configure Supabase Edge Function secrets `TURN_URLS` (comma-separated `turn:`/`turns:` URLs) and `TURN_SHARED_SECRET` (the coturn REST shared secret). These are server-side secrets; never add them as `VITE_` variables.
3. Confirm microphone/camera permissions for the Android WebView and test on two separate devices and different networks. HTTPS is required for browser media capture.
4. Calls currently require the app to be open and signed in to receive the in-app incoming-call prompt. Background/terminated-app incoming call delivery requires native call push handling and Android notification/channel configuration.

## Additional setup required for push

1. Configure the OneSignal Android app with the Firebase Cloud Messaging credentials.
2. Set `VITE_ONESIGNAL_APP_ID` in the build environment.
3. Set `ONESIGNAL_APP_ID`, `ONESIGNAL_REST_API_KEY`, `SUPABASE_URL`, and `SUPABASE_ANON_KEY` as Supabase Edge Function secrets.
4. Deploy `supabase/functions/send-push`.
5. Install the Android build, grant notification permission, and test with two registered devices.

## Encryption remains intentionally unfinished

See `ENCRYPTION-IMPLEMENTATION-STATUS.md`. The revised code does not claim to enable E2EE. A safe, audited Signal-protocol integration is still required before this feature can be enabled.
