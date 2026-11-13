import { supabase } from './lib_supabase';

export async function setMyPresence(userId, isOnline) {
  if (!userId) return;
  const now = new Date().toISOString();
  const { error } = await supabase.from('user_presence').upsert({
    user_id: userId, is_online: !!isOnline, last_seen_at: now, updated_at: now
  }, { onConflict: 'user_id' });
  if (error) throw error;
}

export async function getPresenceMap(userIds = []) {
  const ids = [...new Set(userIds.filter(Boolean))];
  if (!ids.length) return {};
  const { data, error } = await supabase.from('user_presence').select('user_id,is_online,last_seen_at').in('user_id', ids);
  if (error) throw error;
  return Object.fromEntries((data || []).map(row => [row.user_id, row]));
}

export function watchPresence(onChange) {
  const channel = supabase.channel('konnekt-presence-updates')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'user_presence' }, payload => onChange?.(payload.new || payload.old))
    .subscribe();
  return () => supabase.removeChannel(channel);
}
