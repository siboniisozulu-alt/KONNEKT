import { supabase } from '../lib_supabase';

export async function createCall({ calleeId, conversationId = null, callType = 'voice' }) {
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError) throw authError;
  if (!user) throw new Error('Sign in before placing a call.');
  if (!calleeId || calleeId === user.id) throw new Error('Choose another KONNEKT member.');

  const { data, error } = await supabase
    .from('call_sessions')
    .insert({
      caller_id: user.id,
      callee_id: calleeId,
      conversation_id: conversationId,
      call_type: callType,
      status: 'ringing',
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function sendCallSignal(callId, signalType, payload = {}) {
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError) throw authError;
  if (!user) throw new Error('You are not signed in.');
  const { error } = await supabase.from('call_signals').insert({
    call_id: callId,
    sender_id: user.id,
    signal_type: signalType,
    payload,
  });
  if (error) throw error;
}

export function watchCall(callId, onSignal, onSession) {
  const channel = supabase
    .channel(`konnekt-call-${callId}`)
    .on('postgres_changes', {
      event: 'INSERT', schema: 'public', table: 'call_signals', filter: `call_id=eq.${callId}`,
    }, (payload) => onSignal?.(payload.new))
    .on('postgres_changes', {
      event: 'UPDATE', schema: 'public', table: 'call_sessions', filter: `id=eq.${callId}`,
    }, (payload) => onSession?.(payload.new))
    .subscribe();
  return () => { supabase.removeChannel(channel); };
}

export async function getCallSignals(callId) {
  const { data, error } = await supabase
    .from('call_signals')
    .select('*')
    .eq('call_id', callId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function updateCall(callId, patch) {
  const { error } = await supabase.from('call_sessions').update(patch).eq('id', callId);
  if (error) throw error;
}

/** Use an authenticated short-lived TURN credential service when configured. */
export async function getKonnektIceServers() {
  const stun = { urls: import.meta.env.VITE_STUN_URL || 'stun:stun.l.google.com:19302' };
  const endpoint = import.meta.env.VITE_TURN_CREDENTIALS_URL;
  if (!endpoint) return [stun];

  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    if (!session?.access_token) return [stun];
    const response = await fetch(endpoint, {
      headers: { Authorization: `Bearer ${session.access_token}`, Accept: 'application/json' },
    });
    if (!response.ok) throw new Error(`TURN credential service returned ${response.status}.`);
    const result = await response.json();
    const servers = Array.isArray(result.iceServers)
      ? result.iceServers.filter((server) => server?.urls)
      : [];
    return servers.length ? [stun, ...servers] : [stun];
  } catch (error) {
    console.warn('KONNEKT TURN configuration:', error?.message || error);
    return [stun];
  }
}

export async function createGroupCall({ conversationId, callType = 'voice' }) {
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError) throw authError;
  if (!user) throw new Error('Sign in before starting a group call.');

  const { data: members, error: memberError } = await supabase
    .from('conversation_members')
    .select('user_id')
    .eq('conversation_id', conversationId);
  if (memberError) throw memberError;
  if (!members || members.length < 2) throw new Error('This group does not have enough members for a call.');
  if (members.length > 4) throw new Error('Group calls currently support up to four people in the peer-to-peer beta.');

  const { data: call, error } = await supabase.from('group_call_sessions').insert({
    conversation_id: conversationId,
    created_by: user.id,
    call_type: callType,
    status: 'active',
  }).select().single();
  if (error) throw error;

  const now = new Date().toISOString();
  const participants = members.map(({ user_id }) => ({
    call_id: call.id,
    user_id,
    status: user_id === user.id ? 'joined' : 'invited',
    ...(user_id === user.id ? { joined_at: now } : {}),
  }));
  const { error: participantsError } = await supabase.from('group_call_participants').insert(participants);
  if (participantsError) {
    await supabase.from('group_call_sessions').update({ status: 'ended', ended_at: now }).eq('id', call.id);
    throw participantsError;
  }
  return call;
}
