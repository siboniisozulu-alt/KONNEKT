import { supabase } from '../lib_supabase';

export async function getMyProfile(userId) {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
  if (error) throw error;
  return data;
}

export async function getConversationList(userId) {
  const { data: memberships, error } = await supabase.from('conversation_members').select('conversation_id').eq('user_id', userId);
  if (error) throw error;
  const ids = (memberships || []).map(x => x.conversation_id);
  if (!ids.length) return [];
  const { data: conversations, error: convError } = await supabase.from('conversations').select('id,title,is_group,created_at').in('id', ids).order('created_at', { ascending: false });
  if (convError) throw convError;
  const rows = await Promise.all((conversations || []).map(async c => {
    const { data: members } = await supabase.from('conversation_members').select('user_id').eq('conversation_id', c.id);
    const otherIds = (members || []).map(m => m.user_id).filter(id => id !== userId);
    const { data: profiles } = otherIds.length ? await supabase.from('profiles').select('id,username,full_name,avatar_url').in('id', otherIds) : { data: [] };
    const { data: last } = await supabase.from('messages').select('body,created_at').eq('conversation_id', c.id).order('created_at', { ascending: false }).limit(1).maybeSingle();
    return { ...c, members: profiles || [], displayName: c.title || (profiles || []).map(p => p.full_name || p.username || 'KONNEKT user').join(', ') || 'Conversation', lastMessage: last?.body || 'Start a conversation', lastAt: last?.created_at || c.created_at };
  }));
  return rows;
}
export async function createDirectConversation(myId, otherId) {
  if (!otherId || otherId === myId) {
    throw new Error('Choose another KONNEKT user.');
  }

  const { data, error } = await supabase.rpc(
    'create_direct_conversation',
    {
      target_user_id: otherId
    }
  );

  if (error) throw error;

  if (!data) {
    throw new Error('Supabase did not return a conversation ID.');
  }

  return data;
}

  const { data: conversation, error } = await supabase.from('conversations').insert({ created_by: myId, is_group: false }).select('id').single();
  if (error) throw error;
  const { error: memberError } = await supabase.from('conversation_members').insert([{ conversation_id: conversation.id, user_id: myId }, { conversation_id: conversation.id, user_id: otherId }]);
  if (memberError) throw memberError;
  return conversation.id;
}

export async function getSignedChatMedia(path) {
  const { data, error } = await supabase.storage.from('konnekt-chat-media').createSignedUrl(path, 3600);
  if (error) throw error;
  return data.signedUrl;
}
