import React, { useState } from 'react'
import { useAuthStore } from '../../stores/authStore'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { LogIn } from 'lucide-react'

const LoginPage = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [storeName, setStoreName] = useState('')
  const { login, loading, error } = useAuthStore()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!username || !password || !storeName) return
    await login(username, password, storeName)
  }

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-[400px] flex flex-col items-center gap-8">
        {/* Logo / Branding */}
        <div className="flex flex-col items-center gap-2">
          <div className="w-16 h-16 bg-accent-primary rounded-2xl flex items-center justify-center shadow-2xl shadow-accent-primary/20">
            <span className="text-bg-primary text-3xl font-display font-bold">A</span>
          </div>
          <h1 className="text-3xl font-display font-bold text-text-primary tracking-tight">
            Asha Granite
          </h1>
          <p className="text-text-secondary text-sm">Materials Management System</p>
        </div>

        {/* Login Form */}
        <div className="w-full bg-bg-surface p-8 rounded-[24px] border border-border shadow-xl">
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <Input
              label="Store Name"
              placeholder="e.g. jaipur_main"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value.toLowerCase())}
              required
            />
            <Input
              label="Username"
              placeholder="Your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {error && (
              <div className="bg-accent-danger/10 border border-accent-danger/20 text-accent-danger text-sm p-3 rounded-card text-center">
                {error}
              </div>
            )}

            <Button type="submit" disabled={loading}>
              {loading ? 'Logging in...' : (
                <>
                  <LogIn size={20} />
                  Login to Store
                </>
              )}
            </Button>
          </form>
        </div>

        <p className="text-text-disabled text-xs text-center mt-4">
          v1.0.0 — Authorized Access Only
        </p>
      </div>
    </div>
  )
}

export default LoginPage
