-- Run only after the target moderator has registered and you have verified their Auth user UUID.
-- Replace the placeholder with the exact auth.users.id. Never add an untrusted account.
insert into public.moderation_admins(user_id)
values ('00000000-0000-0000-0000-000000000000')
on conflict (user_id) do nothing;
