-- Encrypted-at-rest client-side recovery backups. Supabase stores ciphertext only.
-- Safe additive migration: no existing account or message rows are removed.
create table if not exists public.user_key_backups (
  user_id uuid primary key references auth.users(id) on delete cascade,
  ciphertext text not null,
  salt text not null,
  iv text not null,
  iterations integer not null check (iterations between 100000 and 1000000),
  key_version integer not null default 1 check (key_version = 1),
  updated_at timestamptz not null default now()
);
alter table public.user_key_backups enable row level security;
drop policy if exists "users read own key backup" on public.user_key_backups;
create policy "users read own key backup" on public.user_key_backups for select to authenticated using (user_id = auth.uid());
drop policy if exists "users create own key backup" on public.user_key_backups;
create policy "users create own key backup" on public.user_key_backups for insert to authenticated with check (user_id = auth.uid());
drop policy if exists "users update own key backup" on public.user_key_backups;
create policy "users update own key backup" on public.user_key_backups for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
grant select,insert,update on public.user_key_backups to authenticated;
revoke all on public.user_key_backups from anon;
