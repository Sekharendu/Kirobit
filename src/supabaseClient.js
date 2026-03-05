import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://dahanwpqjtlmftapnvsc.supabase.co';
const supabaseAnonKey = 'sb_publishable_6ClCPPH5H9nk2USg7pJ2qw_o2NikUhu';

if (!supabaseUrl || !supabaseAnonKey) {
  // eslint-disable-next-line no-console
  console.warn('Supabase env vars are missing. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

