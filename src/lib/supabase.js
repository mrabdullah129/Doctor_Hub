import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ncjkrtbuqskmazzophns.supabase.co'
const supabaseAnonKey = 'sb_publishable_icUclGXSbb-LwShe0XbaXQ_2FrrC1Sm'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
})

export default supabase
