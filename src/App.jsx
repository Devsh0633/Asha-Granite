import React, { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './stores/authStore'
import LoginPage from './pages/auth/LoginPage'
import AppShell from './components/layout/AppShell'
import SettingsPage from './pages/owner/SettingsPage'
import InventoryPage from './pages/inventory/InventoryPage'

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

  // Temporarily disabling the loading block for testing
  /*
  if (loading) {
    ...
  }
  */

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
          element={<AppShell />}
        >
          <Route index element={<Home />} />
          <Route path="inventory" element={<InventoryPage />} />
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
