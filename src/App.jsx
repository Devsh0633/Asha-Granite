import React, { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './stores/authStore'
import LoginPage from './pages/auth/LoginPage'
import AppShell from './components/layout/AppShell'

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
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-accent-primary/20 border-t-accent-primary rounded-full animate-spin"></div>
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
          <index element={<Home />} />
          <Route path="inventory" element={<Home />} />
          <Route path="sale" element={<Home />} />
          <Route path="my-sales" element={<Home />} />
          <Route path="profile" element={<Home />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
