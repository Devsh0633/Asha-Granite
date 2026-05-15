import React, { useState, useEffect } from 'react'
import { supabase } from '../../supabase/client'
import { useAuthStore } from '../../stores/authStore'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Settings, Store, Users, CreditCard, Building2, Save, Plus } from 'lucide-react'

const SettingsPage = () => {
  const { employee } = useAuthStore()
  const [activeTab, setActiveTab] = useState('business')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)

  // Business Settings State
  const [businessData, setBusinessData] = useState({
    business_name: '',
    gst_number: '',
    upi_id: '',
    bank_name: '',
    bank_account_number: '',
    bank_ifsc: '',
    whatsapp_number: ''
  })

  useEffect(() => {
    fetchBusinessSettings()
  }, [])

  const fetchBusinessSettings = async () => {
    const { data, error } = await supabase
      .from('business_settings')
      .select('*')
      .single()
    
    if (data) setBusinessData(data)
  }

  const handleSaveBusiness = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    const { error } = await supabase
      .from('business_settings')
      .upsert({ ...businessData, updated_at: new Date() })

    if (error) {
      setMessage({ type: 'error', text: error.message })
    } else {
      setMessage({ type: 'success', text: 'Settings saved successfully!' })
    }
    setLoading(false)
  }

  const tabs = [
    { id: 'business', label: 'Business Info', icon: Building2 },
    { id: 'stores', label: 'Stores', icon: Store },
    { id: 'employees', label: 'Employees', icon: Users },
    { id: 'payments', label: 'Payments', icon: CreditCard },
  ]

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-display font-bold">Settings</h1>
        <div className="flex items-center gap-2 text-text-secondary text-sm bg-bg-surface px-4 py-2 rounded-full border border-border">
          <Settings size={16} />
          <span>Management Console</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border gap-8">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 pb-4 font-bold transition-all duration-200 border-b-2 ${
              activeTab === tab.id 
                ? 'border-accent-primary text-accent-primary' 
                : 'border-transparent text-text-secondary hover:text-text-primary'
            }`}
          >
            <tab.icon size={18} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="max-w-3xl">
        {activeTab === 'business' && (
          <form onSubmit={handleSaveBusiness} className="flex flex-col gap-6 bg-bg-surface p-8 rounded-card border border-border shadow-xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Business Name"
                value={businessData.business_name}
                onChange={(e) => setBusinessData({ ...businessData, business_name: e.target.value })}
                required
              />
              <Input
                label="GST Number"
                value={businessData.gst_number}
                onChange={(e) => setBusinessData({ ...businessData, gst_number: e.target.value })}
              />
              <Input
                label="WhatsApp Business Number"
                placeholder="+91..."
                value={businessData.whatsapp_number}
                onChange={(e) => setBusinessData({ ...businessData, whatsapp_number: e.target.value })}
              />
            </div>

            {message && (
              <div className={`p-4 rounded-card text-sm font-medium border ${
                message.type === 'success' ? 'bg-accent-success/10 border-accent-success/20 text-accent-success' : 'bg-accent-danger/10 border-accent-danger/20 text-accent-danger'
              }`}>
                {message.text}
              </div>
            )}

            <Button type="submit" disabled={loading} className="w-fit self-end px-12">
              {loading ? 'Saving...' : (
                <>
                  <Save size={18} />
                  Save Business Info
                </>
              )}
            </Button>
          </form>
        )}

        {activeTab === 'stores' && <StoreManager />}
        {activeTab === 'employees' && <EmployeeManager />}
        {activeTab === 'payments' && (
           <form onSubmit={handleSaveBusiness} className="flex flex-col gap-6 bg-bg-surface p-8 rounded-card border border-border shadow-xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="UPI ID"
                  placeholder="name@upi"
                  value={businessData.upi_id}
                  onChange={(e) => setBusinessData({ ...businessData, upi_id: e.target.value })}
                />
                <Input
                  label="Bank Name"
                  value={businessData.bank_name}
                  onChange={(e) => setBusinessData({ ...businessData, bank_name: e.target.value })}
                />
                <Input
                  label="Account Number"
                  value={businessData.bank_account_number}
                  onChange={(e) => setBusinessData({ ...businessData, bank_account_number: e.target.value })}
                />
                <Input
                  label="IFSC Code"
                  value={businessData.bank_ifsc}
                  onChange={(e) => setBusinessData({ ...businessData, bank_ifsc: e.target.value })}
                />
              </div>
              <Button type="submit" disabled={loading} className="w-fit self-end px-12">
                <Save size={18} /> Save Payment Details
              </Button>
           </form>
        )}
      </div>
    </div>
  )
}

// Store Management Component
const StoreManager = () => {
  const [stores, setStores] = useState([])
  const [newStore, setNewStore] = useState({ name: '', address: '', phone: '' })

  useEffect(() => { fetchStores() }, [])

  const fetchStores = async () => {
    const { data } = await supabase.from('stores').select('*').order('created_at')
    if (data) setStores(data)
  }

  const handleAddStore = async (e) => {
    e.preventDefault()
    const { error } = await supabase.from('stores').insert([newStore])
    if (!error) {
      setNewStore({ name: '', address: '', phone: '' })
      fetchStores()
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <form onSubmit={handleAddStore} className="bg-bg-surface p-6 rounded-card border border-border flex flex-col gap-4">
        <h3 className="font-bold flex items-center gap-2">
          <Plus size={18} className="text-accent-primary" />
          Add New Store
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input placeholder="Store Name" value={newStore.name} onChange={e => setNewStore({...newStore, name: e.target.value})} required />
          <Input placeholder="Phone" value={newStore.phone} onChange={e => setNewStore({...newStore, phone: e.target.value})} required />
          <Input placeholder="Address" value={newStore.address} onChange={e => setNewStore({...newStore, address: e.target.value})} required />
        </div>
        <Button type="submit" className="w-fit self-end px-8">Add Store</Button>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {stores.map(store => (
          <div key={store.id} className="bg-bg-surface p-6 rounded-card border border-border flex flex-col gap-1">
            <span className="text-accent-primary font-bold text-lg">{store.name}</span>
            <span className="text-text-secondary text-sm">{store.phone}</span>
            <span className="text-text-disabled text-xs mt-2 uppercase tracking-widest">{store.address}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// Employee Management Component (Placeholder logic)
const EmployeeManager = () => {
  return (
    <div className="bg-bg-surface p-8 rounded-card border border-border text-center">
      <p className="text-text-secondary mb-4">Employee creation requires linking to Supabase Auth.</p>
      <p className="text-sm text-text-disabled italic">Build this section next once the initial store is ready.</p>
    </div>
  )
}

export default SettingsPage
