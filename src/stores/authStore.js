import { create } from 'zustand'
import { supabase } from '../supabase/client'

export const useAuthStore = create((set) => ({
  user: null,
  employee: null,
  loading: true,
  error: null,

  setUser: (user) => set({ user }),
  setEmployee: (employee) => set({ employee }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  login: async (username, password, storeName) => {
    set({ loading: true, error: null })
    try {
      // Username is converted to email format: username@storename.local
      const email = `${username}@${storeName}.local`
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      // Fetch employee record to get role and assigned stores
      const { data: employee, error: empError } = await supabase
        .from('employees')
        .select('*')
        .eq('auth_user_id', data.user.id)
        .single()

      if (empError) throw empError

      set({ user: data.user, employee, loading: false })
      return { user: data.user, employee }
    } catch (error) {
      set({ error: error.message, loading: false })
      return { error }
    }
  },

  logout: async () => {
    await supabase.auth.signOut()
    set({ user: null, employee: null })
  },

  checkSession: async () => {
    set({ loading: true })
    const { data: { session } } = await supabase.auth.getSession()
    
    if (session) {
      const { data: employee } = await supabase
        .from('employees')
        .select('*')
        .eq('auth_user_id', session.user.id)
        .single()
      
      set({ user: session.user, employee, loading: false })
    } else {
      set({ user: null, employee: null, loading: false })
    }
  }
}))
