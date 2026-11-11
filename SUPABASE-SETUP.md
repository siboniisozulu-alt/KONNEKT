# KONNEKT — existing Supabase project setup

This package preserves the Supabase project configured in `src/lib_supabase.js`. The project already has users, profiles and application data. **Do not create a replacement project, reset the database, drop tables, truncate records or rerun the initial schema as a reset.**

## 1. Apply only missing migrations

1. Open the existing KONNEKT project in the Supabase dashboard.
2. Review the SQL migrations in `supabase/migrations` in filename order.
3. Compare them with the migrations already applied to this project.
4. Apply only migrations that are missing, one at a time, beginning with the earliest missing migration.
5. Review the new `20261109_konnekt_realtime_and_call_readiness.sql` migration. It is additive: it adds group description support, group invitation notifications, realtime publication entries and a block-aware call guard.
6. Do not run `supabase/konnekt_schema.sql` against the existing production project as a reset. It is retained as the initial schema reference for a genuinely new project.

Do not disable Row Level Security. Never place a database password or `service_role` secret in the website.

## 2. Configure authentication

1. In Supabase open **Authentication** → **URL Configuration**.
2. Set Site URL to `https://siboniisozulu-alt.github.io/KONNEKT/`.
3. Add Redirect URL `https://siboniisozulu-alt.github.io/KONNEKT/**`.
4. Under **Authentication** → **Providers** → **Email**, keep Email enabled. If email confirmation is enabled, users must confirm their email before logging in.
5. To use phone verification, configure Supabase phone authentication and a supported SMS provider. The app uses Supabase Auth phone-number change verification.
6. TOTP two-step verification uses Supabase Auth MFA. Configure any required project-level MFA policy and enforce higher-assurance sessions on protected routes before public launch.

## 3. Configure calls and push

- One-to-one voice/video calls use browser WebRTC and Supabase signalling. Group calls use a peer-to-peer mesh limited to four participants.
- Configure an authenticated TURN credentials endpoint and set `VITE_TURN_CREDENTIALS_URL` in the deployment environment. The endpoint must validate the Supabase access token and return short-lived ICE credentials. Do not place permanent TURN credentials in Vite variables or client code.
- Background push requires OneSignal/FCM setup, Android package registration and device testing. Set `VITE_ONESIGNAL_APP_ID` only after provider setup. Never commit FCM service-account JSON or OneSignal REST API keys.

## 4. Deploy to GitHub Pages

The Supabase project URL and publishable browser key are set in `src/lib_supabase.js`. A publishable key is intended to be visible in browser code; security depends on correctly configured RLS and Storage policies. Never use a `service_role` key here.

Upload the extracted project contents to the existing `KONNEKT` repository, replacing matching project files. Do not upload the ZIP as a single file. Wait for the GitHub Actions workflow to finish successfully.

## 5. Test with two separate accounts

1. Register and confirm two accounts.
2. Save a distinct username in each profile.
3. Open Chats, search for the other member and start a direct conversation.
4. Send text in both directions and confirm messages update without refreshing.
5. Attach image, video, audio and supported document files.
6. Record, play and send a voice note; verify the other account can play it.
7. Create a group, confirm invited members receive in-app notifications, then test group messaging.
8. Place and answer voice/video calls on two devices. Test separate Wi-Fi/mobile networks with TURN configured.
9. Test group calling with up to four participants.
10. Publish a status and a Reel; test viewing, likes and comments.
11. Test reporting and blocking; verify blocked accounts cannot start new direct chats or calls.

## 6. Important feature boundaries

- Live room metadata and chat are available, but live video broadcasting still requires a streaming provider or SFU.
- Background push when the app is closed requires provider and device configuration.
- Ordinary chat messages are not end-to-end encrypted. They are protected by authenticated access and RLS, not E2EE.
- Group calls are peer-to-peer mesh and limited to four participants; a media SFU is required for larger groups.
- Creator verification, subscriptions, monetisation, payouts and brand campaigns are not active.
- Terms and privacy documents remain drafts and require completion and legal review.

## 7. Free-plan considerations

This setup does not require Firebase Blaze, online payments or a Supabase service-role key. Supabase Free has quotas and may pause inactive projects. Video storage and bandwidth can use the free allowance quickly. Check current dashboard usage before inviting many users. Do not promise unlimited free video hosting, background push or global live streaming.
