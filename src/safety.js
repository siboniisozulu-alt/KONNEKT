import { supabase } from '../lib_supabase';

export async function submitKonnektReport({ reportedUserId = null, contentId = null, contentType = 'user', reason, details = '' }) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Sign in before submitting a report.');
  if (reportedUserId && reportedUserId === user.id) throw new Error('You cannot report your own account.');
  const { data, error } = await supabase.from('user_reports').insert({
    reporter_id: user.id, reported_user_id: reportedUserId, content_id: contentId,
    content_type: contentType, reason: String(reason || '').slice(0, 100), details: String(details || '').slice(0, 2000)
  }).select('id').single();
  if (error) throw error;
  return data;
}

export async function blockKonnektUser(userId) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Sign in before blocking someone.');
  if (!userId || userId === user.id) throw new Error('Choose another account to block.');
  const { error } = await supabase.from('user_blocks').upsert({ blocker_id: user.id, blocked_id: userId }, { onConflict: 'blocker_id,blocked_id' });
  if (error) throw error;
}

export async function unblockKonnektUser(userId) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Sign in before changing your block list.');
  const { error } = await supabase.from('user_blocks').delete().eq('blocker_id', user.id).eq('blocked_id', userId);
  if (error) throw error;
}

export async function getKonnektBlockedUsers() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Sign in to view blocked accounts.');
  const { data, error } = await supabase.from('user_blocks').select('blocked_id,created_at').eq('blocker_id', user.id).order('created_at', { ascending: false });
  if (error) throw error;
  const ids = (data || []).map(row => row.blocked_id);
  const { data: profiles, error: profileError } = ids.length ? await supabase.from('profiles').select('id,username,full_name,avatar_url').in('id', ids) : { data: [], error: null };
  if (profileError) throw profileError;
  return (data || []).map(row => ({ ...row, ...(profiles || []).find(profile => profile.id === row.blocked_id) }));
}
