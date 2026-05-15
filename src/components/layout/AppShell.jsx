import React from 'react'
import { Outlet, NavLink } from 'react-router-dom'
import { Home, Package, PlusCircle, List, User } from 'lucide-react'
import { useAuthStore } from '../../stores/authStore'

const AppShell = () => {
  const { employee } = useAuthStore()
  
  // Tabs for Manager role
  const managerTabs = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: Package, label: 'Inventory', path: '/inventory' },
    { icon: PlusCircle, label: 'New Sale', path: '/sale', highlight: true },
    { icon: List, label: 'My Sales', path: '/my-sales' },
    { icon: User, label: 'Profile', path: '/profile' },
  ]

  return (
    <div className="min-h-screen bg-bg-primary pb-24 lg:pb-0 lg:pl-64">
      {/* Top Header */}
      <header className="h-16 border-b border-border bg-bg-surface flex items-center justify-between px-6 sticky top-0 z-40">
        <div className="flex flex-col">
          <span className="text-xs text-text-secondary uppercase tracking-widest font-bold">
            {employee?.role || 'User'}
          </span>
          <span className="text-text-primary font-bold">
            {employee?.name || 'Loading...'}
          </span>
        </div>
        <div className="flex items-center gap-3">
           <div className="w-8 h-8 rounded-full bg-accent-primary flex items-center justify-center text-bg-primary font-bold">
             {employee?.name?.[0]}
           </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6 max-w-7xl mx-auto">
        <Outlet />
      </main>

      {/* Bottom Nav (Mobile/Manager) */}
      <nav className="fixed bottom-0 left-0 right-0 h-20 bg-bg-surface border-t border-border px-6 flex items-center justify-between z-50 lg:hidden">
        {managerTabs.map((tab) => (
          <NavLink
            key={tab.path}
            to={tab.path}
            className={({ isActive }) => `
              flex flex-col items-center gap-1 transition-all duration-200
              ${tab.highlight ? 'relative -top-6' : ''}
              ${isActive ? 'text-accent-primary' : 'text-text-secondary'}
            `}
          >
            {tab.highlight ? (
              <div className="w-14 h-14 rounded-full bg-accent-primary flex items-center justify-center shadow-lg shadow-accent-primary/40 text-bg-primary">
                <tab.icon size={28} />
              </div>
            ) : (
              <tab.icon size={24} />
            )}
            <span className={`text-[10px] font-bold uppercase tracking-wider ${tab.highlight ? 'mt-7' : ''}`}>
              {tab.label}
            </span>
          </NavLink>
        ))}
      </nav>

      {/* Desktop Sidebar (Optional, but good for owner/large screens) */}
      <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-64 bg-bg-surface border-r border-border flex-col p-6 z-50">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 bg-accent-primary rounded-xl flex items-center justify-center font-display font-bold text-bg-primary text-xl">A</div>
          <span className="font-display font-bold text-xl text-text-primary tracking-tight">Asha Granite</span>
        </div>
        
        <div className="flex flex-col gap-2 flex-1">
           {managerTabs.map((tab) => (
             <NavLink
               key={tab.path}
               to={tab.path}
               className={({ isActive }) => `
                 flex items-center gap-3 px-4 py-3 rounded-card transition-all duration-200
                 ${isActive ? 'bg-accent-primary/10 text-accent-primary' : 'text-text-secondary hover:bg-bg-elevated hover:text-text-primary'}
               `}
             >
               <tab.icon size={20} />
               <span className="font-bold">{tab.label}</span>
             </NavLink>
           ))}
        </div>
      </aside>
    </div>
  )
}

export default AppShell
