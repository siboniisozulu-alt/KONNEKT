# KONNEKT Stage 3 — Reels

This update improves the existing Reels screen using the Supabase posts, post_likes, and post_comments tables and the existing `konnekt-public-media` storage bucket.

## What changed
- Video-only Reel upload (MP4, WebM, or QuickTime where supported by the browser).
- 45 MB client-side upload limit to stay below the configured 50 MB storage object limit.
- Vertical feed of real posts from Supabase.
- Video playback with browser controls, inline playback, and looping.
- Real like/unlike actions and visible like totals.
- Real comments and author names/usernames.
- Refresh and realtime feed updates.
- Keeps the existing Reels tab route (`Reels` → `Watch`).

## Supabase setup
The existing `supabase/konnekt_schema.sql` already creates the `posts`, `post_likes`, and `post_comments` tables, the `konnekt-public-media` bucket, and the authenticated upload/read policies. If that schema was already successfully run for this project, **do not run it again for this update**. No new SQL is required for this Reels screen.

If uploads fail, check Supabase Dashboard → Storage and confirm that the `konnekt-public-media` bucket exists and is public, and that the existing Storage policies from the schema are present. Do not expose a service-role key in the website.

## Free-tier note
Supabase free-tier storage and bandwidth are limited and may change. Keep videos compressed and short; do not upload large source videos. This package does not add a paid streaming provider or live video broadcasting.
