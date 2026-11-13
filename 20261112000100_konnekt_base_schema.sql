-- KONNEKT staging schema v2 — Supabase/PostgreSQL
-- Apply ONLY to a dedicated staging project. Review with a security engineer before production.
-- This script is designed to be re-runnable. It does not provision Auth users or configure SMTP.

create extension if not exists pgcrypto;

-- Core identity
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '' check (char_length(display_name) <= 80),
  username text unique check (username is null or username ~ '^[A-Za-z0-9_]{3,24}$'),
  bio text not null default '' check (char_length(bio) <= 500),
  avatar_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.follows (
  follower_id uuid not null references public.profiles(id) on delete cascade,
  followed_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, followed_id),
  check (follower_id <> followed_id)
);
create index if not exists follows_followed_idx on public.follows(followed_id, follower_id);

create table if not exists public.blocked_users (
  blocker_id uuid not null references public.profiles(id) on delete cascade,
  blocked_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (blocker_id, blocked_id),
  check (blocker_id <> blocked_id)
);

-- Private conversations and messages
create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  created_by uuid not null references public.profiles(id) on delete restrict,
  title text check (title is null or char_length(title) <= 100),
  is_group boolean not null default false,
  created_at timestamptz not null default now()
);
create table if not exists public.conversation_members (
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (conversation_id, user_id)
);
create index if not exists conversation_members_user_idx on public.conversation_members(user_id, conversation_id);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete restrict,
  body text not null check (char_length(body) between 1 and 10000),
  created_at timestamptz not null default now(),
  edited_at timestamptz,
  deleted_at timestamptz
);
create index if not exists messages_conversation_created_idx on public.messages(conversation_id, created_at desc);

-- Reels, likes and comments
create table if not exists public.reels (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  caption text not null default '' check (char_length(caption) <= 2200),
  media_path text not null,
  visibility text not null default 'public' check (visibility in ('public','followers','private')),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  deleted_at timestamptz
);
create index if not exists reels_feed_idx on public.reels(published_at desc) where deleted_at is null;
create index if not exists reels_user_idx on public.reels(user_id, created_at desc);

create table if not exists public.reel_likes (
  reel_id uuid not null references public.reels(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (reel_id, user_id)
);
create table if not exists public.reel_comments (
  id uuid primary key default gen_random_uuid(),
  reel_id uuid not null references public.reels(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 2000),
  created_at timestamptz not null default now(),
  deleted_at timestamptz
);
create index if not exists reel_comments_reel_idx on public.reel_comments(reel_id, created_at desc);

-- Ephemeral status. The app must still enforce visibility and expiry in every query.
create table if not exists public.statuses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  caption text not null default '' check (char_length(caption) <= 700),
  media_path text,
  expires_at timestamptz not null default (now() + interval '24 hours'),
  created_at timestamptz not null default now(),
  check (media_path is not null or caption <> '')
);
create index if not exists statuses_expiry_idx on public.statuses(expires_at);

-- User-submitted safety reports. Moderation/admin access must be added via a trusted server role.
create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  target_user_id uuid references public.profiles(id) on delete cascade,
  target_reel_id uuid references public.reels(id) on delete cascade,
  target_message_id uuid references public.messages(id) on delete cascade,
  reason text not null check (char_length(reason) between 3 and 100),
  details text not null default '' check (char_length(details) <= 3000),
  created_at timestamptz not null default now(),
  check (num_nonnulls(target_user_id, target_reel_id, target_message_id) = 1)
);

-- RLS helper functions. Fixed search_path and narrowly granted execution reduce risk.
create or replace function public.konnekt_is_member(target_conversation uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.conversation_members cm
    where cm.conversation_id = target_conversation and cm.user_id = (select auth.uid())
  );
$$;
create or replace function public.konnekt_is_creator(target_conversation uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.conversations c
    where c.id = target_conversation and c.created_by = (select auth.uid())
  );
$$;
create or replace function public.konnekt_is_blocked_pair(other_user uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.blocked_users b
    where (b.blocker_id = (select auth.uid()) and b.blocked_id = other_user)
       or (b.blocker_id = other_user and b.blocked_id = (select auth.uid()))
  );
$$;
create or replace function public.konnekt_can_view_reel(target_reel uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.reels r
    where r.id = target_reel and r.deleted_at is null
      and (r.user_id = (select auth.uid()) or (r.published_at is not null and
        (r.visibility = 'public' or (r.visibility = 'followers' and exists (
          select 1 from public.follows f where f.follower_id = (select auth.uid()) and f.followed_id = r.user_id
        ))) and not public.konnekt_is_blocked_pair(r.user_id)))
  );
$$;
revoke all on function public.konnekt_is_member(uuid) from public, anon;
revoke all on function public.konnekt_is_creator(uuid) from public, anon;
revoke all on function public.konnekt_is_blocked_pair(uuid) from public, anon;
revoke all on function public.konnekt_can_view_reel(uuid) from public, anon;
grant execute on function public.konnekt_is_member(uuid) to authenticated;
grant execute on function public.konnekt_is_creator(uuid) to authenticated;
grant execute on function public.konnekt_is_blocked_pair(uuid) to authenticated;
grant execute on function public.konnekt_can_view_reel(uuid) to authenticated;

-- Enable RLS everywhere before policies are applied.
alter table public.profiles enable row level security;
alter table public.follows enable row level security;
alter table public.blocked_users enable row level security;
alter table public.conversations enable row level security;
alter table public.conversation_members enable row level security;
alter table public.messages enable row level security;
alter table public.reels enable row level security;
alter table public.reel_likes enable row level security;
alter table public.reel_comments enable row level security;
alter table public.statuses enable row level security;
alter table public.reports enable row level security;

-- Table privileges are broad only for the authenticated role; RLS above remains the row-level gate.
grant usage on schema public to authenticated;
grant select, insert, update, delete on public.profiles, public.follows, public.blocked_users,
  public.conversations, public.conversation_members, public.messages, public.reels,
  public.reel_likes, public.reel_comments, public.statuses, public.reports to authenticated;

-- Profiles
 drop policy if exists profiles_read_authenticated on public.profiles;
create policy profiles_read_authenticated on public.profiles for select to authenticated using (true);
drop policy if exists profiles_insert_self on public.profiles;
create policy profiles_insert_self on public.profiles for insert to authenticated with check (id = (select auth.uid()));
drop policy if exists profiles_update_self on public.profiles;
create policy profiles_update_self on public.profiles for update to authenticated using (id = (select auth.uid())) with check (id = (select auth.uid()));

-- Follows and blocks
 drop policy if exists follows_read_authenticated on public.follows;
create policy follows_read_authenticated on public.follows for select to authenticated using (true);
drop policy if exists follows_insert_self on public.follows;
create policy follows_insert_self on public.follows for insert to authenticated with check (follower_id = (select auth.uid()) and not public.konnekt_is_blocked_pair(followed_id));
drop policy if exists follows_delete_self on public.follows;
create policy follows_delete_self on public.follows for delete to authenticated using (follower_id = (select auth.uid()));
drop policy if exists blocks_read_self on public.blocked_users;
create policy blocks_read_self on public.blocked_users for select to authenticated using (blocker_id = (select auth.uid()));
drop policy if exists blocks_insert_self on public.blocked_users;
create policy blocks_insert_self on public.blocked_users for insert to authenticated with check (blocker_id = (select auth.uid()));
drop policy if exists blocks_delete_self on public.blocked_users;
create policy blocks_delete_self on public.blocked_users for delete to authenticated using (blocker_id = (select auth.uid()));

-- Conversations: a creator may add only themselves in this starter flow.
drop policy if exists conversations_read_members on public.conversations;
create policy conversations_read_members on public.conversations for select to authenticated using (public.konnekt_is_member(id));
drop policy if exists conversations_create_self on public.conversations;
create policy conversations_create_self on public.conversations for insert to authenticated with check (created_by = (select auth.uid()));
drop policy if exists conversations_update_creator on public.conversations;
create policy conversations_update_creator on public.conversations for update to authenticated using (created_by = (select auth.uid())) with check (created_by = (select auth.uid()));
drop policy if exists conversations_delete_creator on public.conversations;
create policy conversations_delete_creator on public.conversations for delete to authenticated using (created_by = (select auth.uid()));
drop policy if exists members_read_same_conversation on public.conversation_members;
create policy members_read_same_conversation on public.conversation_members for select to authenticated using (public.konnekt_is_member(conversation_id));
drop policy if exists members_creator_add_self on public.conversation_members;
create policy members_creator_add_self on public.conversation_members for insert to authenticated with check (user_id = (select auth.uid()) and public.konnekt_is_creator(conversation_id));
drop policy if exists members_leave_self on public.conversation_members;
create policy members_leave_self on public.conversation_members for delete to authenticated using (user_id = (select auth.uid()));

-- Messages: membership is checked on both old and new row during edits.
drop policy if exists messages_read_members on public.messages;
create policy messages_read_members on public.messages for select to authenticated using (public.konnekt_is_member(conversation_id) and not public.konnekt_is_blocked_pair(sender_id));
drop policy if exists messages_insert_as_self_member on public.messages;
create policy messages_insert_as_self_member on public.messages for insert to authenticated with check (sender_id = (select auth.uid()) and public.konnekt_is_member(conversation_id));
drop policy if exists messages_update_own on public.messages;
create policy messages_update_own on public.messages for update to authenticated using (sender_id = (select auth.uid()) and public.konnekt_is_member(conversation_id)) with check (sender_id = (select auth.uid()) and public.konnekt_is_member(conversation_id));
drop policy if exists messages_delete_own on public.messages;
create policy messages_delete_own on public.messages for delete to authenticated using (sender_id = (select auth.uid()) and public.konnekt_is_member(conversation_id));

-- Reels: only published content visible according to visibility; owner always sees own drafts.
drop policy if exists reels_read_visible on public.reels;
create policy reels_read_visible on public.reels for select to authenticated using (
  user_id = (select auth.uid()) or (deleted_at is null and published_at is not null and
    (visibility = 'public' or (visibility = 'followers' and exists (
      select 1 from public.follows f where f.follower_id = (select auth.uid()) and f.followed_id = reels.user_id
    ))) and not public.konnekt_is_blocked_pair(user_id))
);
drop policy if exists reels_insert_self on public.reels;
create policy reels_insert_self on public.reels for insert to authenticated with check (user_id = (select auth.uid()));
drop policy if exists reels_update_self on public.reels;
create policy reels_update_self on public.reels for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
drop policy if exists reels_delete_self on public.reels;
create policy reels_delete_self on public.reels for delete to authenticated using (user_id = (select auth.uid()));

-- Likes and comments are restricted to visible, non-deleted reels.
drop policy if exists reel_likes_read_authenticated on public.reel_likes;
create policy reel_likes_read_authenticated on public.reel_likes for select to authenticated using (public.konnekt_can_view_reel(reel_id));
drop policy if exists reel_likes_insert_self on public.reel_likes;
create policy reel_likes_insert_self on public.reel_likes for insert to authenticated with check (user_id = (select auth.uid()) and public.konnekt_can_view_reel(reel_id));
drop policy if exists reel_likes_delete_self on public.reel_likes;
create policy reel_likes_delete_self on public.reel_likes for delete to authenticated using (user_id = (select auth.uid()));
drop policy if exists reel_comments_read_visible on public.reel_comments;
create policy reel_comments_read_visible on public.reel_comments for select to authenticated using (deleted_at is null and public.konnekt_can_view_reel(reel_id));
drop policy if exists reel_comments_insert_self on public.reel_comments;
create policy reel_comments_insert_self on public.reel_comments for insert to authenticated with check (user_id = (select auth.uid()) and public.konnekt_can_view_reel(reel_id));
drop policy if exists reel_comments_update_self on public.reel_comments;
create policy reel_comments_update_self on public.reel_comments for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
drop policy if exists reel_comments_delete_self on public.reel_comments;
create policy reel_comments_delete_self on public.reel_comments for delete to authenticated using (user_id = (select auth.uid()));

-- Status audience: owner or follower, only before expiry and not blocked.
drop policy if exists statuses_read_audience on public.statuses;
create policy statuses_read_audience on public.statuses for select to authenticated using (
  expires_at > now() and not public.konnekt_is_blocked_pair(user_id) and
  (user_id = (select auth.uid()) or exists (
    select 1 from public.follows f where f.follower_id = (select auth.uid()) and f.followed_id = statuses.user_id
  ))
);
drop policy if exists statuses_insert_self on public.statuses;
create policy statuses_insert_self on public.statuses for insert to authenticated with check (user_id = (select auth.uid()) and expires_at <= now() + interval '24 hours' and expires_at > now());
drop policy if exists statuses_update_self on public.statuses;
create policy statuses_update_self on public.statuses for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
drop policy if exists statuses_delete_self on public.statuses;
create policy statuses_delete_self on public.statuses for delete to authenticated using (user_id = (select auth.uid()));

-- Reports: reporter can submit and inspect only their own reports. Moderation is server-side only.
drop policy if exists reports_insert_self on public.reports;
create policy reports_insert_self on public.reports for insert to authenticated with check (reporter_id = (select auth.uid()));
drop policy if exists reports_read_self on public.reports;
create policy reports_read_self on public.reports for select to authenticated using (reporter_id = (select auth.uid()));

-- Profile/reel media are private-by-default. Status media is private and expires via scheduled cleanup.
insert into storage.buckets (id, name, public) values
  ('konnekt-avatars','konnekt-avatars',false),
  ('konnekt-reels','konnekt-reels',false),
  ('konnekt-status','konnekt-status',false)
on conflict (id) do update set public = excluded.public;

drop policy if exists konnekt_avatar_read_owner on storage.objects;
create policy konnekt_avatar_read_owner on storage.objects for select to authenticated using (bucket_id = 'konnekt-avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);
drop policy if exists konnekt_avatar_insert_owner on storage.objects;
create policy konnekt_avatar_insert_owner on storage.objects for insert to authenticated with check (bucket_id = 'konnekt-avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);
drop policy if exists konnekt_avatar_update_owner on storage.objects;
create policy konnekt_avatar_update_owner on storage.objects for update to authenticated using (bucket_id = 'konnekt-avatars' and (storage.foldername(name))[1] = (select auth.uid())::text) with check (bucket_id = 'konnekt-avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);
drop policy if exists konnekt_avatar_delete_owner on storage.objects;
create policy konnekt_avatar_delete_owner on storage.objects for delete to authenticated using (bucket_id = 'konnekt-avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);

drop policy if exists konnekt_reel_read_owner on storage.objects;
create policy konnekt_reel_read_owner on storage.objects for select to authenticated using (bucket_id = 'konnekt-reels' and (storage.foldername(name))[1] = (select auth.uid())::text);
drop policy if exists konnekt_reel_insert_owner on storage.objects;
create policy konnekt_reel_insert_owner on storage.objects for insert to authenticated with check (bucket_id = 'konnekt-reels' and (storage.foldername(name))[1] = (select auth.uid())::text);
drop policy if exists konnekt_reel_update_owner on storage.objects;
create policy konnekt_reel_update_owner on storage.objects for update to authenticated using (bucket_id = 'konnekt-reels' and (storage.foldername(name))[1] = (select auth.uid())::text) with check (bucket_id = 'konnekt-reels' and (storage.foldername(name))[1] = (select auth.uid())::text);
drop policy if exists konnekt_reel_delete_owner on storage.objects;
create policy konnekt_reel_delete_owner on storage.objects for delete to authenticated using (bucket_id = 'konnekt-reels' and (storage.foldername(name))[1] = (select auth.uid())::text);

drop policy if exists konnekt_status_read_owner on storage.objects;
create policy konnekt_status_read_owner on storage.objects for select to authenticated using (bucket_id = 'konnekt-status' and (storage.foldername(name))[1] = (select auth.uid())::text);
drop policy if exists konnekt_status_insert_owner on storage.objects;
create policy konnekt_status_insert_owner on storage.objects for insert to authenticated with check (bucket_id = 'konnekt-status' and (storage.foldername(name))[1] = (select auth.uid())::text);
drop policy if exists konnekt_status_update_owner on storage.objects;
create policy konnekt_status_update_owner on storage.objects for update to authenticated using (bucket_id = 'konnekt-status' and (storage.foldername(name))[1] = (select auth.uid())::text) with check (bucket_id = 'konnekt-status' and (storage.foldername(name))[1] = (select auth.uid())::text);
drop policy if exists konnekt_status_delete_owner on storage.objects;
create policy konnekt_status_delete_owner on storage.objects for delete to authenticated using (bucket_id = 'konnekt-status' and (storage.foldername(name))[1] = (select auth.uid())::text);

-- New auth users receive a profile. SECURITY DEFINER is limited to this trigger.
create or replace function public.konnekt_create_profile_for_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'display_name', ''))
  on conflict (id) do nothing;
  return new;
end;
$$;
revoke all on function public.konnekt_create_profile_for_new_user() from public, anon, authenticated;
drop trigger if exists konnekt_auth_user_profile on auth.users;
create trigger konnekt_auth_user_profile after insert on auth.users
for each row execute procedure public.konnekt_create_profile_for_new_user();

-- IMPORTANT REMAINING SERVER WORK:
-- 1) Implement reviewed invite/group-member RPCs; clients cannot add other members directly.
-- 2) Configure trusted admin/moderator roles and server-only report review.
-- 3) Configure signed URL/media delivery and automatic status-object cleanup.
-- 4) Add rate limits, email/SMS provider settings, account deletion/export, POPIA notices/consent,
--    audit logs, backups, monitoring, and independent penetration/security review.
-- 5) Test with two accounts and verify negative access (User A must never read User B's private rows/files).
