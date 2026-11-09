# KONNEKT Beta 1.0 — 95% preparation package

This is a consolidated source package recovered from the available KONNEKT project archives. It is intended as the next integration candidate, not a certified production release.

## What is included
- React + Vite web application and five primary tabs: Chats, Reels, Status, Discover and Profile.
- Supabase client and authentication context.
- Messaging, groups, calls, social, creator, safety and account screens found in the recovered source archive.
- Additive Supabase migrations, setup guides, PWA assets, Capacitor configuration and GitHub Actions workflows.

## Demo-data cleanup performed in this package
- Removed the hard-coded example message and fake recipient names from Message Info.
- Removed the hard-coded example payout-history entries.
- Removed sample media-picker entries and changed the empty state to disclose that device gallery access is not connected.
- Removed sample earnings labels/figures where identified in the affected earnings screen.

This is not a claim that every demo-only interaction has been eliminated. Several areas still explicitly disclose that a provider or backend integration is not active (for example SMS verification, creator payouts, live video broadcast, media access, and some creator/moderation workflows). These must remain disabled or be completed before public launch; do not present them as live services.

## Preserve the existing live project
- The recovered source currently contains a Supabase URL and publishable browser key in `src/lib_supabase.js`. Confirm these are the intended KONNEKT project values before deploying. Do not replace the live Supabase project or reset its database.
- Do not run `supabase/konnekt_schema.sql` as a reset. Review migration history and apply only missing additive migrations after making a backup.
- Never commit a Supabase service-role key, TURN secret, push-provider secret, signing key or keystore.
- Back up the current GitHub repository before replacing any files. This ZIP is based on recovered archives, not a fresh export of the current live GitHub repository.

## Validation performed for this package
- Parsed 97 JavaScript/JSX files with the installed TypeScript JSX parser: zero syntax errors.
- The full Vite production build was not verified: dependency installation timed out in the available environment. Run `npm install` and `npm run build` in GitHub Actions or a local environment before deployment.
- Supabase migrations were not run against the live project.
- No physical Android devices, separate user accounts, different networks, live push provider, TURN server or payment provider were available for end-to-end verification.

## Final 5% — testing and error fixing gate
Do not mark Beta 1.0 as 100% until all of these pass:
1. Clean install and production build; resolve every build error.
2. Deploy to a test branch/site and confirm GitHub Pages loads correctly.
3. Register, sign in, sign out, recover password and retain sessions across reloads.
4. Test direct messages and groups with two or more real accounts; verify realtime updates and access isolation.
5. Test image/video upload, playback, status, comments, likes, follows and Discover with real accounts and real storage.
6. Test audio/video calls on at least two Android phones over different networks; verify permissions, reconnects and TURN relay.
7. Test notifications with the app foregrounded, backgrounded and closed after configuring the real push provider.
8. Verify encryption, identity verification and key recovery on two devices; do not claim end-to-end security until independently tested.
9. Verify reporting, blocking, privacy settings, moderation and account deletion paths.
10. Confirm that every button either completes its real action or is clearly disabled/not available; no fake success messages or seeded demo records.
11. Check mobile layout, performance, accessibility, privacy policy, terms and release signing.

## GitHub upload
1. Download and extract the ZIP.
2. Back up the current repository first.
3. Compare the extracted `KONNEKT-main` files with the current repository; do not overwrite live configuration blindly.
4. Copy the project files into the repository root, preserving the `.github` and `supabase` folders.
5. Confirm `src/lib_supabase.js` points to the correct existing project, then commit to a test branch first.
6. Wait for GitHub Actions to finish and check its build log before merging/deploying.

The 95% figure is the agreed preparation target, not a measured completion score. The remaining 5% is reserved for the testing and repair gate above.
