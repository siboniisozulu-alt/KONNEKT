import { supabase } from '../lib_supabase';

// WebRTC signalling only. A TURN service is required for dependable calls across networks.
export async function createCall({ calleeId, conversationId = null, callType = 'voice' }) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Sign in before placing a call.');
  if (!calleeId || calleeId === user.id) throw new Error('Choose another KONNEKT member.');
  const { data, error } = await supabase.from('call_sessions').insert({
    caller_id: user.id, callee_id: calleeId, conversation_id: conversationId, call_type: callType
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

export async function updateCall(callId, patch) {
  const { error } = await supabase.from('call_sessions').update(patch).eq('id', callId);
  if (error) throw error;
}

// STUN works on some networks. For dependable calling, configure an authenticated
// endpoint that returns short-lived TURN credentials. Never embed permanent TURN
// usernames or passwords in VITE_ variables or client-side source code.
export async function getKonnektIceServers() {
  const stun = { urls: 'stun:stun.l.google.com:19302' };
  const endpoint = import.meta.env.VITE_TURN_CREDENTIALS_URL;
  if (!endpoint) return [stun];
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) return [stun];
    const response = await fetch(endpoint, { headers: { Authorization: `Bearer ${session.access_token}` } });
    if (!response.ok) throw new Error(`TURN credential service returned ${response.status}.`);
    const result = await response.json();
    const servers = Array.isArray(result.iceServers) ? result.iceServers.filter(server => server?.urls) : [];
    return servers.length ? [stun, ...servers] : [stun];
  } catch (error) {
    console.warn('KONNEKT TURN configuration:', error?.message || error);
    return [stun];
  }
}
