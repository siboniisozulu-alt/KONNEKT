# KONNEKT closed real-world test plan

## Release gates — every item is mandatory

### A. Build and installation
- [ ] Deploy the complete `konnekt_pwa/` folder to HTTPS.
- [ ] Open on a supported Android Chrome device and install as a PWA.
- [ ] Confirm icon, manifest, offline shell, safe-area layout and navigation.
- [ ] Test current Android Chrome plus at least one lower-spec Android phone.
- [ ] Verify app update/cache refresh after a new deployment.

### B. Authentication
- [ ] Create Test Account A and Test Account B using separate inboxes.
- [ ] Confirm verification email is delivered and verification is required.
- [ ] Sign in/out, refresh, close/reopen and confirm session behavior.
- [ ] Test password reset link and invalid/expired link.
- [ ] Confirm duplicate email and duplicate username are rejected.
- [ ] Confirm sign-up rate limits and abuse protections are configured.

### C. Profile and discovery
- [ ] A creates profile with unique username; B can discover it.
- [ ] A can edit own profile; A cannot update B's profile.
- [ ] A follows B; B sees expected follower state.
- [ ] Unfollow and block behavior is correct.
- [ ] Report an account and verify it is visible only to reporter and authorized moderator tooling.

### D. Messaging and realtime
- [ ] A starts a direct chat with B by username.
- [ ] Both users see the same conversation.
- [ ] Messages arrive in real time in both directions.
- [ ] A cannot read a conversation A is not a member of.
- [ ] A cannot insert a message with B as sender.
- [ ] Blocking prevents new supported interactions.
- [ ] Test reconnect after airplane mode / network switching.

### E. Media, Reels and Status
- [ ] Upload a profile image and verify only authorized users can fetch it.
- [ ] Upload a private Reel draft; verify B cannot view it.
- [ ] Publish a Reel; verify allowed audience can view it and others cannot.
- [ ] Like/comment on published content; verify identity and permissions.
- [ ] Upload Status media; verify follower/blocked-user rules.
- [ ] Confirm status expires and scheduled cleanup removes record and object.
- [ ] Test file type, file size, corrupt media and slow network handling.

### F. Voice/video calls
- [ ] Configure LiveKit secrets only in Supabase Edge Function secrets.
- [ ] A and B start/join the same conversation call.
- [ ] Test microphone/camera permissions, mute, camera off, reconnect and end call.
- [ ] Verify a non-member cannot obtain a room token.
- [ ] Test mobile data, Wi-Fi, background/foreground and battery behavior.

### G. Privacy, security and operations
- [ ] Apply base schema and migration to staging only.
- [ ] Run every positive and negative test in `backend/RLS_TEST_PLAN.md`.
- [ ] Verify no service-role key exists in client files, Git history, logs or screenshots.
- [ ] Configure backups and test a restore to a separate project.
- [ ] Configure Auth SMTP, redirect URLs, rate limits and CAPTCHA/abuse controls.
- [ ] Complete moderator assignment and report handling process.
- [ ] Deploy and test account export/deletion Edge Functions.
- [ ] Complete POPIA/legal review and fill all privacy notice owner fields.
- [ ] Set monitoring, error alerting, incident contact and support channel.
- [ ] Obtain independent security review before expanding beyond invited testers.

## Test cohort
Start with 2 internal accounts. Expand to 5–10 trusted adult testers only after all gates A–G pass. Keep the first cohort small and use synthetic test content. Do not invite the public or upload sensitive data.

## Evidence
For every item record date, app build/commit, tester account IDs (not passwords), device/browser, steps, expected result, actual result, screenshot/log reference and pass/fail. Never store passwords or private keys in the test report.
