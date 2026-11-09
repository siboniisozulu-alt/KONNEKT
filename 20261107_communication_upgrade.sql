-- KONNEKT communications upgrade (additive only; preserves all existing users/messages)
create extension if not exists pgcrypto;

-- Group membership roles and per-message delivery/read receipts.
alter table public.conversation_members add column if not exists role text not null default 'member';
alter table public.conversation_members add column if not exists last_read_at timestamptz;
create table if not exists public.message_receipts (
  message_id uuid not null references public.messages(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  delivered_at timestamptz,
  read_at timestamptz,
  primary key(message_id,user_id)
);
create index if not exists message_receipts_user_idx on public.message_receipts(user_id,read_at);
alter table public.message_receipts enable row level security;
drop policy if exists "members can view receipts" on public.message_receipts;
create policy "members can view receipts" on public.message_receipts for select to authenticated
using (exists(select 1 from public.messages m join public.conversation_members cm on cm.conversation_id=m.conversation_id where m.id=message_id and cm.user_id=auth.uid()));
drop policy if exists "users mark own receipts" on public.message_receipts;
create policy "users mark own receipts" on public.message_receipts for insert to authenticated with check(user_id=auth.uid());
drop policy if exists "users update own receipts" on public.message_receipts;
create policy "users update own receipts" on public.message_receipts for update to authenticated using(user_id=auth.uid()) with check(user_id=auth.uid());
grant select,insert,update on public.message_receipts to authenticated;

-- Call session metadata. SDP/ICE payloads are private to call participants.
create table if not exists public.call_sessions (
 id uuid primary key default gen_random_uuid(),
 conversation_id uuid references public.conversations(id) on delete set null,
 caller_id uuid not null references auth.users(id) on delete cascade,
 callee_id uuid not null references auth.users(id) on delete cascade,
 call_type text not null check(call_type in ('voice','video')),
 status text not null default 'ringing' check(status in ('ringing','accepted','rejected','missed','ended','failed')),
 started_at timestamptz not null default now(), answered_at timestamptz, ended_at timestamptz,
 created_at timestamptz not null default now()
);
create index if not exists call_sessions_callee_idx on public.call_sessions(callee_id,status,created_at desc);
create table if not exists public.call_signals (
 id bigint generated always as identity primary key,
 call_id uuid not null references public.call_sessions(id) on delete cascade,
 sender_id uuid not null references auth.users(id) on delete cascade,
 signal_type text not null check(signal_type in ('offer','answer','ice','hangup','reject')),
 payload jsonb not null default '{}'::jsonb,
 created_at timestamptz not null default now()
);
create index if not exists call_signals_call_idx on public.call_signals(call_id,id);
alter table public.call_sessions enable row level security;
alter table public.call_signals enable row level security;
drop policy if exists "participants read calls" on public.call_sessions;
create policy "participants read calls" on public.call_sessions for select to authenticated using(auth.uid()=caller_id or auth.uid()=callee_id);
drop policy if exists "caller creates calls" on public.call_sessions;
create policy "caller creates calls" on public.call_sessions for insert to authenticated with check(auth.uid()=caller_id);
drop policy if exists "participants update calls" on public.call_sessions;
create policy "participants update calls" on public.call_sessions for update to authenticated using(auth.uid()=caller_id or auth.uid()=callee_id) with check(auth.uid()=caller_id or auth.uid()=callee_id);
drop policy if exists "participants read call signals" on public.call_signals;
create policy "participants read call signals" on public.call_signals for select to authenticated using(exists(select 1 from public.call_sessions c where c.id=call_id and (c.caller_id=auth.uid() or c.callee_id=auth.uid())));
drop policy if exists "participants send call signals" on public.call_signals;
create policy "participants send call signals" on public.call_signals for insert to authenticated with check(sender_id=auth.uid() and exists(select 1 from public.call_sessions c where c.id=call_id and (c.caller_id=auth.uid() or c.callee_id=auth.uid())));
grant select,insert,update on public.call_sessions to authenticated;
grant select,insert on public.call_signals to authenticated;

-- Public encryption keys are public; private keys MUST remain on each user's device.
create table if not exists public.user_device_keys (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
 device_label text not null default 'Device', identity_public_key text not null,
 signed_prekey text not null, signed_prekey_signature text not null,
 created_at timestamptz not null default now(), revoked_at timestamptz
);
create index if not exists user_device_keys_user_idx on public.user_device_keys(user_id) where revoked_at is null;
alter table public.user_device_keys enable row level security;
drop policy if exists "authenticated can read active public keys" on public.user_device_keys;
create policy "authenticated can read active public keys" on public.user_device_keys for select to authenticated using(revoked_at is null);
drop policy if exists "users manage own device keys" on public.user_device_keys;
create policy "users manage own device keys" on public.user_device_keys for insert to authenticated with check(user_id=auth.uid());
drop policy if exists "users revoke own device keys" on public.user_device_keys;
create policy "users revoke own device keys" on public.user_device_keys for update to authenticated using(user_id=auth.uid()) with check(user_id=auth.uid());
grant select,insert,update on public.user_device_keys to authenticated;

-- Add new tables to Supabase Realtime where not already enabled.
do $$ begin
  alter publication supabase_realtime add table public.call_sessions;
exception when duplicate_object then null; when undefined_object then null; end $$;
do $$ begin
  alter publication supabase_realtime add table public.call_signals;
exception when duplicate_object then null; when undefined_object then null; end $$;
do $$ begin
  alter publication supabase_realtime add table public.message_receipts;
exception when duplicate_object then null; when undefined_object then null; end $$;
