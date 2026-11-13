import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  // This endpoint must be invoked only by a scheduled trusted job with its secret header.
  const expected = Deno.env.get('CLEANUP_CRON_SECRET');
  if (!expected || req.headers.get('x-cleanup-secret') !== expected) return Response.json({ error: 'Forbidden' }, { status: 403, headers: corsHeaders });
  const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, { auth: { persistSession: false } });
  const { data: expired, error } = await admin.from('statuses').select('id,media_path').lt('expires_at', new Date().toISOString()).limit(500);
  if (error) return Response.json({ error: 'Could not list expired statuses' }, { status: 500, headers: corsHeaders });
  const paths = (expired || []).map((x: any) => x.media_path).filter(Boolean);
  if (paths.length) await admin.storage.from('konnekt-status').remove(paths);
  const ids = (expired || []).map((x: any) => x.id);
  if (ids.length) {
    const { error: deleteError } = await admin.from('statuses').delete().in('id', ids);
    if (deleteError) return Response.json({ error: 'Could not remove expired statuses' }, { status: 500, headers: corsHeaders });
  }
  return Response.json({ deleted: ids.length }, { headers: corsHeaders });
});
