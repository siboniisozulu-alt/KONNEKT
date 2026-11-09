# KONNEKT communications release test checklist

Run these tests only after the migration and Edge Functions are deployed and provider credentials are configured.

## Direct and group messaging
- [ ] Sign in as two different users on separate devices.
- [ ] Send text and media in a direct conversation.
- [ ] Confirm messages arrive once, in order, after reconnect.
- [ ] Open a received message and confirm the sender sees its read receipt.
- [ ] Repeat in a group with at least three accounts.
- [ ] Confirm each recipient's read receipt updates independently.
- [ ] Confirm users outside the conversation cannot read messages or receipts.

## Voice and video calls
- [ ] Grant microphone and camera permissions.
- [ ] Place a voice call from one account to another.
- [ ] Confirm the second device shows the incoming-call prompt.
- [ ] Answer and verify two-way audio.
- [ ] Decline and verify the caller sees the declined state.
- [ ] Repeat as a video call and verify two-way video.
- [ ] Test mute, camera-off, hang-up and reconnect.
- [ ] Test Wi-Fi to mobile-data and two different networks.
- [ ] Confirm coturn credentials are minted and TURN relay is used when direct connectivity fails.
- [ ] Confirm the call still works when the app has been backgrounded only if native background call support has separately been configured.

## Push notifications
- [ ] Confirm Android Firebase credentials are configured in OneSignal.
- [ ] Grant notification permission on both devices.
- [ ] Send a direct and group message with the recipient app closed.
- [ ] Place a call with the recipient app closed and confirm the push arrives.
- [ ] Confirm users outside the exact conversation never receive a notification.
- [ ] Confirm provider errors do not prevent the message from being saved.

## Security and release
- [ ] Verify Supabase RLS with non-member accounts.
- [ ] Verify no service-role key, OneSignal REST key or TURN shared secret is in the web bundle or GitHub repository.
- [ ] Confirm the UI does not claim E2EE. E2EE remains a separate, unfinished release requirement.
- [ ] Complete a security review before public release.
