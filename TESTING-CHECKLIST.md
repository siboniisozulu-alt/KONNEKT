# KONNEKT end-to-end test checklist

Use at least two separate test accounts and preferably two physical Android devices on different networks. Do not weaken production RLS policies to make a test pass. Record device, browser, account, timestamp and exact error for every failure.

## 1. Build and deployment
- [ ] `npm install` completes without dependency errors.
- [ ] `npm run build` completes successfully.
- [ ] GitHub Actions deployment completes successfully.
- [ ] GitHub Pages loads at the expected `/KONNEKT/` path.
- [ ] App layout works at narrow Android widths and desktop widths.

## 2. Authentication and profile
- [ ] Register, confirm email if enabled, sign in and sign out.
- [ ] Request password recovery and complete the recovery link flow.
- [ ] Update profile name, username and bio; verify persistence after refresh.
- [ ] Verify one account cannot edit another account's profile.
- [ ] Configure SMS in Supabase and test phone-number change verification.
- [ ] Enrol TOTP MFA, verify a valid code, reject an invalid code and remove the factor.
- [ ] Enforce higher-assurance sessions on protected routes before public launch.

## 3. Direct chats, groups and media
- [ ] Start a direct conversation between two accounts.
- [ ] Send and receive text messages in real time; verify order and persistence.
- [ ] Create a group from actual member profiles and confirm all invited members receive an in-app invitation.
- [ ] Send and receive messages in the group conversation.
- [ ] Test image, video, audio and document attachments with size/type limits.
- [ ] Record, play, discard and send a voice note; verify the recipient can play it.
- [ ] Verify a blocked user cannot start a new direct conversation or call.
- [ ] Verify RLS blocks cross-account reads and writes.

## 4. Voice/video and group calls
- [ ] Place a one-to-one voice call and answer it from a second signed-in device.
- [ ] Place a one-to-one video call and verify both camera and microphone streams.
- [ ] Test decline, caller hang-up, callee hang-up, connection loss and permission denial.
- [ ] Test calls across separate Wi-Fi and mobile networks with TURN configured.
- [ ] Test group voice and video calls with two devices, then up to four participants.
- [ ] Verify group invitations, decline, join, leave and host end-call behaviour.
- [ ] Verify calls are blocked when either participant has blocked the other.
- [ ] Test call recovery after background/foreground transitions and device screen lock.

## 5. Reels, posts, status and discovery
- [ ] Upload a video and verify storage, playback and persistence.
- [ ] Test likes, comments, follows, saved videos and profile opening across accounts.
- [ ] Test Discover search and hashtag navigation.
- [ ] Create text/photo/video statuses and verify expiry filtering.
- [ ] Test status privacy and viewing controls.

## 6. Live and creator tools
- [ ] Create a live room and test room chat.
- [ ] Confirm the host's camera is not represented as a viewer broadcast until a streaming provider is connected.
- [ ] Verify no fictional creator earnings, payouts, subscriptions or brand applications are displayed or recorded.
- [ ] Complete creator verification, payment and partnership integrations before enabling those services.

## 7. Notifications and safety
- [ ] Verify in-app notifications for messages, likes, comments, follows and group invitations.
- [ ] Submit user and content reports; verify server-side persistence and moderator visibility.
- [ ] Block and unblock an account; verify the list persists after relaunch.
- [ ] Configure OneSignal/FCM and test foreground/background notifications on Android.
- [ ] Test rate limits, malformed input and oversized uploads.

## 8. Security, privacy and release gates
- [ ] Review all Supabase RLS policies and storage policies.
- [ ] Confirm no service-role key, permanent TURN credential, FCM service key or OneSignal REST key is in the repository.
- [ ] Do not claim end-to-end encryption until all message paths and key recovery pass independent security testing.
- [ ] Complete and legally review terms, privacy policy, POPIA disclosures and community guidelines.
- [ ] No critical console errors, unhandled promise rejections or broken navigation.
- [ ] Every visible button has a verified action or is clearly unavailable; no false success messages.
- [ ] Complete backup, rollback and incident-response procedures.
- [ ] Install and test the Android package on multiple physical devices.

## KONNEKT 2.0 six-tab and appearance checks

- [ ] Confirm the authenticated bottom navigation shows exactly Chats, Updates, Reels, Calls, Discover, Profile in that order.
- [ ] Confirm Updates opens the existing status feed and Reels opens the database-backed Reels feed.
- [ ] Confirm Calls loads call history and member search, and creates a real `call_sessions` row when a call is initiated.
- [ ] Test voice and video calls between two accounts on separate devices and separate networks; verify camera/microphone permissions and TURN relay use.
- [ ] Toggle dark/light appearance and inspect text, inputs, dialogs, navigation, and media on Android and desktop.
- [ ] Confirm all existing login, sign-up, password recovery, messaging, uploads, status, Reels, profile and moderation flows still work.
- [ ] Verify all database access with RLS enabled and test a user attempting to read another user's private messages.
