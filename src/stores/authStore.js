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
      // MOCK LOGIN FOR TESTING
      const mockEmployee = {
        id: 'mock-id',
        username: username || 'admin',
        role: 'owner',
        full_name: 'Test Owner',
        store_id: 'mock-store'
      }
      
      set({ 
        user: { id: 'mock-user' }, 
        employee: mockEmployee,
        loading: false 
      })
      return { user: { id: 'mock-user' }, employee: mockEmployee }
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
    // DO NOTHING FOR MOCK TESTING
    set({ loading: false })
  }
}))
