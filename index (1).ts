import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405, headers: corsHeaders });
  const authHeader = req.headers.get('Authorization') || '';
  const caller = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, { global: { headers: { Authorization: authHeader } }, auth: { persistSession: false } });
  const { data: { user }, error } = await caller.auth.getUser();
  if (error || !user || user.app_metadata?.role !== 'moderator') return Response.json({ error: 'Moderator access required' }, { status: 403, headers: corsHeaders });
  const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, { auth: { persistSession: false } });
  const { data, error: queryError } = await admin.from('reports').select('id,reporter_id,target_user_id,target_reel_id,target_message_id,reason,details,status,created_at').order('created_at',{ascending:false}).limit(100);
  if (queryError) return Response.json({ error: 'Could not load moderation queue' }, { status: 500, headers: corsHeaders });
  return Response.json({ reports: data || [] }, { headers: corsHeaders });
});
