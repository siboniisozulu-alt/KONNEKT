import { supabase } from '../lib_supabase';

export async function createCall({ calleeId, conversationId = null, callType = 'voice' }) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Sign in before placing a call.');
  if (!calleeId || calleeId === user.id) throw new Error('Choose another KONNEKT member.');
  const { data, error } = await supabase.from('call_sessions').insert({
    caller_id: user.id, callee_id: calleeId, conversation_id: conversationId, call_type: callType
  }).select().single();
  if (error) throw error;
  // Best-effort call alert. The realtime in-app incoming-call prompt is the fallback.
  if (conversationId) {
    supabase.functions.invoke('send-push', {
      body: { conversationId, recipientIds: [calleeId], title: 'Incoming KONNEKT call', message: `You have a ${callType} call`, url: typeof window !== 'undefined' ? `${window.location.origin}/KONNEKT/` : undefined }
    }).then(({ error: pushError }) => {
      if (pushError) console.info('KONNEKT call push not delivered:', pushError.message);
    }).catch(error => console.info('KONNEKT call push not delivered:', error?.message || error));
  }
  return data;
}

export async function sendCallSignal(callId, signalType, payload = {}) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('You are not signed in.');
  const { error } = await supabase.from('call_signals').insert({
    call_id: callId, sender_id: user.id, signal_type: signalType, payload
  });
  if (error) throw error;
}

export function watchCall(callId, onSignal, onSession) {
  const channel = supabase.channel(`konnekt-call-${callId}-${Math.random().toString(36).slice(2)}`)
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'call_signals', filter: `call_id=eq.${callId}` }, p => onSignal?.(p.new))
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'call_sessions', filter: `id=eq.${callId}` }, p => onSession?.(p.new))
    .subscribe(async status => {
      if (status === 'SUBSCRIBED') {
        const { data } = await supabase.from('call_signals').select('*').eq('call_id', callId).order('id', { ascending: true });
        (data || []).forEach(signal => onSignal?.(signal));
      }
    });
  return () => supabase.removeChannel(channel);
}

export async function updateCall(callId, patch) {
  const { error } = await supabase.from('call_sessions').update(patch).eq('id', callId);
  if (error) throw error;
}

export async function getIceServers() {
  // TURN credentials are minted by the server and never placed in VITE_ build variables.
  try {
    const { data, error } = await supabase.functions.invoke('turn-credentials');
    if (!error && Array.isArray(data?.iceServers) && data.iceServers.length) return data.iceServers;
  } catch (error) {
    console.info('KONNEKT TURN credentials unavailable; using STUN fallback.', error?.message || error);
  }
  return [{ urls: ['stun:stun.l.google.com:19302'] }];
}
