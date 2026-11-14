
-- KONNEKT compatibility patch
-- Apply only after the existing call and moderation migrations.
-- Keeps legacy values while allowing values used by the current app.

-- One-to-one call status compatibility.
alter table public.call_sessions
  drop constraint if exists call_sessions_status_check;

alter table public.call_sessions
  add constraint call_sessions_status_check
  check (status in (
    'ringing',
    'accepted',
    'declined',
    'rejected',
    'missed',
    'ended',
    'failed'
  ));

-- One-to-one call signalling compatibility.
alter table public.call_signals
  drop constraint if exists call_signals_signal_type_check;

alter table public.call_signals
  add constraint call_signals_signal_type_check
  check (signal_type in (
    'offer',
    'answer',
    'ice',
    'ice-candidate',
    'hangup',
    'reject'
  ));

-- Distinguish a reviewed/actioned report from an actual warning.
alter table public.moderation_actions
  drop constraint if exists moderation_actions_action_check;

alter table public.moderation_actions
  add constraint moderation_actions_action_check
  check (action in (
    'warning',
    'content_removed',
    'temporary_restriction',
    'account_suspended',
    'account_restored',
    'report_dismissed',
    'report_actioned'
  ));
