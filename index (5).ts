import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { SignJWT } from 'https://esm.sh/jose@5';
import { corsHeaders } from '../_shared/cors.ts';
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405, headers: corsHeaders });
  const authHeader = req.headers.get('Authorization') || '';
  const url = Deno.env.get('SUPABASE_URL')!;
  const anon = Deno.env.get('SUPABASE_ANON_KEY')!;
  const service = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const apiKey = Deno.env.get('LIVEKIT_API_KEY');
  const apiSecret = Deno.env.get('LIVEKIT_API_SECRET');
  const livekitUrl = Deno.env.get('LIVEKIT_URL');
  if (!apiKey || !apiSecret || !livekitUrl) return Response.json({ error: 'LiveKit is not configured for this staging project.' }, { status: 503, headers: corsHeaders });
  const caller = createClient(url, anon, { global: { headers: { Authorization: authHeader } }, auth: { persistSession: false } });
  const { data: { user }, error } = await caller.auth.getUser();
  if (error || !user) return Response.json({ error: 'Authentication required' }, { status: 401, headers: corsHeaders });
  const { conversation_id } = await req.json().catch(() => ({}));
  if (typeof conversation_id !== 'string') return Response.json({ error: 'Conversation ID required' }, { status: 400, headers: corsHeaders });
  const admin = createClient(url, service, { auth: { persistSession: false } });
  const { data: memberships } = await admin.from('conversation_members').select('user_id').eq('conversation_id', conversation_id);
  if (!(memberships || []).some((m:any) => m.user_id === user.id)) return Response.json({ error: 'Conversation membership required' }, { status: 403, headers: corsHeaders });
  const peers = (memberships || []).filter((m:any) => m.user_id !== user.id).map((m:any) => m.user_id);
  if (peers.length) {
    const { data: blocks } = await admin.from('blocked_users').select('blocker_id,blocked_id').or(`and(blocker_id.eq.${user.id},blocked_id.in.(${peers.join(',')})),and(blocked_id.eq.${user.id},blocker_id.in.(${peers.join(',')}))`);
    if (blocks?.length) return Response.json({ error: 'Calling is unavailable because this conversation has a block restriction.' }, { status: 403, headers: corsHeaders });
  }
  const secret = new TextEncoder().encode(apiSecret);
  const token = await new SignJWT({ video: { roomJoin: true, room: `konnekt-${conversation_id}`, canPublish: true, canSubscribe: true, canPublishData: true } })
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' }).setIssuer(apiKey).setSubject(user.id)
    .setNotBefore('0s').setIssuedAt().setExpirationTime('10m').sign(secret);
  return Response.json({ token, server_url: livekitUrl }, { headers: corsHeaders });
});
