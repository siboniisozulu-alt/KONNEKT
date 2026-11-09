-- KONNEKT additive realtime, calling, presence and E2EE support.
-- Does not drop, truncate, rename, or reset existing user data.

-- Public keys only. Private encryption keys remain on each user's device.
alter table public.profiles add column if not exists encryption_public_key text;

-- Encrypted text-message metadata and read receipts. Existing messages remain readable.
alter table public.messages add column if not exists is_encrypted boolean not null default false;
alter table public.messages add column if not exists encryption_iv text;
alter table public.messages add column if not exists delivered_at timestamptz;
alter table public.messages add column if not exists read_at timestamptz;

-- Lightweight presence, one row per account. No location data is collected.
create table if not exists public.user_presence (
  user_id uuid primary key references auth.users(id) on delete cascade,
  is_online boolean not null default false,
  last_seen_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.user_presence enable row level security;
drop policy if exists "presence visible to authenticated" on public.user_presence;
create policy "presence visible to authenticated" on public.user_presence for select to authenticated using (true);
drop policy if exists "users publish own presence" on public.user_presence;
create policy "users publish own presence" on public.user_presence for insert to authenticated with check (user_id = auth.uid());
drop policy if exists "users update own presence" on public.user_presence;
create policy "users update own presence" on public.user_presence for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
grant select, insert, update on public.user_presence to authenticated;

-- WebRTC call signalling. Media travels peer-to-peer; this database stores signalling only.
create table if not exists public.call_sessions (
  id uuid primary key default gen_random_uuid(),
  caller_id uuid not null references auth.users(id) on delete cascade,
  callee_id uuid not null references auth.users(id) on delete cascade,
  conversation_id uuid references public.conversations(id) on delete set null,
  call_type text not null default 'voice' check (call_type in ('voice','video')),
  status text not null default 'ringing' check (status in ('ringing','accepted','declined','ended','missed')),
  created_at timestamptz not null default now(),
  answered_at timestamptz,
  ended_at timestamptz,
  constraint calls_no_self check (caller_id <> callee_id)
);
create index if not exists call_sessions_callee_created_idx on public.call_sessions(callee_id, created_at desc);
create index if not exists call_sessions_caller_created_idx on public.call_sessions(caller_id, created_at desc);
alter table public.call_sessions enable row level security;
drop policy if exists "call participants read sessions" on public.call_sessions;
create policy "call participants read sessions" on public.call_sessions for select to authenticated using (caller_id = auth.uid() or callee_id = auth.uid());
drop policy if exists "caller creates call session" on public.call_sessions;
create policy "caller creates call session" on public.call_sessions for insert to authenticated with check (caller_id = auth.uid());
drop policy if exists "participants update call session" on public.call_sessions;
create policy "participants update call session" on public.call_sessions for update to authenticated using (caller_id = auth.uid() or callee_id = auth.uid()) with check (caller_id = auth.uid() or callee_id = auth.uid());
grant select, insert, update on public.call_sessions to authenticated;

create table if not exists public.call_signals (
  id uuid primary key default gen_random_uuid(),
  call_id uuid not null references public.call_sessions(id) on delete cascade,
  sender_id uuid not null references auth.users(id) on delete cascade,
  signal_type text not null check (signal_type in ('offer','answer','ice-candidate','hangup')),
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists call_signals_call_created_idx on public.call_signals(call_id, created_at);
alter table public.call_signals enable row level security;
drop policy if exists "call participants read signals" on public.call_signals;
create policy "call participants read signals" on public.call_signals for select to authenticated using (exists (select 1 from public.call_sessions c where c.id = call_id and (c.caller_id = auth.uid() or c.callee_id = auth.uid())));
drop policy if exists "call participants send signals" on public.call_signals;
create policy "call participants send signals" on public.call_signals for insert to authenticated with check (sender_id = auth.uid() and exists (select 1 from public.call_sessions c where c.id = call_id and (c.caller_id = auth.uid() or c.callee_id = auth.uid())));
grant select, insert on public.call_signals to authenticated;

-- Realtime publication additions. Safe if already published.
do $$ begin alter publication supabase_realtime add table public.user_presence; exception when duplicate_object then null; when undefined_object then null; end $$;
do $$ begin alter publication supabase_realtime add table public.call_sessions; exception when duplicate_object then null; when undefined_object then null; end $$;
do $$ begin alter publication supabase_realtime add table public.call_signals; exception when duplicate_object then null; when undefined_object then null; end $$;

-- Per-recipient delivery/read receipts avoid granting recipients edit access to message bodies.
create table if not exists public.message_receipts (
  message_id uuid not null references public.messages(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  delivered_at timestamptz,
  read_at timestamptz,
  primary key (message_id, user_id)
);
alter table public.message_receipts enable row level security;
drop policy if exists "conversation members read receipts" on public.message_receipts;
create policy "conversation members read receipts" on public.message_receipts for select to authenticated using (exists (select 1 from public.messages m where m.id = message_id and public.is_konnekt_conversation_member(m.conversation_id)));
drop policy if exists "recipients write own receipts" on public.message_receipts;
create policy "recipients write own receipts" on public.message_receipts for insert to authenticated with check (user_id = auth.uid() and exists (select 1 from public.messages m where m.id = message_id and m.sender_id <> auth.uid() and public.is_konnekt_conversation_member(m.conversation_id)));
drop policy if exists "recipients update own receipts" on public.message_receipts;
create policy "recipients update own receipts" on public.message_receipts for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
grant select, insert, update on public.message_receipts to authenticated;

-- Prevent participants from rewriting call identity or redirecting an existing call.
create or replace function public.konnekt_guard_call_session_update()
returns trigger language plpgsql security invoker set search_path = public, pg_temp as $$
begin
  if auth.uid() is not null and auth.uid() not in (old.caller_id, old.callee_id) then
    raise exception 'Only call participants may update a call.';
  end if;
  if new.caller_id is distinct from old.caller_id
     or new.callee_id is distinct from old.callee_id
     or new.conversation_id is distinct from old.conversation_id
     or new.call_type is distinct from old.call_type
     or new.created_at is distinct from old.created_at then
    raise exception 'Call participants cannot change call identity.';
  end if;
  return new;
end; $$;
drop trigger if exists konnekt_guard_call_session_update on public.call_sessions;
create trigger konnekt_guard_call_session_update before update on public.call_sessions for each row execute function public.konnekt_guard_call_session_update();

-- Keep receipt rows constrained to messages in conversations the recipient belongs to.
drop policy if exists "recipients update own receipts" on public.message_receipts;
create policy "recipients update own receipts" on public.message_receipts for update to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid() and exists (select 1 from public.messages m where m.id = message_id and m.sender_id <> auth.uid() and public.is_konnekt_conversation_member(m.conversation_id)));

do $$ begin
  alter table public.messages add constraint messages_encryption_iv_required
    check (not is_encrypted or encryption_iv is not null);
exception when duplicate_object then null;
end $$;

do $$ begin alter publication supabase_realtime add table public.message_receipts; exception when duplicate_object then null; when undefined_object then null; end $$;
