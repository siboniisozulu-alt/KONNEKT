// Deploy with Supabase CLI. Set ONESIGNAL_APP_ID and ONESIGNAL_REST_API_KEY as function secrets.
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
serve(async (req) => {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });
  const auth = req.headers.get('Authorization');
  if (!auth) return new Response('Unauthorized', { status: 401 });
  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, { global: { headers: { Authorization: auth } } });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Response('Unauthorized', { status: 401 });
  const { recipientIds, title, message, url } = await req.json();
  if (!Array.isArray(recipientIds) || recipientIds.length < 1 || recipientIds.length > 50 || !title || !message) return new Response('Invalid payload', { status: 400 });
  // Only notify recipients who share a conversation with the sender.
  const { data: mine } = await supabase.from('conversation_members').select('conversation_id').eq('user_id', user.id);
  const ids = (mine || []).map(x => x.conversation_id);
  const { data: others } = await supabase.from('conversation_members').select('user_id').in('conversation_id', ids).in('user_id', recipientIds);
  const allowed = [...new Set((others || []).map(x => x.user_id))].filter(id => id !== user.id);
  if (!allowed.length) return new Response(JSON.stringify({ sent: 0 }), { headers: { 'content-type': 'application/json' } });
  const appId = Deno.env.get('ONESIGNAL_APP_ID');
  const apiKey = Deno.env.get('ONESIGNAL_REST_API_KEY');
  if (!appId || !apiKey) return new Response('Push provider is not configured', { status: 503 });
  const response = await fetch('https://api.onesignal.com/notifications', {
    method: 'POST', headers: { 'content-type': 'application/json', authorization: `Key ${apiKey}` },
    body: JSON.stringify({ app_id: appId, include_aliases: { external_id: allowed }, target_channel: 'push', headings: { en: String(title).slice(0, 80) }, contents: { en: String(message).slice(0, 180) }, url: typeof url === 'string' ? url : undefined })
  });
  const result = await response.text();
  return new Response(result, { status: response.status, headers: { 'content-type': 'application/json' } });
});
