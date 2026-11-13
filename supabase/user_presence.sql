
-- KONNEKT user presence
-- Safe to run more than once. No location data is collected.

create table if not exists public.user_presence (
  user_id uuid primary key references auth.users(id) on delete cascade,
  is_online boolean not null default false,
  last_seen_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.user_presence enable row level security;

drop policy if exists "presence visible to authenticated" on public.user_presence;
create policy "presence visible to authenticated"
  on public.user_presence for select to authenticated
  using (true);

drop policy if exists "users publish own presence" on public.user_presence;
create policy "users publish own presence"
  on public.user_presence for insert to authenticated
  with check (user_id = auth.uid());

drop policy if exists "users update own presence" on public.user_presence;
create policy "users update own presence"
  on public.user_presence for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

grant select, insert, update on public.user_presence to authenticated;

do $$
begin
  alter publication supabase_realtime add table public.user_presence;
exception
  when duplicate_object then null;
  when undefined_object then null;
end
$$;
