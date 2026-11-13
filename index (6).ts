import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405, headers: corsHeaders });
  const authHeader = req.headers.get('Authorization') || '';
  if (!authHeader.startsWith('Bearer ')) return Response.json({ error: 'Authentication required' }, { status: 401, headers: corsHeaders });
  const url = Deno.env.get('SUPABASE_URL')!;
  const anon = Deno.env.get('SUPABASE_ANON_KEY')!;
  const client = createClient(url, anon, { global: { headers: { Authorization: authHeader } }, auth: { persistSession: false } });
  const { data: { user }, error: userError } = await client.auth.getUser();
  if (userError || !user) return Response.json({ error: 'Invalid session' }, { status: 401, headers: corsHeaders });
  const tables = ['profiles','follows','blocked_users','conversation_members','conversations','messages','reels','reel_likes','reel_comments','statuses','reports','notifications','user_consents','push_subscriptions'];
  const result: Record<string, unknown> = { exported_at: new Date().toISOString(), user: { id: user.id, email: user.email, created_at: user.created_at }, data: {} };
  for (const table of tables) {
    let query = client.from(table).select('*');
    if (table === 'profiles') query = query.eq('id', user.id);
    else if (table === 'follows') query = query.or(`follower_id.eq.${user.id},followed_id.eq.${user.id}`);
    else if (table === 'blocked_users') query = query.or(`blocker_id.eq.${user.id},blocked_id.eq.${user.id}`);
    else if (table === 'conversation_members') query = query.eq('user_id', user.id);
    else if (table === 'conversations') {
      const { data: memberships } = await client.from('conversation_members').select('conversation_id').eq('user_id', user.id);
      const ids = (memberships || []).map((x: any) => x.conversation_id);
      query = ids.length ? query.in('id', ids) : query.limit(0);
    }
    else if (table === 'messages') {
      const { data: memberships } = await client.from('conversation_members').select('conversation_id').eq('user_id', user.id);
      const ids = (memberships || []).map((x: any) => x.conversation_id);
      query = ids.length ? query.in('conversation_id', ids) : query.limit(0);
    } else query = query.eq(table === 'reel_likes' ? 'user_id' : table === 'reel_comments' ? 'user_id' : table === 'reports' ? 'reporter_id' : 'user_id', user.id);
    const { data, error } = await query;
    if (error) return Response.json({ error: `Export failed for ${table}` }, { status: 500, headers: corsHeaders });
    (result.data as Record<string, unknown>)[table] = data || [];
  }
  return new Response(JSON.stringify(result, null, 2), { headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Content-Disposition': 'attachment; filename="konnekt-account-export.json"' } });
});
