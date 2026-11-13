import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import webpush from 'npm:web-push@3.6.7';
import { corsHeaders } from '../_shared/cors.ts';
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405, headers: corsHeaders });
  const authHeader = req.headers.get('Authorization') || '';
  const url = Deno.env.get('SUPABASE_URL')!;
  const anon = Deno.env.get('SUPABASE_ANON_KEY')!;
  const service = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const caller = createClient(url, anon, { global: { headers: { Authorization: authHeader } }, auth: { persistSession: false } });
  const { data: { user }, error: authError } = await caller.auth.getUser();
  if (authError || !user) return Response.json({ error: 'Authentication required' }, { status: 401, headers: corsHeaders });
  const { message_id } = await req.json().catch(() => ({}));
  if (typeof message_id !== 'string') return Response.json({ error: 'Message ID required' }, { status: 400, headers: corsHeaders });
  const admin = createClient(url, service, { auth: { persistSession: false } });
  const { data: message, error: msgError } = await admin.from('messages').select('id,sender_id,body,conversation_id').eq('id', message_id).single();
  if (msgError || !message || message.sender_id !== user.id) return Response.json({ error: 'Message not found or not owned by caller' }, { status: 403, headers: corsHeaders });
  const pub = Deno.env.get('VAPID_PUBLIC_KEY'), priv = Deno.env.get('VAPID_PRIVATE_KEY'), subject = Deno.env.get('VAPID_SUBJECT');
  if (!pub || !priv || !subject) return Response.json({ sent: 0, warning: 'Push sender is not configured.' }, { headers: corsHeaders });
  webpush.setVapidDetails(subject, pub, priv);
  const { data: notifications } = await admin.from('notifications').select('user_id,title,body,data').contains('data',{message_id}).neq('user_id',user.id);
  let sent = 0, removed = 0;
  for (const notification of notifications || []) {
    const { data: subs } = await admin.from('push_subscriptions').select('id,endpoint,subscription').eq('user_id',notification.user_id);
    for (const sub of subs || []) {
      try {
        await webpush.sendNotification(sub.subscription, JSON.stringify({title:notification.title,body:notification.body,url:'/'}));
        sent++;
      } catch (e) {
        const status = (e as any)?.statusCode;
        if (status === 404 || status === 410) { await admin.from('push_subscriptions').delete().eq('id',sub.id); removed++; }
      }
    }
  }
  return Response.json({ sent, removed }, { headers: corsHeaders });
});
