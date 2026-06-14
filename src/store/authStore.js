import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '../lib/supabase'

// Demo mode is opt-in via VITE_ENABLE_DEMO=true
const ENABLE_DEMO = import.meta.env.VITE_ENABLE_DEMO === 'true'

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      profile: null,
      loading: false,
      error: null,

      setUser: (user) => set({ user }),
      setProfile: (profile) => set({ profile }),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),

      login: async (email, password) => {
        set({ loading: true, error: null })
        // ── Demo bypass (only when ENABLE_DEMO=true) ───────────
        const DEMO = {
          'patient@demo.com':      { id: 'demo-patient-001',    full_name: 'Ali Hassan',    role: 'patient',     phone: '+92 300 1234567', city: 'Karachi' },
          'doctor@demo.com':       { id: 'demo-doctor-001',     full_name: 'Dr. Sarah Ahmed', role: 'doctor',   phone: '+92 321 9876543', city: 'Karachi' },
          'assistant@demo.com':    { id: 'demo-assistant-001',  full_name: 'Fatima Malik',  role: 'assistant',   phone: '+92 333 5555555', city: 'Lahore'  },
          'admin@demo.com':        { id: 'demo-admin-001',      full_name: 'Omar Farooq',   role: 'admin',       phone: '+92 311 1111111', city: 'Islamabad' },
          'superadmin@demo.com':   { id: 'demo-superadmin-001', full_name: 'Zara Khan',     role: 'super_admin', phone: '+92 345 9999999', city: 'Islamabad' },
        }
        const emailLower = email.toLowerCase().trim()
        if (ENABLE_DEMO && DEMO[emailLower] && password === 'demo123') {
          await new Promise(r => setTimeout(r, 500))
          const profile = { ...DEMO[emailLower], email: emailLower, avatar_url: null }
          set({ user: { id: profile.id, email: emailLower, isDemo: true }, profile, loading: false, error: null })
          return { success: true }
        }
        // ── End demo bypass ───────────────────────────────────

        try {
          const { data, error } = await supabase.auth.signInWithPassword({ email, password })
          if (error) throw error

          set({ user: data.user })

          // Fetch profile from DB
          let { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single()

          // If profile doesn't exist yet, create it from auth metadata
          if (profileError || !profile) {
            const meta = data.user.user_metadata || {}
            const fallback = {
              id: data.user.id,
              email: data.user.email,
              full_name: meta.full_name || data.user.email.split('@')[0],
              role: meta.role || 'patient',
              phone: null,
              avatar_url: null,
              is_active: true,
            }
            await supabase.from('profiles').upsert(fallback)
            profile = fallback
          }

          set({ profile, loading: false })
          return { success: true }
        } catch (error) {
          set({ error: error.message, loading: false })
          return { success: false, error: error.message }
        }
      },

      register: async (userData) => {
        set({ loading: true, error: null })
        try {
          const { data, error } = await supabase.auth.signUp({
            email: userData.email,
            password: userData.password,
            options: {
              data: {
                full_name: userData.full_name,
                role: userData.role || 'patient',
              },
            },
          })
          if (error) throw error

          if (data.user) {
            const profilePayload = {
              id: data.user.id,
              full_name: userData.full_name,
              email: userData.email,
              phone: userData.phone || null,
              role: userData.role || 'patient',
              avatar_url: null,
              created_at: new Date().toISOString(),
            }

            await supabase.from('profiles').upsert(profilePayload)

            if ((userData.role || 'patient') === 'doctor') {
              await supabase.from('doctors').upsert({
                profile_id: data.user.id,
                display_name: userData.full_name,
                specialization: 'General Physician',
                consultation_fee: 0,
                is_verified: false,
                is_available: true,
                updated_at: new Date().toISOString(),
              }, { onConflict: 'profile_id' })
            }
          }

          // If Supabase requires email confirmation data.user may be null
          const fakeUser = data.user || {
            id: 'new-' + Date.now(),
            email: userData.email,
          }
          const profile = {
            id: fakeUser.id,
            email: userData.email,
            full_name: userData.full_name,
            role: userData.role || 'patient',
            phone: userData.phone || null,
            avatar_url: null,
          }
          set({ user: fakeUser, profile, loading: false })
          return { success: true }
        } catch (error) {
          set({ error: error.message, loading: false })
          return { success: false, error: error.message }
        }
      },

      logout: async () => {
        const { user } = get()
        try {
          if (!user?.isDemo) {
            await supabase.auth.signOut()
          }
        } catch (error) {
          console.warn('Supabase sign out failed; clearing local session.', error)
        } finally {
          set({ user: null, profile: null, error: null, loading: false })
        }
      },

      forgotPassword: async (email) => {
        set({ loading: true, error: null })
        // Demo accounts — pretend success only when demo enabled
        const demoEmails = ['patient@demo.com','doctor@demo.com','assistant@demo.com','admin@demo.com','superadmin@demo.com']
        if (ENABLE_DEMO && demoEmails.includes(email.toLowerCase())) {
          await new Promise(r => setTimeout(r, 500))
          set({ loading: false })
          return { success: true }
        }
        try {
          const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password`,
          })
          if (error) throw error
          set({ loading: false })
          return { success: true }
        } catch (error) {
          set({ error: error.message, loading: false })
          return { success: false, error: error.message }
        }
      },

      fetchProfile: async () => {
        const { user } = get()
        if (!user || user.isDemo) return
        const { data: profile } = await supabase
          .from('profiles').select('*').eq('id', user.id).single()
        if (profile) set({ profile })
      },

      initAuth: async () => {
        // Keep demo sessions alive without hitting Supabase
        const { user } = get()
        if (user?.isDemo) return

        try {
          const { data: { session } } = await supabase.auth.getSession()
          if (session?.user) {
            set({ user: session.user })
            const { data: profile } = await supabase
              .from('profiles').select('*').eq('id', session.user.id).single()
            if (profile) set({ profile })
          }

          supabase.auth.onAuthStateChange(async (event, session) => {
            const { user: cur } = get()
            if (cur?.isDemo) return   // don't touch demo sessions

            if (event === 'SIGNED_IN' && session) {
              set({ user: session.user })
              const { data: profile } = await supabase
                .from('profiles').select('*').eq('id', session.user.id).single()
              if (profile) set({ profile })
            } else if (event === 'SIGNED_OUT') {
              set({ user: null, profile: null })
            }
          })
        } catch {
          // Supabase not reachable — silently ignore
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, profile: state.profile }),
    }
  )
)

export default useAuthStore
