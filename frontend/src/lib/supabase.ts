import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://supabase-kong.vertigocomhandicap.cloud'
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiAiSFMyNTYiLCAidHlwIjogIkpXVCJ9.eyJyb2xlIjogImFub24iLCAiaXNzIjogInN1cGFiYXNlIiwgImlhdCI6IDE3NjkxMjI1MTIsICJleHAiOiAyMDg0NDgyNTEyfQ.QFEwtNde4HOR83k17i00jWPNiHRA11zX9rUlmf5Cl2Q'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
