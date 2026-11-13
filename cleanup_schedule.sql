-- Optional 15-minute cleanup schedule. Enable pg_cron, pg_net and Vault first.
-- Run as project owner after creating the two Vault secrets.
-- Replace the URL and secret values in the two vault.create_secret calls.
select vault.create_secret('https://YOUR_PROJECT.supabase.co/functions/v1/cleanup-expired-statuses','konnekt_cleanup_url');
select vault.create_secret('YOUR_LONG_RANDOM_SECRET','konnekt_cleanup_secret');
select cron.schedule('konnekt-status-cleanup','*/15 * * * *', $$
  select net.http_post(
    url := (select decrypted_secret from vault.decrypted_secrets where name='konnekt_cleanup_url'),
    headers := jsonb_build_object('Content-Type','application/json','x-cleanup-secret',(select decrypted_secret from vault.decrypted_secrets where name='konnekt_cleanup_secret')),
    body := '{}'::jsonb
  );
$$);
