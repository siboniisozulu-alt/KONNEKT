-- KONNEKT launch-readiness additions. Additive only: no existing rows are dropped or rewritten.
create extension if not exists pgcrypto;

-- Message attachments are encrypted client-side before upload.
alter table public.messages add column if not exists media_encrypted boolean not null default false;
alter table public.messages add column if not exists media_encryption_iv text;
alter table public.messages add column if not exists media_mime_type text;
alter table public.messages add column if not exists encryption_version integer not null default 1;

-- Per-member wrapped group keys. Only the addressed member can read their envelope.
create table if not exists public.group_key_envelopes (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  sender_id uuid not null references auth.users(id) on delete cascade,
  sender_public_key text not null,
  key_version integer not null default 1 check (key_version > 0),
  wrapped_key text not null,
  wrap_iv text not null,
  created_at timestamptz not null default now(),
  unique(conversation_id,user_id,key_version),
  check (sender_id <> user_id or sender_public_key <> '')
);
alter table public.group_key_envelopes enable row level security;
drop policy if exists "members read own group key envelopes" on public.group_key_envelopes;
create policy "members read own group key envelopes" on public.group_key_envelopes for select to authenticated
using (user_id = auth.uid() and public.is_konnekt_conversation_member(conversation_id));
drop policy if exists "group creator provisions group keys" on public.group_key_envelopes;
create policy "group creator provisions group keys" on public.group_key_envelopes for insert to authenticated
with check (sender_id = auth.uid() and user_id in (select cm.user_id from public.conversation_members cm where cm.conversation_id = group_key_envelopes.conversation_id)
  and exists(select 1 from public.conversations c where c.id = group_key_envelopes.conversation_id and c.created_by = auth.uid() and c.is_group));
grant select,insert on public.group_key_envelopes to authenticated;

-- User blocks. A block is private to the blocker and prevents direct chat/call initiation.
create table if not exists public.user_blocks (
  blocker_id uuid not null references auth.users(id) on delete cascade,
  blocked_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key(blocker_id,blocked_id),
  check(blocker_id <> blocked_id)
);
alter table public.user_blocks enable row level security;
drop policy if exists "users read own blocks" on public.user_blocks;
create policy "users read own blocks" on public.user_blocks for select to authenticated using(blocker_id = auth.uid());
drop policy if exists "users create own blocks" on public.user_blocks;
create policy "users create own blocks" on public.user_blocks for insert to authenticated with check(blocker_id = auth.uid());
drop policy if exists "users remove own blocks" on public.user_blocks;
create policy "users remove own blocks" on public.user_blocks for delete to authenticated using(blocker_id = auth.uid());
grant select,insert,delete on public.user_blocks to authenticated;

-- Reports are private to the reporter and approved moderators.
create table if not exists public.moderation_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  added_at timestamptz not null default now()
);
alter table public.moderation_admins enable row level security;
drop policy if exists "users can check own moderator status" on public.moderation_admins;
create policy "users can check own moderator status" on public.moderation_admins for select to authenticated using(user_id = auth.uid());
grant select on public.moderation_admins to authenticated;
create or replace function public.is_konnekt_moderator()
returns boolean language sql stable security definer set search_path = public, pg_temp as $$
  select exists(select 1 from public.moderation_admins where user_id = auth.uid());
$$;

create table if not exists public.user_reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references auth.users(id) on delete cascade,
  reported_user_id uuid references auth.users(id) on delete set null,
  content_id uuid,
  content_type text not null default 'user' check(content_type in ('user','post','comment','message','other')),
  reason text not null check(char_length(reason) between 3 and 100),
  details text not null default '' check(char_length(details) <= 2000),
  status text not null default 'open' check(status in ('open','reviewing','actioned','dismissed')),
  moderator_id uuid references auth.users(id) on delete set null,
  moderator_notes text not null default '',
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  check(reported_user_id is null or reported_user_id <> reporter_id)
);
create index if not exists user_reports_status_created_idx on public.user_reports(status,created_at desc);
alter table public.user_reports enable row level security;
drop policy if exists "reporters create reports" on public.user_reports;
create policy "reporters create reports" on public.user_reports for insert to authenticated
with check(reporter_id = auth.uid() and (reported_user_id is null or reported_user_id <> auth.uid()));
drop policy if exists "reporters and moderators read reports" on public.user_reports;
create policy "reporters and moderators read reports" on public.user_reports for select to authenticated
using(reporter_id = auth.uid() or public.is_konnekt_moderator());
drop policy if exists "moderators update reports" on public.user_reports;
create policy "moderators update reports" on public.user_reports for update to authenticated
using(public.is_konnekt_moderator()) with check(public.is_konnekt_moderator() and (moderator_id is null or moderator_id = auth.uid()));
grant select,insert,update on public.user_reports to authenticated;

-- Admin action log. Only moderators may read/append; users cannot alter moderation history.
create table if not exists public.moderation_actions (
  id uuid primary key default gen_random_uuid(),
  moderator_id uuid not null references auth.users(id) on delete restrict,
  target_user_id uuid references auth.users(id) on delete set null,
  report_id uuid references public.user_reports(id) on delete set null,
  action text not null check(action in ('warning','content_removed','temporary_restriction','account_suspended','account_restored','report_dismissed')),
  reason text not null default '' check(char_length(reason) <= 2000),
  created_at timestamptz not null default now()
);
alter table public.moderation_actions enable row level security;
drop policy if exists "moderators read moderation actions" on public.moderation_actions;
create policy "moderators read moderation actions" on public.moderation_actions for select to authenticated using(public.is_konnekt_moderator());
drop policy if exists "moderators append moderation actions" on public.moderation_actions;
create policy "moderators append moderation actions" on public.moderation_actions for insert to authenticated with check(moderator_id = auth.uid() and public.is_konnekt_moderator());
grant select,insert on public.moderation_actions to authenticated;

-- Hashtag indexing and a trending view based only on public posts.
create table if not exists public.post_hashtags (
  post_id uuid not null references public.posts(id) on delete cascade,
  hashtag text not null check(hashtag ~ '^[a-z0-9_]{1,40}$'),
  created_at timestamptz not null default now(),
  primary key(post_id,hashtag)
);
alter table public.post_hashtags enable row level security;
drop policy if exists "hashtags readable by authenticated" on public.post_hashtags;
create policy "hashtags readable by authenticated" on public.post_hashtags for select to authenticated using(true);
drop policy if exists "post owners manage hashtags" on public.post_hashtags;
create policy "post owners manage hashtags" on public.post_hashtags for all to authenticated
using(exists(select 1 from public.posts p where p.id=post_id and p.user_id=auth.uid()))
with check(exists(select 1 from public.posts p where p.id=post_id and p.user_id=auth.uid()));
grant select,insert,update,delete on public.post_hashtags to authenticated;
create or replace function public.konnekt_sync_post_hashtags()
returns trigger language plpgsql security invoker set search_path = public, pg_temp as $$
begin
  delete from public.post_hashtags where post_id = new.id;
  insert into public.post_hashtags(post_id,hashtag)
  select new.id, lower(match[1]) from regexp_matches(coalesce(new.caption,''), '#([a-zA-Z0-9_]{1,40})', 'g') as match
  on conflict do nothing;
  return new;
end; $$;
drop trigger if exists konnekt_post_hashtag_sync on public.posts;
create trigger konnekt_post_hashtag_sync after insert or update of caption on public.posts
for each row execute function public.konnekt_sync_post_hashtags();
insert into public.post_hashtags(post_id,hashtag)
select p.id, lower(match[1]) from public.posts p
cross join lateral regexp_matches(coalesce(p.caption,''), '#([a-zA-Z0-9_]{1,40})', 'g') as match
on conflict do nothing;

create or replace view public.konnekt_trending_hashtags as
select hashtag, count(*)::bigint as post_count, max(created_at) as latest_post_at
from public.post_hashtags where created_at > now() - interval '7 days'
group by hashtag order by post_count desc, latest_post_at desc;
grant select on public.konnekt_trending_hashtags to authenticated;

-- Basic creator analytics view; only aggregate public post engagement is exposed.
create or replace view public.konnekt_creator_analytics as
select p.user_id as creator_id, count(distinct p.id)::bigint as posts_count,
       coalesce(sum(l.like_count),0)::bigint as likes_count,
       coalesce(sum(c.comment_count),0)::bigint as comments_count,
       max(p.created_at) as latest_post_at
from public.posts p
left join (select post_id,count(*) like_count from public.post_likes group by post_id) l on l.post_id=p.id
left join (select post_id,count(*) comment_count from public.post_comments group by post_id) c on c.post_id=p.id
group by p.user_id;
grant select on public.konnekt_creator_analytics to authenticated;

-- Group call room signalling metadata. A real multi-party media bridge/SFU is still required for production group calls.
create table if not exists public.group_call_sessions (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  created_by uuid not null references auth.users(id) on delete cascade,
  call_type text not null check(call_type in ('voice','video')),
  status text not null default 'ringing' check(status in ('ringing','active','ended')),
  created_at timestamptz not null default now(), ended_at timestamptz,
  check(status <> 'ended' or ended_at is not null)
);
create table if not exists public.group_call_participants (
  call_id uuid not null references public.group_call_sessions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'invited' check(status in ('invited','joined','declined','left')),
  joined_at timestamptz,
  primary key(call_id,user_id)
);
create table if not exists public.group_call_signals (
  id uuid primary key default gen_random_uuid(), call_id uuid not null references public.group_call_sessions(id) on delete cascade,
  sender_id uuid not null references auth.users(id) on delete cascade,
  recipient_id uuid not null references auth.users(id) on delete cascade,
  signal_type text not null check(signal_type in ('offer','answer','ice-candidate','hangup')),
  payload jsonb not null default '{}'::jsonb, created_at timestamptz not null default now(),
  check(sender_id <> recipient_id)
);
create index if not exists group_call_signals_lookup_idx on public.group_call_signals(call_id,recipient_id,created_at);
alter table public.group_call_sessions enable row level security;
alter table public.group_call_participants enable row level security;
alter table public.group_call_signals enable row level security;
drop policy if exists "conversation members read group calls" on public.group_call_sessions;
create policy "conversation members read group calls" on public.group_call_sessions for select to authenticated using(public.is_konnekt_conversation_member(conversation_id));
drop policy if exists "conversation members create group calls" on public.group_call_sessions;
create policy "conversation members create group calls" on public.group_call_sessions for insert to authenticated with check(created_by=auth.uid() and public.is_konnekt_conversation_member(conversation_id));
drop policy if exists "participants update group calls" on public.group_call_sessions;
create policy "participants update group calls" on public.group_call_sessions for update to authenticated using(public.is_konnekt_conversation_member(conversation_id)) with check(public.is_konnekt_conversation_member(conversation_id));
drop policy if exists "group call participants read own room" on public.group_call_participants;
create policy "group call participants read own room" on public.group_call_participants for select to authenticated using(user_id=auth.uid() or exists(select 1 from public.group_call_sessions s where s.id=call_id and public.is_konnekt_conversation_member(s.conversation_id)));
drop policy if exists "group call participants invited by member" on public.group_call_participants;
create policy "group call participants invited by member" on public.group_call_participants for insert to authenticated with check(exists(select 1 from public.group_call_sessions s where s.id=call_id and s.created_by=auth.uid() and public.is_konnekt_conversation_member(s.conversation_id)));
drop policy if exists "users update own group call status" on public.group_call_participants;
create policy "users update own group call status" on public.group_call_participants for update to authenticated using(user_id=auth.uid()) with check(user_id=auth.uid());
drop policy if exists "call participants exchange group signals" on public.group_call_signals;
create policy "call participants exchange group signals" on public.group_call_signals for all to authenticated
using(sender_id=auth.uid() or recipient_id=auth.uid())
with check(sender_id=auth.uid() and exists(select 1 from public.group_call_participants p where p.call_id=call_id and p.user_id=auth.uid()) and exists(select 1 from public.group_call_participants p where p.call_id=call_id and p.user_id=recipient_id));
grant select,insert,update on public.group_call_sessions to authenticated;
grant select,insert,update on public.group_call_participants to authenticated;
grant select,insert on public.group_call_signals to authenticated;

-- Prevent direct messages when either participant has blocked the other.
drop policy if exists "members send messages" on public.messages;
create policy "members send messages" on public.messages for insert to authenticated
with check(sender_id=auth.uid() and public.is_konnekt_conversation_member(conversation_id)
  and not exists (
    select 1 from public.conversation_members cm
    join public.conversations c on c.id=cm.conversation_id
    where cm.conversation_id=messages.conversation_id and cm.user_id<>auth.uid() and not c.is_group
      and (exists(select 1 from public.user_blocks b where b.blocker_id=auth.uid() and b.blocked_id=cm.user_id)
        or exists(select 1 from public.user_blocks b where b.blocker_id=cm.user_id and b.blocked_id=auth.uid()))
  ));

-- Simple server-side anti-spam limits on high-volume actions. These are guardrails, not full abuse detection.
create table if not exists public.konnekt_rate_events (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  event_type text not null,
  created_at timestamptz not null default now()
);
create index if not exists konnekt_rate_events_user_type_time_idx on public.konnekt_rate_events(user_id,event_type,created_at desc);
alter table public.konnekt_rate_events enable row level security;
revoke all on public.konnekt_rate_events from anon,authenticated;
create or replace function public.konnekt_rate_guard()
returns trigger language plpgsql security definer set search_path = public, pg_temp as $$
declare uid uuid; kind text; max_count integer; window_seconds integer; recent_count integer;
begin
  uid := auth.uid();
  if uid is null then return new; end if;
  if tg_table_name='messages' then kind:='message'; max_count:=40; window_seconds:=60;
  elsif tg_table_name='posts' then kind:='post'; max_count:=12; window_seconds:=3600;
  elsif tg_table_name='user_reports' then kind:='report'; max_count:=5; window_seconds:=3600;
  else return new; end if;
  select count(*) into recent_count from public.konnekt_rate_events
    where user_id=uid and event_type=kind and created_at > now() - make_interval(secs=>window_seconds);
  if recent_count >= max_count then raise exception 'KONNEKT rate limit reached. Please wait before trying again.'; end if;
  insert into public.konnekt_rate_events(user_id,event_type) values(uid,kind);
  return new;
end; $$;
drop trigger if exists konnekt_rate_messages on public.messages;
create trigger konnekt_rate_messages before insert on public.messages for each row execute function public.konnekt_rate_guard();
drop trigger if exists konnekt_rate_posts on public.posts;
create trigger konnekt_rate_posts before insert on public.posts for each row execute function public.konnekt_rate_guard();
drop trigger if exists konnekt_rate_reports on public.user_reports;
create trigger konnekt_rate_reports before insert on public.user_reports for each row execute function public.konnekt_rate_guard();

-- Keep new tables in Realtime where supported; duplicate publication entries are harmless.
do $$ begin alter publication supabase_realtime add table public.group_key_envelopes; exception when duplicate_object then null; when undefined_object then null; end $$;
do $$ begin alter publication supabase_realtime add table public.group_call_sessions; exception when duplicate_object then null; when undefined_object then null; end $$;
do $$ begin alter publication supabase_realtime add table public.group_call_participants; exception when duplicate_object then null; when undefined_object then null; end $$;


-- Notify invited group members in-app. Push delivery remains dependent on a configured push provider.
create or replace function public.konnekt_notify_group_call_invite()
returns trigger language plpgsql security definer set search_path = public, pg_temp as $$
declare group_title text;
begin
  if new.status = 'invited' then
    select c.title into group_title from public.group_call_sessions s join public.conversations c on c.id=s.conversation_id where s.id=new.call_id;
    insert into public.notifications(recipient_id,actor_id,type,body,reference_id)
    select new.user_id, s.created_by, 'group_call', coalesce(group_title,'KONNEKT group') || ' invited you to a group call', new.call_id
    from public.group_call_sessions s where s.id=new.call_id;
  end if;
  return new;
end; $$;
drop trigger if exists konnekt_group_call_invite_notification on public.group_call_participants;
create trigger konnekt_group_call_invite_notification after insert on public.group_call_participants
for each row execute function public.konnekt_notify_group_call_invite();
do $$ begin alter publication supabase_realtime add table public.group_call_signals; exception when duplicate_object then null; when undefined_object then null; end $$;

-- Shared block check for direct conversation and call creation.
create or replace function public.konnekt_is_direct_blocked(user_a uuid, user_b uuid)
returns boolean language sql stable security definer set search_path = public, pg_temp as $$
  select case when auth.uid() is null or auth.uid() not in (user_a,user_b) then false
    else exists(select 1 from public.user_blocks where (blocker_id=user_a and blocked_id=user_b) or (blocker_id=user_b and blocked_id=user_a)) end;
$$;
revoke all on function public.konnekt_is_direct_blocked(uuid,uuid) from public;
grant execute on function public.konnekt_is_direct_blocked(uuid,uuid) to authenticated;
create or replace function public.konnekt_guard_direct_call()
returns trigger language plpgsql security definer set search_path = public, pg_temp as $$
begin
  if public.konnekt_is_direct_blocked(new.caller_id,new.callee_id) then
    raise exception 'This call cannot be started because one of the accounts has blocked the other.';
  end if;
  return new;
end; $$;
drop trigger if exists konnekt_guard_direct_call on public.call_sessions;
create trigger konnekt_guard_direct_call before insert on public.call_sessions for each row execute function public.konnekt_guard_direct_call();

-- Notifications contain no private message body or attachment data.
create or replace function public.konnekt_notify_new_message()
returns trigger language plpgsql security definer set search_path = public, pg_temp as $$
begin
  insert into public.notifications(recipient_id,actor_id,type,body,reference_id)
  select cm.user_id,new.sender_id,'message','You received a new message',new.conversation_id
  from public.conversation_members cm where cm.conversation_id=new.conversation_id and cm.user_id<>new.sender_id;
  return new;
end; $$;
drop trigger if exists konnekt_notify_message on public.messages;
create trigger konnekt_notify_message after insert on public.messages for each row execute function public.konnekt_notify_new_message();

create or replace function public.konnekt_notify_follow()
returns trigger language plpgsql security definer set search_path = public, pg_temp as $$
begin
  insert into public.notifications(recipient_id,actor_id,type,body,reference_id)
  values(new.followed_id,new.follower_id,'follow','Someone started following you',new.follower_id);
  return new;
end; $$;
drop trigger if exists konnekt_notify_follow on public.follows;
create trigger konnekt_notify_follow after insert on public.follows for each row execute function public.konnekt_notify_follow();

create or replace function public.konnekt_notify_post_like()
returns trigger language plpgsql security definer set search_path = public, pg_temp as $$
declare owner_id uuid;
begin
  select user_id into owner_id from public.posts where id=new.post_id;
  if owner_id is not null and owner_id<>new.user_id then
    insert into public.notifications(recipient_id,actor_id,type,body,reference_id)
    values(owner_id,new.user_id,'like','Someone liked your post',new.post_id);
  end if;
  return new;
end; $$;
drop trigger if exists konnekt_notify_like on public.post_likes;
create trigger konnekt_notify_like after insert on public.post_likes for each row execute function public.konnekt_notify_post_like();

create or replace function public.konnekt_notify_post_comment()
returns trigger language plpgsql security definer set search_path = public, pg_temp as $$
declare owner_id uuid;
begin
  select user_id into owner_id from public.posts where id=new.post_id;
  if owner_id is not null and owner_id<>new.user_id then
    insert into public.notifications(recipient_id,actor_id,type,body,reference_id)
    values(owner_id,new.user_id,'comment','Someone commented on your post',new.post_id);
  end if;
  return new;
end; $$;
drop trigger if exists konnekt_notify_comment on public.post_comments;
create trigger konnekt_notify_comment after insert on public.post_comments for each row execute function public.konnekt_notify_post_comment();

-- Extend the rate guard to comments and follow bursts.
create or replace function public.konnekt_rate_guard()
returns trigger language plpgsql security definer set search_path = public, pg_temp as $$
declare uid uuid; kind text; max_count integer; window_seconds integer; recent_count integer;
begin
  uid := auth.uid();
  if uid is null then return new; end if;
  if tg_table_name='messages' then kind:='message'; max_count:=40; window_seconds:=60;
  elsif tg_table_name='posts' then kind:='post'; max_count:=12; window_seconds:=3600;
  elsif tg_table_name='user_reports' then kind:='report'; max_count:=5; window_seconds:=3600;
  elsif tg_table_name='post_comments' then kind:='comment'; max_count:=20; window_seconds:=60;
  elsif tg_table_name='follows' then kind:='follow'; max_count:=30; window_seconds:=3600;
  else return new; end if;
  select count(*) into recent_count from public.konnekt_rate_events
    where user_id=uid and event_type=kind and created_at > now() - make_interval(secs=>window_seconds);
  if recent_count >= max_count then raise exception 'KONNEKT rate limit reached. Please wait before trying again.'; end if;
  insert into public.konnekt_rate_events(user_id,event_type) values(uid,kind);
  return new;
end; $$;
drop trigger if exists konnekt_rate_comments on public.post_comments;
create trigger konnekt_rate_comments before insert on public.post_comments for each row execute function public.konnekt_rate_guard();
drop trigger if exists konnekt_rate_follows on public.follows;
create trigger konnekt_rate_follows before insert on public.follows for each row execute function public.konnekt_rate_guard();

-- Unique account views for creator analytics (one counted view per account per post).
create table if not exists public.post_views (
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  viewed_at timestamptz not null default now(),
  primary key(post_id,user_id)
);
create index if not exists post_views_user_viewed_idx on public.post_views(user_id,viewed_at desc);
alter table public.post_views enable row level security;
drop policy if exists "users record own post views" on public.post_views;
create policy "users record own post views" on public.post_views for insert to authenticated with check(user_id=auth.uid());
drop policy if exists "creators read own post views" on public.post_views;
create policy "creators read own post views" on public.post_views for select to authenticated using(exists(select 1 from public.posts p where p.id=post_id and p.user_id=auth.uid()));
grant select,insert on public.post_views to authenticated;
