-- KONNEKT complete social backend schema (Supabase Free-compatible).
-- Run this whole script in Supabase SQL Editor. Safe to re-run.
create extension if not exists pgcrypto;

-- Profiles
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
  values (new.id, nullif(lower(new.raw_user_meta_data ->> 'username'), ''), coalesce(new.raw_user_meta_data ->> 'full_name', ''), nullif(new.raw_user_meta_data ->> 'phone', ''))
  on conflict (id) do nothing;
  return new;
end; $$;
drop trigger if exists on_konnekt_auth_user_created on auth.users;
create trigger on_konnekt_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_konnekt_user();

-- Private conversations and messages
create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(), title text, is_group boolean not null default false,
  created_by uuid not null references auth.users(id) on delete cascade, created_at timestamptz not null default now()
);
create table if not exists public.conversation_members (
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  joined_at timestamptz not null default now(), primary key (conversation_id,user_id)
);
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(), conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references auth.users(id) on delete cascade, body text not null default '',
  media_path text, media_type text check (media_type is null or media_type in ('image','video','audio','file')),
  created_at timestamptz not null default now(), edited_at timestamptz,
  constraint messages_body_or_media check (char_length(body) <= 10000 and (char_length(body) > 0 or media_path is not null))
);
alter table public.messages add column if not exists media_path text;
alter table public.messages add column if not exists media_type text;
alter table public.messages alter column body set default '';
alter table public.messages drop constraint if exists messages_body_or_media;
alter table public.messages add constraint messages_body_or_media check (char_length(body) <= 10000 and (char_length(body) > 0 or media_path is not null));
create index if not exists messages_conversation_created_idx on public.messages(conversation_id,created_at desc);
create index if not exists conversation_members_user_idx on public.conversation_members(user_id);

create or replace function public.is_konnekt_conversation_member(target_conversation uuid)
returns boolean language sql stable security definer set search_path = public, pg_temp as $$
  select exists(select 1 from public.conversation_members cm where cm.conversation_id=target_conversation and cm.user_id=auth.uid());
$$;

-- 24-hour statuses
create table if not exists public.statuses (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  text_content text, media_url text, media_type text not null default 'text' check(media_type in ('text','image','video')),
  expires_at timestamptz not null default (now()+interval '24 hours'), created_at timestamptz not null default now(),
  constraint statuses_content_present check (nullif(text_content,'') is not null or media_url is not null)
);
create index if not exists statuses_expiry_idx on public.statuses(expires_at desc);

-- Reels / posts, likes and comments
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  caption text not null default '', media_url text not null, media_type text not null check(media_type in ('image','video')),
  created_at timestamptz not null default now()
);
create table if not exists public.post_likes (
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(), primary key(post_id,user_id)
);
create table if not exists public.post_comments (
  id uuid primary key default gen_random_uuid(), post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade, body text not null check(char_length(body) between 1 and 2000),
  created_at timestamptz not null default now()
);
create index if not exists posts_created_idx on public.posts(created_at desc);
create index if not exists post_comments_post_idx on public.post_comments(post_id,created_at);

-- Follow graph
create table if not exists public.follows (
  follower_id uuid not null references auth.users(id) on delete cascade,
  followed_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(), primary key(follower_id,followed_id),
  constraint follows_no_self check(follower_id <> followed_id)
);

-- In-app notifications (works while the app is open; browser push needs a push service later)
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(), recipient_id uuid not null references auth.users(id) on delete cascade,
  actor_id uuid references auth.users(id) on delete set null, type text not null,
  body text not null default '', reference_id uuid, read_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists notifications_recipient_created_idx on public.notifications(recipient_id,created_at desc);

-- Live room metadata and persistent live chat. Video transport needs a streaming provider / SFU.
create table if not exists public.live_streams (
  id uuid primary key default gen_random_uuid(), host_id uuid not null references auth.users(id) on delete cascade,
  title text not null, category text not null default 'Other', audience text not null default 'Everyone',
  status text not null default 'live' check(status in ('live','ended')),
  provider text not null default 'not_configured', provider_room_id text,
  started_at timestamptz not null default now(), ended_at timestamptz
);
create table if not exists public.live_stream_comments (
  id uuid primary key default gen_random_uuid(), stream_id uuid not null references public.live_streams(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade, body text not null check(char_length(body) between 1 and 500),
  created_at timestamptz not null default now()
);

-- Enable RLS on every user-data table
alter table public.profiles enable row level security;
alter table public.conversations enable row level security;
alter table public.conversation_members enable row level security;
alter table public.messages enable row level security;
alter table public.statuses enable row level security;
alter table public.posts enable row level security;
alter table public.post_likes enable row level security;
alter table public.post_comments enable row level security;
alter table public.follows enable row level security;
alter table public.notifications enable row level security;
alter table public.live_streams enable row level security;
alter table public.live_stream_comments enable row level security;

-- Profiles
 drop policy if exists "profiles readable by authenticated" on public.profiles;
create policy "profiles readable by authenticated" on public.profiles for select to authenticated using(true);
drop policy if exists "profile owner inserts own row" on public.profiles;
create policy "profile owner inserts own row" on public.profiles for insert to authenticated with check(auth.uid()=id);
drop policy if exists "profile owner updates own row" on public.profiles;
create policy "profile owner updates own row" on public.profiles for update to authenticated using(auth.uid()=id) with check(auth.uid()=id);

-- Conversation membership and private messages
 drop policy if exists "members see own memberships" on public.conversation_members;
create policy "members see own memberships" on public.conversation_members for select to authenticated using(user_id=auth.uid() or public.is_konnekt_conversation_member(conversation_id));
drop policy if exists "creator adds conversation" on public.conversations;
create policy "creator adds conversation" on public.conversations for insert to authenticated with check(created_by=auth.uid());
drop policy if exists "members read conversations" on public.conversations;
create policy "members read conversations" on public.conversations for select to authenticated using(public.is_konnekt_conversation_member(id));
drop policy if exists "conversation creator adds members" on public.conversation_members;
create policy "conversation creator adds members" on public.conversation_members for insert to authenticated with check(exists(select 1 from public.conversations c where c.id=conversation_id and c.created_by=auth.uid()));
drop policy if exists "members read messages" on public.messages;
create policy "members read messages" on public.messages for select to authenticated using(public.is_konnekt_conversation_member(conversation_id));
drop policy if exists "members send messages" on public.messages;
create policy "members send messages" on public.messages for insert to authenticated with check(sender_id=auth.uid() and public.is_konnekt_conversation_member(conversation_id));
drop policy if exists "sender edits own messages" on public.messages;
create policy "sender edits own messages" on public.messages for update to authenticated using(sender_id=auth.uid()) with check(sender_id=auth.uid() and public.is_konnekt_conversation_member(conversation_id));
drop policy if exists "sender deletes own messages" on public.messages;
create policy "sender deletes own messages" on public.messages for delete to authenticated using(sender_id=auth.uid() and public.is_konnekt_conversation_member(conversation_id));

-- Statuses
 drop policy if exists "authenticated users view active statuses" on public.statuses;
create policy "authenticated users view active statuses" on public.statuses for select to authenticated using(expires_at>now());
drop policy if exists "users create own statuses" on public.statuses;
create policy "users create own statuses" on public.statuses for insert to authenticated with check(user_id=auth.uid());
drop policy if exists "users delete own statuses" on public.statuses;
create policy "users delete own statuses" on public.statuses for delete to authenticated using(user_id=auth.uid());

-- Public posts, likes, comments, follows
 drop policy if exists "authenticated users view posts" on public.posts;
create policy "authenticated users view posts" on public.posts for select to authenticated using(true);
drop policy if exists "users create own posts" on public.posts;
create policy "users create own posts" on public.posts for insert to authenticated with check(user_id=auth.uid());
drop policy if exists "users update own posts" on public.posts;
create policy "users update own posts" on public.posts for update to authenticated using(user_id=auth.uid()) with check(user_id=auth.uid());
drop policy if exists "users delete own posts" on public.posts;
create policy "users delete own posts" on public.posts for delete to authenticated using(user_id=auth.uid());
drop policy if exists "likes visible to authenticated" on public.post_likes;
create policy "likes visible to authenticated" on public.post_likes for select to authenticated using(true);
drop policy if exists "users like as themselves" on public.post_likes;
create policy "users like as themselves" on public.post_likes for insert to authenticated with check(user_id=auth.uid());
drop policy if exists "users remove own likes" on public.post_likes;
create policy "users remove own likes" on public.post_likes for delete to authenticated using(user_id=auth.uid());
drop policy if exists "comments visible to authenticated" on public.post_comments;
create policy "comments visible to authenticated" on public.post_comments for select to authenticated using(true);
drop policy if exists "users comment as themselves" on public.post_comments;
create policy "users comment as themselves" on public.post_comments for insert to authenticated with check(user_id=auth.uid());
drop policy if exists "users delete own comments" on public.post_comments;
create policy "users delete own comments" on public.post_comments for delete to authenticated using(user_id=auth.uid());
drop policy if exists "follows visible to authenticated" on public.follows;
create policy "follows visible to authenticated" on public.follows for select to authenticated using(true);
drop policy if exists "users follow as themselves" on public.follows;
create policy "users follow as themselves" on public.follows for insert to authenticated with check(follower_id=auth.uid());
drop policy if exists "users unfollow as themselves" on public.follows;
create policy "users unfollow as themselves" on public.follows for delete to authenticated using(follower_id=auth.uid());

-- Notifications
 drop policy if exists "users read own notifications" on public.notifications;
create policy "users read own notifications" on public.notifications for select to authenticated using(recipient_id=auth.uid());
drop policy if exists "users mark own notifications" on public.notifications;
create policy "users mark own notifications" on public.notifications for update to authenticated using(recipient_id=auth.uid()) with check(recipient_id=auth.uid());

-- Live room metadata/chat (video itself is not transported by Supabase)
drop policy if exists "authenticated users view live rooms" on public.live_streams;
create policy "authenticated users view live rooms" on public.live_streams for select to authenticated using(status='live' or host_id=auth.uid());
drop policy if exists "hosts create own live rooms" on public.live_streams;
create policy "hosts create own live rooms" on public.live_streams for insert to authenticated with check(host_id=auth.uid());
drop policy if exists "hosts update own live rooms" on public.live_streams;
create policy "hosts update own live rooms" on public.live_streams for update to authenticated using(host_id=auth.uid()) with check(host_id=auth.uid());
drop policy if exists "live chat visible to members" on public.live_stream_comments;
create policy "live chat visible to members" on public.live_stream_comments for select to authenticated using(exists(select 1 from public.live_streams s where s.id=stream_id and s.status='live'));
drop policy if exists "signed in users send live chat" on public.live_stream_comments;
create policy "signed in users send live chat" on public.live_stream_comments for insert to authenticated with check(user_id=auth.uid() and exists(select 1 from public.live_streams s where s.id=stream_id and s.status='live'));

-- Trigger notifications for new messages, likes and comments
create or replace function public.konnekt_notify_message()
returns trigger language plpgsql security definer set search_path=public,pg_temp as $$
begin
  insert into public.notifications(recipient_id,actor_id,type,body,reference_id)
  select cm.user_id,new.sender_id,'message','You received a new message.',new.conversation_id
  from public.conversation_members cm where cm.conversation_id=new.conversation_id and cm.user_id<>new.sender_id;
  return new;
end; $$;
drop trigger if exists konnekt_message_notification on public.messages;
create trigger konnekt_message_notification after insert on public.messages for each row execute procedure public.konnekt_notify_message();

create or replace function public.konnekt_notify_like()
returns trigger language plpgsql security definer set search_path=public,pg_temp as $$
declare owner_id uuid;
begin
  select user_id into owner_id from public.posts where id=new.post_id;
  if owner_id is not null and owner_id<>new.user_id then
    insert into public.notifications(recipient_id,actor_id,type,body,reference_id) values(owner_id,new.user_id,'like','Someone liked your post.',new.post_id);
  end if;
  return new;
end; $$;
drop trigger if exists konnekt_like_notification on public.post_likes;
create trigger konnekt_like_notification after insert on public.post_likes for each row execute procedure public.konnekt_notify_like();

create or replace function public.konnekt_notify_follow()
returns trigger language plpgsql security definer set search_path=public,pg_temp as $$
begin
  insert into public.notifications(recipient_id,actor_id,type,body,reference_id) values(new.followed_id,new.follower_id,'follow','Someone started following you.',new.follower_id);
  return new;
end; $$;
drop trigger if exists konnekt_follow_notification on public.follows;
create trigger konnekt_follow_notification after insert on public.follows for each row execute procedure public.konnekt_notify_follow();



-- Notify post owners when someone comments.
create or replace function public.konnekt_notify_comment()
returns trigger language plpgsql security definer set search_path=public,pg_temp as $$
declare owner_id uuid;
begin
  select user_id into owner_id from public.posts where id=new.post_id;
  if owner_id is not null and owner_id<>new.user_id then
    insert into public.notifications(recipient_id,actor_id,type,body,reference_id)
    values(owner_id,new.user_id,'comment','Someone commented on your post.',new.post_id);
  end if;
  return new;
end; $$;
drop trigger if exists konnekt_comment_notification on public.post_comments;
create trigger konnekt_comment_notification after insert on public.post_comments for each row execute procedure public.konnekt_notify_comment();

-- Notify stream hosts about new live-chat comments.
create or replace function public.konnekt_notify_live_comment()
returns trigger language plpgsql security definer set search_path=public,pg_temp as $$
declare owner_id uuid;
begin
  select host_id into owner_id from public.live_streams where id=new.stream_id;
  if owner_id is not null and owner_id<>new.user_id then
    insert into public.notifications(recipient_id,actor_id,type,body,reference_id)
    values(owner_id,new.user_id,'live_comment','Someone commented on your live stream.',new.stream_id);
  end if;
  return new;
end; $$;
drop trigger if exists konnekt_live_comment_notification on public.live_stream_comments;
create trigger konnekt_live_comment_notification after insert on public.live_stream_comments for each row execute procedure public.konnekt_notify_live_comment();

-- Storage: public media for statuses/Reels; private chat attachments.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values ('konnekt-public-media','konnekt-public-media',true,52428800,array['image/jpeg','image/png','image/webp','image/gif','video/mp4','video/webm','video/quicktime'])
on conflict(id) do update set public=true,file_size_limit=52428800,allowed_mime_types=excluded.allowed_mime_types;
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values ('konnekt-chat-media','konnekt-chat-media',false,52428800,array['image/jpeg','image/png','image/webp','image/gif','video/mp4','video/webm','video/quicktime','audio/mpeg','audio/mp4','audio/webm','audio/wav','audio/ogg'])
on conflict(id) do update set public=false,file_size_limit=52428800,allowed_mime_types=excluded.allowed_mime_types;

drop policy if exists "public media readable by signed in users" on storage.objects;
create policy "public media readable by signed in users" on storage.objects for select to authenticated using(bucket_id='konnekt-public-media');
drop policy if exists "users upload public media to own folder" on storage.objects;
create policy "users upload public media to own folder" on storage.objects for insert to authenticated with check(bucket_id='konnekt-public-media' and (storage.foldername(name))[1] in ('statuses','posts') and (storage.foldername(name))[2]=auth.uid()::text);
drop policy if exists "users delete own public media" on storage.objects;
create policy "users delete own public media" on storage.objects for delete to authenticated using(bucket_id='konnekt-public-media' and (storage.foldername(name))[2]=auth.uid()::text);
drop policy if exists "conversation members read chat media" on storage.objects;
create policy "conversation members read chat media" on storage.objects for select to authenticated using(bucket_id='konnekt-chat-media' and public.is_konnekt_conversation_member(((storage.foldername(name))[1])::uuid));
drop policy if exists "conversation members upload chat media" on storage.objects;
create policy "conversation members upload chat media" on storage.objects for insert to authenticated with check(bucket_id='konnekt-chat-media' and public.is_konnekt_conversation_member(((storage.foldername(name))[1])::uuid) and (storage.foldername(name))[2]=auth.uid()::text);
drop policy if exists "users delete own chat media" on storage.objects;
create policy "users delete own chat media" on storage.objects for delete to authenticated using(bucket_id='konnekt-chat-media' and (storage.foldername(name))[2]=auth.uid()::text);

-- Realtime subscriptions used by the app. Ignore duplicate_object if rerun.
do $$ begin alter publication supabase_realtime add table public.messages; exception when duplicate_object then null; end $$;
do $$ begin alter publication supabase_realtime add table public.statuses; exception when duplicate_object then null; end $$;
do $$ begin alter publication supabase_realtime add table public.posts; exception when duplicate_object then null; end $$;
do $$ begin alter publication supabase_realtime add table public.notifications; exception when duplicate_object then null; end $$;
do $$ begin alter publication supabase_realtime add table public.live_stream_comments; exception when duplicate_object then null; end $$;
do $$ begin alter publication supabase_realtime add table public.live_streams; exception when duplicate_object then null; end $$;
