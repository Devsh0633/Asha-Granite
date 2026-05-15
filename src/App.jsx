import React, { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './stores/authStore'
import LoginPage from './pages/auth/LoginPage'
import AppShell from './components/layout/AppShell'
import SettingsPage from './pages/owner/SettingsPage'

// Placeholder Pages
const Home = () => (
  <div className="flex flex-col gap-4">
    <h1 className="text-4xl font-display font-bold">Welcome back!</h1>
    <p className="text-text-secondary">Select an action from the menu to get started.</p>
  </div>
)

const App = () => {
  const { user, loading, checkSession } = useAuthStore()

  useEffect(() => {
    checkSession()
  }, [])

  if (loading) {
    const isConfigured = import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY;

    return (
      <div className="min-h-screen bg-bg-primary flex flex-col items-center justify-center gap-4">
        {isConfigured ? (
          <div className="w-12 h-12 border-4 border-accent-primary/20 border-t-accent-primary rounded-full animate-spin"></div>
        ) : (
          <div className="max-w-md p-8 bg-bg-surface border border-accent-danger/30 rounded-card text-center">
            <h2 className="text-accent-danger font-display text-xl mb-2">Configuration Missing</h2>
            <p className="text-text-secondary text-sm">
              The application keys are not set. If you are on Vercel, please add <b>VITE_SUPABASE_URL</b> and <b>VITE_SUPABASE_ANON_KEY</b> to your project settings.
            </p>
          </div>
        )}
      </div>
    )
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Auth Route */}
        <Route 
          path="/login" 
          element={!user ? <LoginPage /> : <Navigate to="/" replace />} 
        />

        {/* Protected Routes */}
        <Route 
          path="/" 
          element={user ? <AppShell /> : <Navigate to="/login" replace />}
        >
          <Route index element={<Home />} />
          <Route path="inventory" element={<Home />} />
          <Route path="sale" element={<Home />} />
          <Route path="my-sales" element={<Home />} />
          <Route path="profile" element={<Home />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
