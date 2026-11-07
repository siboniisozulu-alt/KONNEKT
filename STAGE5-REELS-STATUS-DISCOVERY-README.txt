KONNEKT — STAGE 5 FULL REELS, STATUS & DISCOVER REVISION

This is a complete project package based on the previously working KONNEKT Stage 4 project.

FEATURES UPDATED
1. Reels uses a measured feed viewport so each Reel occupies one page. Scroll vertically to move one video at a time.
2. A clearly visible + Follow / Following control appears on every Reel from another account. It writes to the existing public.follows table. Following state is loaded from Supabase on entry/refresh. Tap Following to unfollow.
3. Tap the creator avatar/name on a Reel to open that creator's real profile.
4. Creator profile loads real profile details, follower/following/post counts, supports follow/unfollow, and opens a real direct chat.
5. Discover bottom tab now opens a real Supabase member directory instead of the old sample hashtag screen. It supports name/username/bio search, refresh, follow/unfollow, profile opening and messaging.
6. Status lists active statuses (not expired), separates your own updates from other members, refreshes, and opens the selected status.
7. Create Status supports text, image and video. New statuses expire after 24 hours. Uploads use the existing konnekt-public-media bucket.
8. Status viewer displays text, photos and videos and shows the expiry time.

DATABASE
No new SQL is required if you have already run the existing KONNEKT Supabase schema. These screens use the existing profiles, follows, posts and statuses tables and existing storage bucket. Do not run the schema again just for this package.

INSTALL
1. Download and extract this ZIP.
2. Open the extracted KONNEKT-main folder.
3. Open https://github.com/siboniisozulu-alt/KONNEKT
4. Choose Add file > Upload files.
5. Upload the contents INSIDE the KONNEKT-main folder into the repository root. Do not upload the outer folder as a nested folder.
6. Replace matching files when GitHub prompts you, then commit the changes.
7. Wait for GitHub Actions to finish successfully (green).
8. Open https://siboniisozulu-alt.github.io/KONNEKT/ and force-refresh with Ctrl+Shift+R.

TEST
- Sign in to account A; open Reels; find a video uploaded by account B. A blue + Follow button should be visible on the creator row.
- Follow, refresh Reels, and confirm it now says Following. Tap Following to unfollow.
- Tap the creator name/avatar to open the profile; verify profile details and counts load.
- Open Discover; search for account B by username or full name; try Follow and Message.
- Open Status; create a text status and a photo/video status; confirm they appear under Your updates. Sign in to account B and confirm A's active updates appear under Recent updates and open.

LIMITS
This package is prepared for the existing Supabase Free setup. Supabase free storage/bandwidth quotas still apply. The complete Vite production build could not be run in this environment because npm dependency installation timed out; JS/JSX syntax and local import paths were checked separately.
