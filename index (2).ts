import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405, headers: corsHeaders });
  const authHeader = req.headers.get('Authorization') || '';
  const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, { auth: { persistSession: false } });
  const caller = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, { global: { headers: { Authorization: authHeader } }, auth: { persistSession: false } });
  const { data: { user }, error } = await caller.auth.getUser();
  if (error || !user || user.app_metadata?.role !== 'moderator') return Response.json({ error: 'Moderator access required' }, { status: 403, headers: corsHeaders });
  const body = await req.json().catch(() => ({}));
  const { report_id, status, notes = '' } = body;
  if (!report_id || !['reviewing','actioned','dismissed'].includes(status) || typeof notes !== 'string' || notes.length > 3000) return Response.json({ error: 'Invalid moderation request' }, { status: 400, headers: corsHeaders });
  const { data, error: updateError } = await admin.from('reports').update({ status, moderator_notes: notes, reviewed_by: user.id, reviewed_at: new Date().toISOString() }).eq('id', report_id).select('id,status').single();
  if (updateError) return Response.json({ error: 'Could not update report' }, { status: 500, headers: corsHeaders });
  return Response.json({ success: true, report: data }, { headers: corsHeaders });
});
