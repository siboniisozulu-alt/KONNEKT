
import { supabase } from '../lib_supabase';

export async function getMyProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function getConversationList(userId) {
  const { data: memberships, error } = await supabase
    .from('conversation_members')
    .select('conversation_id')
    .eq('user_id', userId);

  if (error) throw error;

  const ids = (memberships || []).map((item) => item.conversation_id);

  if (!ids.length) return [];

  const { data: conversations, error: convError } = await supabase
    .from('conversations')
    .select('id, title, is_group, created_at')
    .in('id', ids)
    .order('created_at', { ascending: false });

  if (convError) throw convError;

  const rows = await Promise.all(
    (conversations || []).map(async (conversation) => {
      const { data: members, error: membersError } = await supabase
        .from('conversation_members')
        .select('user_id')
        .eq('conversation_id', conversation.id);

      if (membersError) throw membersError;

      const otherIds = (members || [])
        .map((member) => member.user_id)
        .filter((id) => id !== userId);

      let profiles = [];

      if (otherIds.length) {
        const { data, error: profilesError } = await supabase
          .from('profiles')
          .select('id, username, full_name, avatar_url')
          .in('id', otherIds);

        if (profilesError) throw profilesError;
        profiles = data || [];
      }

      const { data: last, error: lastError } = await supabase
        .from('messages')
        .select('body, created_at')
        .eq('conversation_id', conversation.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (lastError) throw lastError;

      return {
        ...conversation,
        members: profiles,
        displayName:
          conversation.title ||
          profiles
            .map((profile) => profile.full_name || profile.username || 'KONNEKT user')
            .join(', ') ||
          'Conversation',
        lastMessage: last?.body || 'Start a conversation',
        lastAt: last?.created_at || conversation.created_at,
      };
    })
  );

  return rows;
}

export async function createDirectConversation(myId, otherId) {
  if (!myId || !otherId || otherId === myId) {
    throw new Error('Choose another KONNEKT user.');
  }

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError) throw authError;

  if (!user) {
    throw new Error('Please sign in before starting a conversation.');
  }

  if (user.id !== myId) {
    throw new Error('Your session has changed. Please sign in again.');
  }

  const { data, error } = await supabase.rpc(
    'create_direct_conversation',
    {
      target_user_id: otherId,
    }
  );

  if (error) throw error;

  if (!data) {
    throw new Error('Supabase did not return a conversation ID.');
  }

  return data;
}

export async function getSignedChatMedia(path) {
  const { data, error } = await supabase.storage
    .from('konnekt-chat-media')
    .createSignedUrl(path, 3600);

  if (error) throw error;
  return data.signedUrl;
}
