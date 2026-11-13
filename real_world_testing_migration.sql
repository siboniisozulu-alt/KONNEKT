-- KONNEKT real-world testing migration v1
-- Apply AFTER supabase_staging_schema.sql to a DEDICATED STAGING project.
-- Review with a qualified security engineer before any public/production deployment.

-- Allow the browser app to start a direct conversation by username without being able
-- to add arbitrary members through direct table writes.
create or replace function public.konnekt_start_direct_conversation(target_username text)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor uuid := (select auth.uid());
  target uuid;
  existing_id uuid;
  new_id uuid;
begin
  if actor is null then raise exception 'Authentication required'; end if;
  if target_username is null or length(trim(target_username)) < 3 then
    raise exception 'Enter a valid username';
  end if;
  select p.id into target from public.profiles p
    where lower(p.username) = lower(regexp_replace(trim(target_username), '^@', ''));
  if target is null then raise exception 'KONNEKT user not found'; end if;
  if target = actor then raise exception 'You cannot start a chat with yourself'; end if;
  if public.konnekt_is_blocked_pair(target) then raise exception 'This user cannot be contacted'; end if;

  select c.id into existing_id
  from public.conversations c
  where c.is_group = false
    and exists (select 1 from public.conversation_members m where m.conversation_id=c.id and m.user_id=actor)
    and exists (select 1 from public.conversation_members m where m.conversation_id=c.id and m.user_id=target)
    and (select count(*) from public.conversation_members m where m.conversation_id=c.id) = 2
  order by c.created_at desc limit 1;
  if existing_id is not null then return existing_id; end if;

  insert into public.conversations(created_by, is_group) values(actor, false) returning id into new_id;
  insert into public.conversation_members(conversation_id,user_id)
    values(new_id,actor),(new_id,target);
  return new_id;
end;
$$;
revoke all on function public.konnekt_start_direct_conversation(text) from public, anon;
grant execute on function public.konnekt_start_direct_conversation(text) to authenticated;

-- Notifications are minimal in-app events. Push delivery needs a separately configured
-- trusted provider and must never expose provider secrets in the browser.
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  actor_id uuid references auth.users(id) on delete set null,
  kind text not null check (kind in ('message','follow','reel_comment','system')),
  title text not null check (char_length(title) between 1 and 120),
  body text not null default '' check (char_length(body) <= 500),
  data jsonb not null default '{}'::jsonb,
  read_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists notifications_user_created_idx on public.notifications(user_id, created_at desc);
alter table public.notifications enable row level security;
grant select, update on public.notifications to authenticated;
drop policy if exists notifications_read_self on public.notifications;
create policy notifications_read_self on public.notifications for select to authenticated
  using (user_id = (select auth.uid()));
drop policy if exists notifications_update_self on public.notifications;
create policy notifications_update_self on public.notifications for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

-- User consent and basic device registration metadata (no push secrets stored here).
create table if not exists public.user_consents (
  user_id uuid primary key references auth.users(id) on delete cascade,
  terms_version text not null,
  privacy_version text not null,
  accepted_at timestamptz not null default now(),
  marketing_opt_in boolean not null default false
);
alter table public.user_consents enable row level security;
grant select, insert, update on public.user_consents to authenticated;
drop policy if exists user_consents_self on public.user_consents;
create policy user_consents_self on public.user_consents for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

-- Device token rows hold an opaque provider subscription reference only. Do not put
-- VAPID private keys or provider API keys in this table or in the client.
create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  endpoint text not null,
  subscription jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, endpoint)
);
alter table public.push_subscriptions enable row level security;
grant select, insert, update, delete on public.push_subscriptions to authenticated;
drop policy if exists push_subscriptions_self on public.push_subscriptions;
create policy push_subscriptions_self on public.push_subscriptions for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

-- Ensure realtime can publish chat and notification changes. If publication is absent
-- on a hosted plan, enable these tables manually in Supabase Dashboard -> Database -> Publications.
do $$ begin
  alter publication supabase_realtime add table public.messages;
exception when duplicate_object then null;
when undefined_object then raise notice 'supabase_realtime publication not found; enable tables manually';
end $$;
do $$ begin
  alter publication supabase_realtime add table public.notifications;
exception when duplicate_object then null;
when undefined_object then raise notice 'supabase_realtime publication not found; enable tables manually';
end $$;

-- Trigger: notify other members after a new message. The function is trusted and only
-- inserts notifications for actual conversation members other than the sender.
create or replace function public.konnekt_notify_message_members()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.notifications(user_id, actor_id, kind, title, body, data)
  select cm.user_id, new.sender_id, 'message', 'New message', left(new.body, 160),
         jsonb_build_object('conversation_id', new.conversation_id, 'message_id', new.id)
  from public.conversation_members cm
  where cm.conversation_id = new.conversation_id and cm.user_id <> new.sender_id;
  return new;
end;
$$;
revoke all on function public.konnekt_notify_message_members() from public, anon, authenticated;
drop trigger if exists konnekt_message_notification on public.messages;
create trigger konnekt_message_notification after insert on public.messages
for each row execute function public.konnekt_notify_message_members();

-- Storage limits are enforced in the app and should also be configured in Dashboard.
-- Buckets created in the base schema are private. Signed URLs must be short-lived.

-- Server-only moderation metadata. Clients cannot update these columns because reports
-- have no UPDATE policy; only the trusted moderation Edge Function uses service_role.
alter table public.reports add column if not exists status text not null default 'open'
  check (status in ('open','reviewing','actioned','dismissed'));
alter table public.reports add column if not exists moderator_notes text not null default '';
alter table public.reports add column if not exists reviewed_by uuid references auth.users(id) on delete set null;
alter table public.reports add column if not exists reviewed_at timestamptz;

-- Make stored media readable only when its corresponding content is visible.
-- This replaces the owner-only SELECT rules from the starter schema while preserving
-- owner upload/update/delete controls.
drop policy if exists konnekt_avatar_read_owner on storage.objects;
create policy konnekt_avatar_read_visible on storage.objects for select to authenticated using (
  bucket_id = 'konnekt-avatars' and (
    (storage.foldername(name))[1] = (select auth.uid())::text
    or exists (select 1 from public.profiles p where p.avatar_path = name)
  )
);
drop policy if exists konnekt_reel_read_owner on storage.objects;
create policy konnekt_reel_read_visible on storage.objects for select to authenticated using (
  bucket_id = 'konnekt-reels' and (
    (storage.foldername(name))[1] = (select auth.uid())::text
    or exists (select 1 from public.reels r where r.media_path = name and r.deleted_at is null
      and r.published_at is not null and (r.visibility = 'public'
        or (r.visibility = 'followers' and exists (select 1 from public.follows f where f.follower_id=(select auth.uid()) and f.followed_id=r.user_id))
      ) and not public.konnekt_is_blocked_pair(r.user_id))
  )
);
drop policy if exists konnekt_status_read_owner on storage.objects;
create policy konnekt_status_read_visible on storage.objects for select to authenticated using (
  bucket_id = 'konnekt-status' and (
    (storage.foldername(name))[1] = (select auth.uid())::text
    or exists (select 1 from public.statuses s where s.media_path = name and s.expires_at > now()
      and (s.user_id = (select auth.uid()) or exists (select 1 from public.follows f where f.follower_id=(select auth.uid()) and f.followed_id=s.user_id))
      and not public.konnekt_is_blocked_pair(s.user_id))
  )
);

-- Username matching for direct chats must be case-insensitive and unambiguous.
create unique index if not exists profiles_username_lower_unique
  on public.profiles (lower(username)) where username is not null;

-- A status is no longer readable through media storage after its expiry, even by its owner.
drop policy if exists konnekt_status_read_visible on storage.objects;
create policy konnekt_status_read_visible on storage.objects for select to authenticated using (
  bucket_id = 'konnekt-status' and exists (
    select 1 from public.statuses s where s.media_path = name and s.expires_at > now()
      and not public.konnekt_is_blocked_pair(s.user_id)
      and (s.user_id = (select auth.uid()) or exists (
        select 1 from public.follows f where f.follower_id=(select auth.uid()) and f.followed_id=s.user_id
      ))
  )
);

-- Enforce server-side file size and MIME restrictions at the storage service layer.
update storage.buckets set file_size_limit = 5242880,
  allowed_mime_types = array['image/jpeg','image/png','image/webp','image/gif']
where id = 'konnekt-avatars';
update storage.buckets set file_size_limit = 104857600,
  allowed_mime_types = array['video/mp4','video/webm','video/quicktime']
where id = 'konnekt-reels';
update storage.buckets set file_size_limit = 104857600,
  allowed_mime_types = array['image/jpeg','image/png','image/webp','image/gif','video/mp4','video/webm','video/quicktime']
where id = 'konnekt-status';

-- A blocked conversation remains in history, but no new message may be sent while any
-- other participant is in a block relationship with the sender.
drop policy if exists messages_insert_as_self_member on public.messages;
create policy messages_insert_as_self_member on public.messages for insert to authenticated with check (
  sender_id = (select auth.uid())
  and public.konnekt_is_member(conversation_id)
  and not exists (
    select 1 from public.conversation_members cm
    where cm.conversation_id = messages.conversation_id
      and cm.user_id <> (select auth.uid())
      and public.konnekt_is_blocked_pair(cm.user_id)
  )
);

-- Align identity foreign keys to profiles so PostgREST can safely embed profile data
-- (e.g. conversation_members -> profiles, reels -> profiles, statuses -> profiles).
-- This also upgrades an earlier staging schema whose user FKs pointed directly to auth.users.
insert into public.profiles(id,display_name)
select u.id, coalesce(u.raw_user_meta_data ->> 'display_name','') from auth.users u
on conflict (id) do nothing;

alter table public.follows drop constraint if exists follows_follower_id_fkey;
alter table public.follows add constraint follows_follower_id_fkey foreign key (follower_id) references public.profiles(id) on delete cascade;
alter table public.follows drop constraint if exists follows_followed_id_fkey;
alter table public.follows add constraint follows_followed_id_fkey foreign key (followed_id) references public.profiles(id) on delete cascade;
alter table public.blocked_users drop constraint if exists blocked_users_blocker_id_fkey;
alter table public.blocked_users add constraint blocked_users_blocker_id_fkey foreign key (blocker_id) references public.profiles(id) on delete cascade;
alter table public.blocked_users drop constraint if exists blocked_users_blocked_id_fkey;
alter table public.blocked_users add constraint blocked_users_blocked_id_fkey foreign key (blocked_id) references public.profiles(id) on delete cascade;
alter table public.conversations drop constraint if exists conversations_created_by_fkey;
alter table public.conversations add constraint conversations_created_by_fkey foreign key (created_by) references public.profiles(id) on delete restrict;
alter table public.conversation_members drop constraint if exists conversation_members_user_id_fkey;
alter table public.conversation_members add constraint conversation_members_user_id_fkey foreign key (user_id) references public.profiles(id) on delete cascade;
alter table public.messages drop constraint if exists messages_sender_id_fkey;
alter table public.messages add constraint messages_sender_id_fkey foreign key (sender_id) references public.profiles(id) on delete restrict;
alter table public.reels drop constraint if exists reels_user_id_fkey;
alter table public.reels add constraint reels_user_id_fkey foreign key (user_id) references public.profiles(id) on delete cascade;
alter table public.reel_likes drop constraint if exists reel_likes_user_id_fkey;
alter table public.reel_likes add constraint reel_likes_user_id_fkey foreign key (user_id) references public.profiles(id) on delete cascade;
alter table public.reel_comments drop constraint if exists reel_comments_user_id_fkey;
alter table public.reel_comments add constraint reel_comments_user_id_fkey foreign key (user_id) references public.profiles(id) on delete cascade;
alter table public.statuses drop constraint if exists statuses_user_id_fkey;
alter table public.statuses add constraint statuses_user_id_fkey foreign key (user_id) references public.profiles(id) on delete cascade;
alter table public.reports drop constraint if exists reports_reporter_id_fkey;
alter table public.reports add constraint reports_reporter_id_fkey foreign key (reporter_id) references public.profiles(id) on delete cascade;
alter table public.reports drop constraint if exists reports_target_user_id_fkey;
alter table public.reports add constraint reports_target_user_id_fkey foreign key (target_user_id) references public.profiles(id) on delete cascade;
alter table public.reports drop constraint if exists reports_target_reel_id_fkey;
alter table public.reports add constraint reports_target_reel_id_fkey foreign key (target_reel_id) references public.reels(id) on delete cascade;
alter table public.reports drop constraint if exists reports_target_message_id_fkey;
alter table public.reports add constraint reports_target_message_id_fkey foreign key (target_message_id) references public.messages(id) on delete cascade;
alter table public.reports drop constraint if exists reports_reviewed_by_fkey;
alter table public.reports add constraint reports_reviewed_by_fkey foreign key (reviewed_by) references public.profiles(id) on delete set null;
alter table public.notifications drop constraint if exists notifications_user_id_fkey;
alter table public.notifications add constraint notifications_user_id_fkey foreign key (user_id) references public.profiles(id) on delete cascade;
alter table public.notifications drop constraint if exists notifications_actor_id_fkey;
alter table public.notifications add constraint notifications_actor_id_fkey foreign key (actor_id) references public.profiles(id) on delete set null;
alter table public.user_consents drop constraint if exists user_consents_user_id_fkey;
alter table public.user_consents add constraint user_consents_user_id_fkey foreign key (user_id) references public.profiles(id) on delete cascade;
alter table public.push_subscriptions drop constraint if exists push_subscriptions_user_id_fkey;
alter table public.push_subscriptions add constraint push_subscriptions_user_id_fkey foreign key (user_id) references public.profiles(id) on delete cascade;

-- Keep Status expiry within the intended 24-hour window on updates as well as inserts.
drop policy if exists statuses_update_self on public.statuses;
create policy statuses_update_self on public.statuses for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()) and expires_at > now() and expires_at <= now() + interval '24 hours');
