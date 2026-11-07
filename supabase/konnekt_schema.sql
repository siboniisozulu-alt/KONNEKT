-- KONNEKT initial database schema. Run once in Supabase Dashboard > SQL Editor.
-- Security is enforced by Row Level Security. Never disable RLS on these tables.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique,
  full_name text not null default '',
  phone text,
  avatar_url text,
  bio text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_username_format check (username is null or username ~ '^[a-zA-Z0-9_.]{3,20}$')
);

create or replace function public.handle_new_konnekt_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, username, full_name, phone)
  values (
    new.id,
    nullif(lower(new.raw_user_meta_data ->> 'username'), ''),
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    nullif(new.raw_user_meta_data ->> 'phone', '')
  ) on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_konnekt_auth_user_created on auth.users;
create trigger on_konnekt_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_konnekt_user();

create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  title text,
  is_group boolean not null default false,
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.conversation_members (
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (conversation_id, user_id)
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references auth.users(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 10000),
  created_at timestamptz not null default now(),
  edited_at timestamptz
);

create index if not exists messages_conversation_created_idx on public.messages(conversation_id, created_at desc);
create index if not exists conversation_members_user_idx on public.conversation_members(user_id);

create table if not exists public.statuses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  text_content text,
  media_url text,
  media_type text not null default 'text' check (media_type in ('text','image','video')),
  expires_at timestamptz not null default (now() + interval '24 hours'),
  created_at timestamptz not null default now(),
  constraint statuses_content_present check (nullif(text_content, '') is not null or media_url is not null)
);
create index if not exists statuses_expiry_idx on public.statuses(expires_at desc);

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  caption text not null default '',
  media_url text not null,
  media_type text not null check (media_type in ('image','video')),
  created_at timestamptz not null default now()
);

create or replace function public.is_konnekt_conversation_member(target_conversation uuid)
returns boolean language sql security definer set search_path = public, pg_temp as $$
  select exists (
    select 1 from public.conversation_members cm
    where cm.conversation_id = target_conversation and cm.user_id = auth.uid()
  );
$$;

alter table public.profiles enable row level security;
alter table public.conversations enable row level security;
alter table public.conversation_members enable row level security;
alter table public.messages enable row level security;
alter table public.statuses enable row level security;
alter table public.posts enable row level security;

-- Signed-in users can discover basic public profile information; only owners edit their row.
drop policy if exists "profiles readable by authenticated" on public.profiles;
create policy "profiles readable by authenticated" on public.profiles for select to authenticated using (true);
drop policy if exists "profile owner inserts own row" on public.profiles;
create policy "profile owner inserts own row" on public.profiles for insert to authenticated with check (auth.uid() = id);
drop policy if exists "profile owner updates own row" on public.profiles;
create policy "profile owner updates own row" on public.profiles for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);

-- A user can see conversations only when they are a member.
drop policy if exists "members see own memberships" on public.conversation_members;
create policy "members see own memberships" on public.conversation_members for select to authenticated using (user_id = auth.uid() or public.is_konnekt_conversation_member(conversation_id));
drop policy if exists "creator adds conversation" on public.conversations;
create policy "creator adds conversation" on public.conversations for insert to authenticated with check (created_by = auth.uid());
drop policy if exists "members read conversations" on public.conversations;
create policy "members read conversations" on public.conversations for select to authenticated using (public.is_konnekt_conversation_member(id));
drop policy if exists "conversation creator adds members" on public.conversation_members;
create policy "conversation creator adds members" on public.conversation_members for insert to authenticated with check (exists (select 1 from public.conversations c where c.id = conversation_id and c.created_by = auth.uid()));

-- Only conversation members can read messages; senders can add messages as themselves.
drop policy if exists "members read messages" on public.messages;
create policy "members read messages" on public.messages for select to authenticated using (public.is_konnekt_conversation_member(conversation_id));
drop policy if exists "members send messages" on public.messages;
create policy "members send messages" on public.messages for insert to authenticated with check (sender_id = auth.uid() and public.is_konnekt_conversation_member(conversation_id));
drop policy if exists "sender edits own messages" on public.messages;
create policy "sender edits own messages" on public.messages for update to authenticated using (sender_id = auth.uid()) with check (sender_id = auth.uid());
drop policy if exists "sender deletes own messages" on public.messages;
create policy "sender deletes own messages" on public.messages for delete to authenticated using (sender_id = auth.uid());

-- Statuses are visible to signed-in users while active; owners manage their own.
drop policy if exists "authenticated users view active statuses" on public.statuses;
create policy "authenticated users view active statuses" on public.statuses for select to authenticated using (expires_at > now());
drop policy if exists "users create own statuses" on public.statuses;
create policy "users create own statuses" on public.statuses for insert to authenticated with check (user_id = auth.uid());
drop policy if exists "users delete own statuses" on public.statuses;
create policy "users delete own statuses" on public.statuses for delete to authenticated using (user_id = auth.uid());

-- Posts are readable by signed-in users; creators manage their own posts.
drop policy if exists "authenticated users view posts" on public.posts;
create policy "authenticated users view posts" on public.posts for select to authenticated using (true);
drop policy if exists "users create own posts" on public.posts;
create policy "users create own posts" on public.posts for insert to authenticated with check (user_id = auth.uid());
drop policy if exists "users update own posts" on public.posts;
create policy "users update own posts" on public.posts for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists "users delete own posts" on public.posts;
create policy "users delete own posts" on public.posts for delete to authenticated using (user_id = auth.uid());

-- Enable Realtime for chat messages. Ignore the error if already added to the publication.
do $$ begin
  alter publication supabase_realtime add table public.messages;
exception when duplicate_object then null;
end $$;
