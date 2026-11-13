# KONNEKT staging backend setup

The complete one-upload deployment guide is now `README_REAL_WORLD_TESTING.md`.

## Required order
1. Create a dedicated Supabase staging project.
2. Add only its project URL and public anon/publishable key to `konnekt_pwa/config.js`.
3. Run `supabase login`, `supabase link --project-ref YOUR_PROJECT_REF`, and `supabase db push` from the repository root.
4. Configure Supabase Auth Site URL/redirect URLs, SMTP verification and rate limits.
5. Deploy the Edge Functions listed in the root README.
6. Set trusted secrets for CORS, LiveKit, VAPID and Status cleanup. Never expose service-role or private provider keys in the browser.
7. Deploy the PWA to HTTPS and test with two verified accounts.
8. Complete `testing/REAL_WORLD_TEST_PLAN.md` and `backend/RLS_TEST_PLAN.md` before inviting testers.

## Files
- `supabase/migrations/` — ordered database migrations.
- `backend/supabase_staging_schema.sql` — base schema source.
- `backend/real_world_testing_migration.sql` — staging features and policies.
- `backend/supabase/functions/` — trusted server functions.
- `backend/cleanup_schedule.sql` — optional scheduled Status cleanup.
- `konnekt_pwa/config.example.js` — public browser configuration template.
- `.env.example` — trusted secret placeholders only.
- `moderation.html` is served as `/moderation.html` from the PWA folder.

No live project is connected in this source package. Deployment and live verification are still required.
