KONNEKT STAGE 4 — CREATOR FEED

This update builds on the working Stage 3 project. It adds:
- Vertical page-by-page Reel feed snapping.
- Follow/unfollow buttons on other creators' Reels.
- Follow state loaded from the existing public.follows table.
- Creator profile navigation from the Reel creator row.

DATABASE: No SQL migration is required. The existing public.follows table and its authenticated RLS policies are used. Do not rerun the schema.

DEPLOY: Extract this ZIP and upload the contents of KONNEKT-main to the root of the existing KONNEKT GitHub repository, replacing matching files. Preserve the existing Supabase project and credentials.

TEST: Sign in with account A, follow account B from one of B's Reels, refresh, and verify the button remains Following. Sign in as B and verify A appears in the follower data if you inspect the follows table. Tap B's creator name to open the profile.
