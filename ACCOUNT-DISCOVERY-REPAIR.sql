-- KONNEKT account discovery repair (safe to run more than once).
-- Does not delete users, profiles, conversations, messages, or other data.

-- Ensure older auth accounts have a public profile row.
insert into public.profiles (id, username, full_name)
select
  u.id,
  case
    when coalesce(u.raw_user_meta_data ->> 'username', '') ~ '^[a-zA-Z0-9_.]{3,20}$'
      then lower(u.raw_user_meta_data ->> 'username')
    else null
  end,
  coalesce(u.raw_user_meta_data ->> 'full_name', u.raw_user_meta_data ->> 'name', '')
from auth.users u
on conflict (id) do nothing;

-- Allow signed-in members to find public profile fields only.
alter table public.profiles enable row level security;
drop policy if exists "profiles readable by authenticated" on public.profiles;
create policy "profiles readable by authenticated"
  on public.profiles for select to authenticated using (true);
grant select, insert, update on public.profiles to authenticated;

-- Members may create or update only their own profile.
drop policy if exists "profile owner inserts own row" on public.profiles;
create policy "profile owner inserts own row"
  on public.profiles for insert to authenticated with check (auth.uid() = id);
drop policy if exists "profile owner updates own row" on public.profiles;
create policy "profile owner updates own row"
  on public.profiles for update to authenticated
  using (auth.uid() = id) with check (auth.uid() = id);
