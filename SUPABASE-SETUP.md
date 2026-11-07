# KONNEKT — Supabase setup (first backend stage)

This project now uses Supabase email/password authentication and a protected profile table. It also includes the first database schema for conversations, messages, statuses and media posts. The existing visual screens for Reels, live streaming and other features are not all connected to live backend data yet.

## 1. Create the database tables

1. Open https://supabase.com/dashboard and select your **KONNEKT** project.
2. Open **SQL Editor** → **New query**.
3. Open `supabase/konnekt_schema.sql` from this ZIP, copy the entire file into the SQL editor and press **Run**.
4. Confirm the query completes without errors. Do not disable Row Level Security.

## 2. Configure email authentication

1. In Supabase open **Authentication** → **URL Configuration**.
2. Set **Site URL** to `https://siboniisozulu-alt.github.io/KONNEKT/`.
3. Add this Redirect URL: `https://siboniisozulu-alt.github.io/KONNEKT/**`.
4. In **Authentication** → **Providers** → **Email**, keep Email enabled. Email confirmation can remain enabled; new users will then need to click the confirmation email before logging in.

## 3. Deploy

The Supabase project URL and publishable browser key are configured in `src/lib_supabase.js`. The publishable key is designed to be visible in browser code. Never put a `service_role` key or database password in this project, GitHub, or a browser.

Upload the contents of the ZIP to the existing `KONNEKT` GitHub repository, replacing the corresponding files, and allow the GitHub Actions deployment to finish.

## 4. Test

1. Open `https://siboniisozulu-alt.github.io/KONNEKT/`.
2. Create a test account using an email address you can access.
3. If email confirmation is enabled, open the confirmation email and confirm.
4. Return to KONNEKT and log in.
5. Open Profile, edit the name, username and bio, and save.
6. Log out and log back in to verify the account persists.

## Free-plan and feature boundaries

This setup uses the Supabase Free project and does not require Firebase, Firebase Blaze, a service-role key, SMS verification or online payments. Free-plan quotas and inactivity pausing still apply. Large media storage, high bandwidth and real-time live video may need a separate service or paid capacity later. The chat/status/post tables are prepared with access policies, but the current chat, status and Reels screens still need their data operations and media upload workflows connected in a later development stage.
