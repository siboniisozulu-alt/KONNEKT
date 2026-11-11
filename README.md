# KONNEKT

**KONNEKT — Connecting people everywhere.**

This is the revised KONNEKT application source. It keeps the existing Supabase project configuration and uses additive database migrations. It does not include sample accounts, fake conversations, fictional earnings, or seeded social posts.

## Application capabilities in this package

- Supabase email/password authentication and profile persistence.
- One-to-one conversations and realtime message updates.
- Group creation using real member profiles and Supabase conversation records.
- Image, video and audio attachments in chats.
- In-app voice-note recording, playback and upload where browser microphone recording is supported.
- One-to-one WebRTC voice/video call signalling and media transport.
- Small peer-to-peer group calls (maximum four participants); production scale requires an SFU.
- Realtime call invitations while the app is open.
- 24-hour text/photo/video status publishing and viewing.
- Shared photo/video posts with likes and comments.
- In-app realtime notifications.
- Report submission, user blocking and blocked-account management backed by Supabase.
- Local device preferences for content and notifications.
- Row Level Security and storage policies in the existing schema and migrations.

## External configuration still required

- Apply the additive SQL migrations in `supabase/migrations` in chronological order. Do not reset the project or rerun the original schema as a reset.
- Configure a TURN relay for dependable calls across mobile networks and restrictive firewalls. Set `VITE_TURN_URLS`, `VITE_TURN_USERNAME` and `VITE_TURN_CREDENTIAL` in the deployment environment.
- Configure OneSignal for background push notifications. In-app notifications and incoming call prompts work while the app is open.
- Live video broadcasting requires a streaming provider or SFU; a local camera preview is not a broadcast.
- End-to-end encryption is not yet enabled for ordinary messages. Do not advertise chats as end-to-end encrypted.
- Creator verification, creator subscriptions, earnings, payouts and brand campaigns are not active. The package does not show fictional balances or pretend applications were submitted.
- Legal terms and privacy materials remain drafts and require legal review and completion before public launch.

## Build

1. Extract the ZIP.
2. Open the `KONNEKT-main` folder.
3. Run `npm install`.
4. Run `npm run build`.
5. Deploy the generated `dist` folder or push the source to the existing GitHub repository and allow the configured workflow to deploy.

## Existing project protection

- Keep the existing Supabase project and its data.
- Do not expose a Supabase service-role key in browser code.
- Do not commit `.env` files or TURN credentials.
- Apply only migrations that are not already applied. Review each migration before execution.

See `KONNEKT-REVISED-PACKAGE-NOTES.md`, `TESTING-CHECKLIST.md`, `docs/TURN-AND-PUSH-SETUP.md` and `SUPABASE-SETUP.md` for deployment and verification instructions.
