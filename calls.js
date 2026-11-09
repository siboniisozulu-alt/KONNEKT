import { supabase } from '../lib_supabase';

export async function createCall({ calleeId, conversationId = null, callType = 'voice' }) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Sign in before placing a call.');
  if (!calleeId || calleeId === user.id) throw new Error('Choose another KONNEKT member.');
  const { data, error } = await supabase.from('call_sessions').insert({
    caller_id: user.id, callee_id: calleeId, conversation_id: conversationId, call_type: callType, status: 'ringing'
  }).select().single();
  if (error) throw error;
  return data;
}

export async function sendCallSignal(callId, signalType, payload = {}) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('You are not signed in.');
  const { error } = await supabase.from('call_signals').insert({ call_id: callId, sender_id: user.id, signal_type: signalType, payload });
  if (error) throw error;
}

export function watchCall(callId, onSignal, onSession) {
  const channel = supabase.channel(`konnekt-call-${callId}`)
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'call_signals', filter: `call_id=eq.${callId}` }, p => onSignal?.(p.new))
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'call_sessions', filter: `id=eq.${callId}` }, p => onSession?.(p.new))
    .subscribe();
  return () => supabase.removeChannel(channel);
}

export async function getCallSignals(callId) {
  const { data, error } = await supabase.from('call_signals').select('*').eq('call_id', callId).order('created_at', { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function updateCall(callId, patch) {
  const { error } = await supabase.from('call_sessions').update(patch).eq('id', callId);
  if (error) throw error;
}

let iceServersCache = null;
let iceServersExpiresAt = 0;

/** Fetch short-lived TURN credentials from a server endpoint when configured. */
export async function getKonnektIceServers() {
  const fallback = [{ urls: import.meta.env.VITE_STUN_URL || 'stun:stun.l.google.com:19302' }];
  const endpoint = import.meta.env.VITE_TURN_CREDENTIALS_URL;
  if (!endpoint) return fallback;
  if (iceServersCache && Date.now() < iceServersExpiresAt) return iceServersCache;
  const response = await fetch(endpoint, { method: 'GET', headers: { Accept: 'application/json' } });
  if (!response.ok) throw new Error(`TURN credentials endpoint returned ${response.status}.`);
  const payload = await response.json();
  if (!Array.isArray(payload.iceServers) || !payload.iceServers.length) throw new Error('TURN credentials endpoint returned no ICE servers.');
  iceServersCache = payload.iceServers;
  iceServersExpiresAt = Date.now() + Math.max(60, Number(payload.ttlSeconds || 300) - 30) * 1000;
  return iceServersCache;
}

export async function createGroupCall({ conversationId, callType = 'voice' }) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Sign in before starting a group call.');
  const { data: members, error: memberError } = await supabase.from('conversation_members').select('user_id').eq('conversation_id', conversationId);
  if (memberError) throw memberError;
  if (!members || members.length < 2) throw new Error('This group does not have enough members for a call.');
  if (members.length > 4) throw new Error('Group calls currently support up to four people in the peer-to-peer beta.');
  const { data: call, error } = await supabase.from('group_call_sessions').insert({
    conversation_id: conversationId, created_by: user.id, call_type: callType, status: 'active'
  }).select().single();
  if (error) throw error;
  const participants = members.map(row => ({ call_id: call.id, user_id: row.user_id, status: row.user_id === user.id ? 'joined' : 'invited', joined_at: row.user_id === user.id ? new Date().toISOString() : null }));
  const { error: participantsError } = await supabase.from('group_call_participants').insert(participants);
  if (participantsError) throw participantsError;
  return call;
}
