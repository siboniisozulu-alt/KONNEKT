# KONNEKT — All five stages integrated upgrade

This is a development/test upgrade for the existing KONNEKT React + Vite + Supabase + Capacitor project. It is designed to preserve the existing Supabase project, users, profiles, conversations, messages, posts, statuses and storage objects. **Do not reset the project, delete tables, replace the Supabase project, or publish a service-role key.**

## What is included

### Stage 1 — Communication
- Existing direct and group chat screens with realtime message subscriptions.
- Delivery/read receipt records and chat attachment support.
- One-to-one WebRTC voice/video calling and incoming-call screen while the app is connected.
- TURN credential endpoint support; no TURN provider is automatically provisioned.
- Group chat and small group WebRTC mesh calling (maximum four participants for this beta).
- Voice note and camera/file attachment flows.
- Client-side encrypted one-to-one and group text, plus encrypted chat attachments when the chat key is available.

### Stage 2 — Security and privacy
- Additive RLS-protected tables for key envelopes, encrypted key backups, blocks, reports, moderation and rate-limit events.
- Passphrase-encrypted key backup and restore for newly generated exportable identities. Older non-exportable keys cannot be backed up by this new flow; the app warns instead of replacing them.
- Identity fingerprint display for manual comparison through a trusted separate channel. This is not automatic real-world identity verification.
- Existing Supabase Auth password recovery, block/report screens and rate-limit guardrails.
- Group and attachment encryption code paths. Security still requires the two-account adversarial test matrix before launch.

### Stage 3 — Social experience
- Personalized Reels ranking using freshness, follows, engagement and creator affinity.
- Discover people ranking, hashtag indexing/trending view, hashtag feed filter and creator analytics.
- Best-effort browser video compression (720p target / WebM when supported); unsupported devices fall back to the original file and the upload size limit still applies.
- Existing creator profile, post, follow, like, comment and report screens.

### Stage 4 — Android experience
- Existing five tabs: Chats, Reels, Status, Discover and Profile.
- Added KONNEKT icon, PWA manifest and Android icon/splash resources.
- Debug APK GitHub Actions workflow and a signed AAB workflow that requires private GitHub signing secrets.
- Capacitor configuration remains `com.konnekt.app` / `KONNEKT`.

### Stage 5 — Launch preparation
- Draft Privacy Policy, Terms of Service and Community Guidelines.
- Moderator report queue, moderator allowlist bootstrap SQL and audit log.
- Integrated test plan and release gates for device, security, load and closed-beta testing.

## 1. Before applying database changes

1. Open the existing Supabase project `itkoagpigiifodfhoujt`.
2. Do not create a new project and do not run `DROP`, `TRUNCATE`, reset, or destructive cleanup commands.
3. Check whether these migrations have already been applied. If the earlier communication/realtime upgrades were run, do not repeat setup steps unnecessarily.
4. Apply only missing additive migrations, in this order:
   - `supabase/migrations/20261107_communication_upgrade.sql` (only if the earlier communication upgrade was never applied)
   - `supabase/migrations/20261108_konnekt_realtime_security_upgrade.sql` (only if the earlier realtime upgrade was never applied)
   - `supabase/migrations/20261108_konnekt_launch_readiness.sql`
   - `supabase/migrations/20261108_konnekt_key_recovery.sql`
5. Run each file in Supabase SQL Editor and confirm it completes successfully before moving to the next.

These are additive migrations. They add missing columns/tables/indexes/policies and do not delete existing accounts or messages. Do not re-run `supabase/konnekt_schema.sql` on the live project; it is the initial schema reference, not a reset script.

## 2. Configure a moderator

1. Sign in once with the account that should be the trusted project moderator.
2. In Supabase Authentication → Users, copy that account's exact UUID.
3. Open `docs/ADMIN-MODERATOR-SETUP.sql`, replace the all-zero UUID with the verified UUID, and run it in SQL Editor.
4. Sign out/in or reopen Profile. The moderator dashboard should appear.
5. Keep moderator access limited to trusted people. The SQL file is a template; the placeholder UUID is deliberately invalid.

The report queue can review and record report outcomes. It is not a fully staffed trust-and-safety operation; define escalation, appeal and response-time procedures before public launch.

## 3. TURN and incoming-call push

- TURN is not bundled as a server. Obtain a TURN provider or operate a secure TURN endpoint. Add `VITE_TURN_CREDENTIALS_URL` as a build-time environment variable; the endpoint must issue short-lived credentials in the JSON shape shown in `docs/TURN-AND-PUSH-SETUP.md`.
- Never expose permanent TURN credentials in `VITE_` variables or GitHub source.
- Calls can show incoming screens while the app is connected. To alert users while the app is backgrounded/terminated, configure OneSignal + Firebase Cloud Messaging, Android package settings, notification permissions and device credentials. Add only the public OneSignal App ID to build configuration; keep REST/service-account credentials private.
- Group calling is peer-to-peer mesh and limited to four participants in this beta. A production large-group service requires an SFU/media bridge and operational cost.

## 4. Build and deploy

### Website
1. Upload the contents of this ZIP into the existing KONNEKT GitHub repository, keeping the folder structure and replacing matching source files.
2. Do not upload `.env` files or secrets.
3. Wait for the GitHub Pages deployment workflow to finish successfully.
4. Test the live site over HTTPS.

### Debug APK
1. Open GitHub → Actions.
2. Run **Build KONNEKT Android APK** on `main`.
3. Download the `KONNEKT-Android-APK` artifact from the completed workflow.
4. Install it on the test phones and grant camera/microphone/media permissions when prompted.

### Signed AAB
1. Create and securely store an Android upload/release keystore.
2. Add these GitHub Actions repository secrets: `ANDROID_KEYSTORE_BASE64`, `ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS`, `ANDROID_KEY_PASSWORD`.
3. Run **Build signed KONNEKT Android AAB**.
4. Download `KONNEKT-Signed-Android-AAB`.

Never commit the keystore or its passwords. The debug APK is for testing only; the AAB workflow is for signed release preparation, not Play Store approval.

## 5. Test everything together

Use `docs/INTEGRATED-TEST-PLAN.md`. Test at least two separate accounts on two physical Android phones and different networks. Do not use only two browser tabs on one device as proof of call reliability. Verify the old account can sign in and access existing chats/posts after the update.

## 6. Launch blockers and honest limitations

- The app source cannot provision TURN, OneSignal/FCM, SMS verification, legal counsel, moderator staffing, Play Console access or a signing key for you.
- Background incoming-call notifications require push provider setup and tests. Web/browser alerts are not equivalent to native background push.
- WebRTC mesh calling is limited to small groups; production group calls need an SFU.
- Browser video compression is best-effort and device/browser dependent. If unsupported, the original video is uploaded subject to the current file-size cap.
- Key recovery works only for identities generated with the new exportable-key version. Existing non-exportable identities cannot be exported without risking message loss; keep their original device and do not clear app/browser data until separately migrated.
- Identity fingerprints must be compared with the other person through a trusted separate channel. The app does not verify a legal identity.
- Privacy/Terms documents are drafts with required operator/retention/age/provider placeholders. They are not legal advice and must be completed and reviewed before public release.
- Supabase Free limits still apply. Realtime, storage, media bandwidth and database quotas must be load-tested; no paid upgrade is required just to run the code, but high usage may exceed free quotas.
- This ZIP is a development upgrade, not proof of production readiness. Complete all test gates before inviting the public.
