import { createClient } from '@supabase/supabase-js';

// These are public browser credentials. Database access is protected by RLS policies.
export const SUPABASE_URL = 'https://itkoagpigiifodfhoujt.supabase.co';
export const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_IwIhQTVgq_mOTaxUu3Lnqw_ZCw0CVRn';

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});
