# KONNEKT — Connecting people everywhere

KONNEKT is a React/Vite + Supabase + Capacitor social and communication app with five main tabs: Chats, Reels, Status, Discover and Profile.

## Start here

Read **[BETA-1.0-TEST-NOTES.md](BETA-1.0-TEST-NOTES.md)** for the feature centre, limitations and test status. After signing in, open Profile → All KONNEKT features to access the included feature screens.


Read **[KONNEKT-ALL-STAGES-UPGRADE-GUIDE.md](KONNEKT-ALL-STAGES-UPGRADE-GUIDE.md)** before deploying. It explains the additive database migrations, TURN/push setup, Android APK/AAB workflows and test gates.

## Existing project preservation

- Keep the existing Supabase project URL and publishable key in `src/lib_supabase.js`.
- Keep existing users, messages, conversations, posts, statuses and Storage buckets.
- Never run a database reset or destructive schema script.
- Never put a Supabase `service_role` key, TURN permanent secret, FCM service-account file or signing keystore in the repository.

## Development commands

```bash
npm install
npm run dev
npm run build
npm run build:mobile
```

## Included project material

- `src/screens/` — five main tabs and supporting screens.
- `src/services/` — Supabase, realtime, calls, encryption, ranking, media and safety services.
- `supabase/migrations/` — additive migrations; see the guide for order and previously-applied migrations.
- `docs/` — privacy/terms drafts, community guidelines, moderator setup, TURN/push instructions and integrated test plan.
- `.github/workflows/` — GitHub Pages deployment, debug APK and signed AAB workflows.
- `android-res/` and `public/` — app icon, splash and PWA assets.

## Important

This is a development/test build. It is not certified as production secure or launch-ready. External services and legal/operator details must be configured and verified separately.
