import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

function base64(bytes: Uint8Array) {
  let binary = '';
  bytes.forEach(byte => binary += String.fromCharCode(byte));
  return btoa(binary);
}
async function hmacSha1(secret: string, message: string) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-1' }, false, ['sign']);
  return new Uint8Array(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(message)));
}

serve(async req => {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });
  const authorization = req.headers.get('Authorization');
  if (!authorization) return new Response('Unauthorized', { status: 401 });
  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, { global: { headers: { Authorization: authorization } } });
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return new Response('Unauthorized', { status: 401 });
  const urls = Deno.env.get('TURN_URLS');
  const secret = Deno.env.get('TURN_SHARED_SECRET');
  if (!urls || !secret) return new Response(JSON.stringify({ error: 'TURN is not configured' }), { status: 503, headers: { 'content-type': 'application/json' } });
  const expiry = Math.floor(Date.now() / 1000) + 3600;
  const username = `${expiry}:${user.id}`;
  const credential = base64(await hmacSha1(secret, username));
  return Response.json({ iceServers: [{ urls: urls.split(',').map(x => x.trim()).filter(Boolean), username, credential }, { urls: ['stun:stun.l.google.com:19302'] }] });
});
