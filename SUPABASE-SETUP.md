# KONNEKT — Supabase social features setup

This project connects KONNEKT to the Supabase project configured in `src/lib_supabase.js`. It includes working application flows for one-to-one chat, chat attachments, 24-hour statuses, a shared photo/video posts feed with likes and comments, and in-app notifications. Live video transport and browser push notifications are not included yet; read the limitations below before announcing those features.

## 1. Run the database and storage setup

1. Open https://supabase.com/dashboard and select your **KONNEKT** project.
2. Open **SQL Editor** → **New query**.
3. Open `supabase/konnekt_schema.sql` from this project and copy the entire file into the SQL Editor.
4. Click **Run** and confirm it completes without errors.
5. The script creates/updates the database tables, Row Level Security policies, media buckets, storage policies, notification triggers and Realtime publication entries. It is designed to be re-run safely.

Do not disable Row Level Security. Do not put a database password or `service_role` secret in the website.

## 2. Configure email authentication

1. In Supabase open **Authentication** → **URL Configuration**.
2. Set Site URL to `https://siboniisozulu-alt.github.io/KONNEKT/`.
3. Add Redirect URL `https://siboniisozulu-alt.github.io/KONNEKT/**`.
4. Under **Authentication** → **Providers** → **Email**, keep Email enabled. If email confirmation is enabled, users must click the confirmation email before logging in.

## 3. Deploy to GitHub Pages

The Supabase Project URL and publishable browser key are set in `src/lib_supabase.js`. A publishable key is intended to be visible in browser code; security depends on the RLS and Storage policies. Never use a `service_role` key here.

Upload the extracted contents of this project to the existing `KONNEKT` repository, replacing matching project files. Do not upload the ZIP as a single file. Wait for the GitHub Actions workflow to finish successfully.

## 4. Test with two separate accounts

Use two email addresses you can access, preferably in two different browsers or one normal and one private window.

1. Register and confirm both accounts.
2. In each account, save a distinct username in Profile.
3. From account A, open Chats → +, search account B's username and start a conversation.
4. Send text in both directions and confirm new messages appear without refreshing.
5. Attach an image, video or audio file in the conversation and verify the other account can open it.
6. Publish a status from one account and view it from the other. It should expire after 24 hours.
7. Publish a photo or video in Reels; test likes and comments from the other account.
8. Open Profile → Notifications and verify in-app notifications appear for messages, likes, comments and follows.

## 5. Feature boundaries — read before launch

### Connected in this code package

- One-to-one private messaging with Supabase Realtime while users are online.
- Chat attachment uploads for images, videos and audio files. The app does not yet provide a polished in-app voice recorder; users can attach a supported audio file.
- 24-hour text/photo/video statuses.
- A shared posts/Reels feed with photo/video uploads, likes and comments. This is a functional feed, not yet a highly optimised TikTok-style full-screen recommendation algorithm.
- In-app notifications for messages, likes, comments and follows. These update while the app is open.

### Not yet complete

- Live video broadcasting. Supabase stores live-room metadata and chat data but does not itself transport live video. A WebRTC/SFU or streaming provider, signalling, TURN infrastructure, moderation and load testing are still required. The current live screens are not a real broadcast service; do not advertise Go Live as operational.
- Browser push notifications when the website is closed. In-app notifications work while signed in and connected; background push needs service-worker/push subscription handling and a trusted server-side sender.
- End-to-end encryption for messages. Messages are protected by authenticated access and RLS, but they are not end-to-end encrypted.
- Production readiness at scale, full abuse moderation, content reporting workflows, backups and independent security testing.

## 6. Free-plan considerations

This setup does not require Firebase Blaze, paid SMS, online payments or a Supabase service-role key. Supabase Free has quotas and may pause inactive projects. Video storage and bandwidth can use the free allowance quickly. Check the current Supabase dashboard usage before inviting many users. Do not promise unlimited free video hosting or free global live streaming.
