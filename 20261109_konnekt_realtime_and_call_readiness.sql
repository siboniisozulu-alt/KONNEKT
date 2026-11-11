-- Additive realtime publication entries for call invitations.
-- Safe to apply to the existing KONNEKT database; no existing data is deleted.
do $$ begin alter publication supabase_realtime add table public.group_call_participants; exception when duplicate_object then null; when undefined_object then null; end $$;
do $$ begin alter publication supabase_realtime add table public.group_call_signals; exception when duplicate_object then null; when undefined_object then null; end $$;

-- Preserve a group description on the existing conversations table.
alter table public.conversations add column if not exists description text not null default '';

-- Notify invited members when they are added to a group conversation.
create or replace function public.konnekt_notify_group_member_added()
returns trigger language plpgsql security definer set search_path = public, pg_temp as $$
declare group_row public.conversations%rowtype;
begin
  select * into group_row from public.conversations where id = new.conversation_id;
  if group_row.is_group and new.user_id <> group_row.created_by then
    insert into public.notifications(recipient_id, actor_id, type, body, reference_id)
    values(new.user_id, group_row.created_by, 'group_invite', 'You were added to a KONNEKT group.', new.conversation_id);
  end if;
  return new;
end;
$$;
drop trigger if exists konnekt_group_member_invite_notification on public.conversation_members;
create trigger konnekt_group_member_invite_notification
after insert on public.conversation_members
for each row execute function public.konnekt_notify_group_member_added();

-- Prevent calls between accounts where either participant has blocked the other.
create or replace function public.konnekt_guard_call_blocks()
returns trigger language plpgsql security definer set search_path = public, pg_temp as $$
begin
  if exists (
    select 1 from public.user_blocks b
    where (b.blocker_id = new.caller_id and b.blocked_id = new.callee_id)
       or (b.blocker_id = new.callee_id and b.blocked_id = new.caller_id)
  ) then
    raise exception 'This call cannot be started because one participant has blocked the other.';
  end if;
  return new;
end;
$$;
drop trigger if exists konnekt_guard_call_blocks on public.call_sessions;
create trigger konnekt_guard_call_blocks before insert on public.call_sessions
for each row execute function public.konnekt_guard_call_blocks();
