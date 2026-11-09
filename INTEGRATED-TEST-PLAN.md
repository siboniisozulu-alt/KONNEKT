# KONNEKT integrated test plan — before public beta

Run this with at least two real Android phones, two separate user accounts and separate networks (for example mobile data vs Wi-Fi). Record app version, Android version, device model, test account IDs (do not publish emails/passwords) and pass/fail evidence.

## Stage 1 — Communication
- Direct chat both directions; reconnect after airplane mode; verify message order and no duplicate sends.
- Confirm sent/delivered/read state from sender and recipient accounts.
- Send image, file, voice note and encrypted attachment; verify only conversation members can retrieve it.
- Test voice/video call accept, decline, missed, hang up, mute and camera toggle on separate networks.
- Test incoming call while app open, backgrounded and terminated; record that terminated-app alerts need configured push provider.
- Create group chat, add members, remove/leave where supported; verify membership isolation.
- Test group call with 3–4 devices/accounts. Current WebRTC mesh is a small-group beta only; do not market as large group conferencing.
- Test TURN relay by disabling same-network connectivity and confirming selected ICE candidate uses relay.

## Stage 2 — Security and privacy
- Confirm direct and group encrypted text/attachments decrypt on authorised member devices and fail for non-members.
- Create a recovery backup, restore on a second clean device, compare identity fingerprints and read old messages. Never clear the only device before recovery succeeds.
- Verify older non-exportable keys show a warning and are not silently replaced.
- Compare identity fingerprints with the contact using a separate trusted channel.
- With two test accounts, try reading/updating the other's profile-private data, messages, receipts, media, backup and reports; every unauthorised attempt must fail.
- Block an account; verify direct chat/call initiation is prevented and report works.
- Trigger message/post/report rate limits with test accounts; confirm errors are safe and no legitimate content is lost.
- Verify moderator pages are inaccessible to ordinary accounts and accessible only to the allowlisted moderator.

## Stage 3 — Social experience
- Upload short and long videos; compare file sizes before/after best-effort browser compression; verify fallback and playback.
- Check Reels ranking for followed creators, freshness, likes, comments and hashtag filters.
- Check creator profile, analytics periods and view counts; verify counts are clearly described as measured metrics, not guaranteed reach.
- Search users, open profiles, follow/unfollow, search hashtags and trending hashtags.
- Report abusive posts/comments/users; confirm moderation queue and review audit trail.

## Stage 4 — Android experience
- Test all five tabs (Chats, Reels, Status, Discover, Profile), back navigation, deep screens, keyboard, rotation and small screens.
- Test camera/microphone/media permissions, denied permissions and permission revocation.
- Install debug APK, sign in, update with a newer build, and verify accounts/messages remain available.
- Test app links, manifest/install behavior and icon/splash assets.
- Produce a signed release AAB only with a protected keystore; keep the keystore and passwords outside the repository.

## Stage 5 — Launch readiness
- Legal owner completes policy placeholders and obtains POPIA/privacy and consumer-law review.
- Verify operator contact, age policy, account deletion, data-rights request process and content/copyright complaint process.
- Assign trained moderators and publish response/appeal procedures.
- Load test concurrent logins, feed loading, message send/receive, storage upload and realtime subscriptions within Supabase Free quotas.
- Run a closed beta, capture crashes and reports, fix blockers, then repeat regression tests.

**Release gate:** any failed account-isolation test, private-media leak, broken account recovery, unrecoverable encryption-key regression, or severe call/message failure blocks public launch.
