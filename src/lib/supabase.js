import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

const missingConfigError = new Error(
  'Supabase environment variables are not set. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in Vercel.'
)

function createMissingSupabaseClient() {
  const rejectMissingConfig = () => Promise.reject(missingConfigError)

  return {
    auth: {
      signInWithPassword: rejectMissingConfig,
      signUp: rejectMissingConfig,
      signOut: rejectMissingConfig,
      resetPasswordForEmail: rejectMissingConfig,
      getSession: async () => ({ data: { session: null }, error: missingConfigError }),
      onAuthStateChange: () => ({
        data: {
          subscription: {
            unsubscribe: () => {},
          },
        },
      }),
    },
    from: () => {
      throw missingConfigError
    },
  }
}

if (!isSupabaseConfigured) {
  console.error('Missing Supabase env vars: VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY')
}

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    })
  : createMissingSupabaseClient()

export default supabase
