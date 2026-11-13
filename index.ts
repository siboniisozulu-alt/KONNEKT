import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405, headers: corsHeaders });
  const url = Deno.env.get('SUPABASE_URL')!;
  const service = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const authHeader = req.headers.get('Authorization') || '';
  if (!authHeader.startsWith('Bearer ')) return Response.json({ error: 'Authentication required' }, { status: 401, headers: corsHeaders });
  const admin = createClient(url, service, { auth: { persistSession: false } });
  const caller = createClient(url, Deno.env.get('SUPABASE_ANON_KEY')!, { global: { headers: { Authorization: authHeader } }, auth: { persistSession: false } });
  const { data: { user }, error } = await caller.auth.getUser();
  if (error || !user) return Response.json({ error: 'Invalid session' }, { status: 401, headers: corsHeaders });

  // Transfer ownership of group conversations where possible so the FK does not block
  // account removal. Empty conversations are deleted with their messages.
  const { data: owned, error: ownedError } = await admin.from('conversations').select('id').eq('created_by', user.id);
  if (ownedError) return Response.json({ error: 'Could not prepare conversation ownership transfer' }, { status: 500, headers: corsHeaders });
  for (const conv of owned || []) {
    const { data: members, error: memberError } = await admin.from('conversation_members').select('user_id').eq('conversation_id', conv.id).neq('user_id', user.id).limit(1);
    if (memberError) return Response.json({ error: 'Could not inspect conversation members' }, { status: 500, headers: corsHeaders });
    const result = members?.length
      ? await admin.from('conversations').update({ created_by: members[0].user_id }).eq('id', conv.id)
      : await admin.from('conversations').delete().eq('id', conv.id);
    if (result.error) return Response.json({ error: 'Could not transfer or remove conversation ownership' }, { status: 500, headers: corsHeaders });
  }

  // Remove reports referencing content/account and authored messages. This also avoids
  // the message-sender RESTRICT foreign key blocking profile deletion.
  const { data: authoredMessages, error: messagesError } = await admin.from('messages').select('id').eq('sender_id', user.id);
  const { data: authoredReels, error: reelsError } = await admin.from('reels').select('id').eq('user_id', user.id);
  if (messagesError || reelsError) return Response.json({ error: 'Could not prepare account data cleanup' }, { status: 500, headers: corsHeaders });
  const messageIds = (authoredMessages || []).map((x:any) => x.id);
  const reelIds = (authoredReels || []).map((x:any) => x.id);
  const cleanupOps:any[] = [admin.from('reports').delete().eq('target_user_id', user.id)];
  if (messageIds.length) cleanupOps.push(admin.from('reports').delete().in('target_message_id', messageIds));
  if (reelIds.length) cleanupOps.push(admin.from('reports').delete().in('target_reel_id', reelIds));
  cleanupOps.push(admin.from('messages').delete().eq('sender_id', user.id));
  cleanupOps.push(admin.from('notifications').delete().eq('actor_id', user.id));
  cleanupOps.push(admin.from('notifications').delete().eq('user_id', user.id));
  const cleanupResults = await Promise.all(cleanupOps);
  if (cleanupResults.some((x:any) => x.error)) return Response.json({ error: 'Could not clean account-linked messages or reports' }, { status: 500, headers: corsHeaders });

  // Remove all account media before deleting the auth identity. Paginate to avoid
  // leaving orphaned objects if a test account has more than one page of files.
  for (const bucket of ['konnekt-avatars','konnekt-reels','konnekt-status']) {
    let offset = 0;
    while (true) {
      const { data: objects, error: listError } = await admin.storage.from(bucket).list(user.id,{limit:500,offset});
      if (listError) return Response.json({ error: `Could not list ${bucket} media for deletion` }, { status: 500, headers: corsHeaders });
      const paths = (objects || []).filter((x:any)=>x.name).map((x:any)=>`${user.id}/${x.name}`);
      if (paths.length) {
        const { error: removeError } = await admin.storage.from(bucket).remove(paths);
        if (removeError) return Response.json({ error: `Could not remove ${bucket} media` }, { status: 500, headers: corsHeaders });
      }
      if (!objects || objects.length < 500) break;
      offset += objects.length;
    }
  }

  const { error: deleteError } = await admin.auth.admin.deleteUser(user.id);
  if (deleteError) return Response.json({ error: 'Account deletion failed after cleanup attempt. Contact KONNEKT support.' }, { status: 500, headers: corsHeaders });
  return Response.json({ success: true }, { headers: corsHeaders });
});
