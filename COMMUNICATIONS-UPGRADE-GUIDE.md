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

The migration and `src/services/calls.js` provide protected call records and realtime offer/answer/ICE signalling. A real call also requires a WebRTC media layer, microphone/camera permissions, incoming-call UI, lifecycle handling, and TURN credentials. STUN-only calls are not reliable across all mobile networks. Obtain a TURN service and keep its credentials out of source control before enabling public calling. The current CallScreen is still a demo UI; do not advertise calls as operational yet.

## Step 5 — encryption safety

The migration adds a place to publish device public keys. It does **not** turn existing message bodies into end-to-end encrypted messages. Do not display an “End-to-end encrypted” badge yet. A secure implementation still needs a vetted Signal-protocol implementation (X3DH/PQXDH + Double Ratchet or a reviewed equivalent), authenticated device-key verification, multi-device key distribution, group sender-key handling, backup/recovery decisions, attachment encryption, and security review. Do not invent a shared static key or store private keys in Supabase. Existing chats remain readable and unchanged.

## Step 6 — Android build

Push the updated project to the `main` branch. In GitHub → Actions → “Build KONNEKT Android APK” → Run workflow, wait for the workflow to finish, then download the `KONNEKT-Android-APK` artifact. Install the debug APK on Android for testing. iPhone builds require macOS/Xcode and Apple signing; an APK cannot be installed on iPhone.

## Important status

This is a safe backend/integration foundation, not a claim that all four features are finished. The existing app has not been runtime-tested against your live Supabase project in this workspace. Before public launch, implement and test the WebRTC UI/transport, end-to-end encryption protocol, delivery receipt updates, and push event triggers with two real accounts and multiple Android devices.
