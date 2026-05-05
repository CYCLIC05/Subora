'use client'

import { Header } from '@/components/Header'
import { SpaceCard } from '@/components/SpaceCard'
import Link from 'next/link'
import { useState } from 'react'
import { Plus, Trash2, AlertCircle, Edit2, X, Save } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Space } from '@/lib/supabase'
import { toast } from 'sonner'
import { RevenueAnalytics } from './RevenueAnalytics'
import { LivePulse } from './LivePulse'
import { PayoutSection } from './PayoutSection'

export function DashboardClient({ 
  spaces, 
  revenueData,
  allMembers = [],
  transactions = [],
  payoutData,
  tonPrice
}: { 
  spaces: Space[]
  revenueData?: any
  allMembers?: any[]
  transactions?: any[]
  payoutData?: any
  tonPrice?: number
}) {
  const [localSpaces, setLocalSpaces] = useState(spaces)
  const [isLoading, setIsLoading] = useState(false)
  const [editingSpace, setEditingSpace] = useState<Space | null>(null)
  const [editForm, setEditForm] = useState({ name: '', description: '', category: '' })

  const startEditing = (space: Space) => {
    setEditingSpace(space)
    setEditForm({
      name: space.name,
      description: space.description || '',
      category: space.category || ''
    })
  }

  const saveEdit = async () => {
    if (!editingSpace) return
    setIsLoading(true)
    try {
      const WebApp = (await import('@twa-dev/sdk')).default
      const res = await fetch(`/api/spaces/${editingSpace.id}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'x-telegram-init-data': WebApp.initData
        },
        body: JSON.stringify(editForm)
      })
      if (res.ok) {
        toast.success('Space updated successfully')
        setLocalSpaces(prev => prev.map(s => 
          s.id === editingSpace.id 
            ? { ...s, ...editForm } 
            : s
        ))
        setEditingSpace(null)
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to update space')
      }
    } catch (err) {
      console.error('Edit failed', err)
      toast.error('Network error during update')
    } finally {
      setIsLoading(false)
      setEditingSpace(null)
    }
  }



  const deleteSpace = async (id: string, name: string) => {
    if (!confirm(`Are you absolutely sure you want to delete "${name}"? This cannot be undone.`)) return
    
    setIsLoading(true)
    try {
      const WebApp = (await import('@twa-dev/sdk')).default
      const res = await fetch(`/api/spaces/${id}`, { 
        method: 'DELETE',
        headers: {
          'x-telegram-init-data': WebApp.initData
        }
      })
      if (res.ok) {
        toast.success('Space deleted')
        setLocalSpaces(prev => prev.filter(s => s.id !== id))
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to delete space')
      }
    } catch (err) {
      console.error('Failed to delete space', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleHaptic = async () => {
    try {
      const WebApp = (await import('@twa-dev/sdk')).default
      WebApp.HapticFeedback.impactOccurred('light')
    } catch (error) {
      console.warn('Haptic feedback unavailable', error)
    }
  }

  return (
    <main className="min-h-screen bg-background pb-32">
      <Header />

      <div className="container mx-auto px-6 py-12 max-w-4xl space-y-12">
        
        <header className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between border-b border-slate-100 pb-8">
          <div className="space-y-1">
            <h1 className="text-3xl font-heading font-semibold text-slate-950 tracking-tight">Creator Dashboard</h1>
            <p className="text-sm text-slate-500 font-medium">Manage your communities and track your TON monetization rails.</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                toast.info('TON payments are instantly sent to your wallet. For Stars withdrawals, please use the Subora Bot.', {
                  action: {
                    label: 'Open Bot',
                    onClick: () => window.open('https://t.me/SuboraBot', '_blank')
                  },
                  duration: 6000,
                })
              }}
              className="inline-flex items-center gap-2 rounded-2xl bg-slate-100 px-6 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-200"
            >
              Withdraw
            </button>
            <button
              onClick={async () => {
                const WebApp = (await import('@twa-dev/sdk')).default
                const username = WebApp.initDataUnsafe?.user?.username || String(WebApp.initDataUnsafe?.user?.id)
                const shareText = encodeURIComponent("Launch your own premium community on Subora 🚀")
                const shareUrl = `https://t.me/share/url?url=https://t.me/SuboraBot?start=ref_${username}&text=${shareText}`
                WebApp.openTelegramLink(shareUrl)
                handleHaptic()
              }}
              className="inline-flex items-center gap-2 rounded-2xl bg-white border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
            >
              Share App
            </button>
            <Link
              href="/create"
              onClick={handleHaptic}
              className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-6 py-3 text-sm font-semibold text-white shadow-xl shadow-slate-950/15 transition hover:bg-slate-900"
            >
              <Plus className="h-4 w-4" />
              Create Space
            </Link>
          </div>
        </header>

        {/* Payout Section - Front and Center */}
        <PayoutSection 
          transactions={transactions} 
          payoutData={payoutData}
          tonPrice={tonPrice}
          isLoading={isLoading}
        />

        {/* Analytics Section */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <RevenueAnalytics chartData={revenueData} />
          </div>
          <div className="lg:col-span-1">
            <LivePulse members={allMembers} />
          </div>
        </section>

        <section className="space-y-8 max-w-3xl mx-auto">
          {/* Referral Program Card */}
          <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-[32px] p-8 text-white shadow-2xl shadow-indigo-500/20 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl group-hover:scale-110 transition-transform duration-700" />
            <div className="relative z-10 space-y-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                  <h3 className="text-2xl font-heading font-black tracking-tight">Refer & Earn</h3>
                  <p className="text-indigo-100 text-sm font-medium max-w-[280px]">
                    Share Subora with creators. You earn 7% of every subscription they generate, paid instantly to your wallet.
                  </p>
                </div>
                <div className="flex gap-4">
                  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 text-center min-w-[110px] border border-white/10">
                    <p className="text-[10px] font-black uppercase tracking-widest text-indigo-200 mb-1">Total Referrals</p>
                    <p className="text-2xl font-black">{allMembers.filter(m => m.referral_source === (window.Telegram?.WebApp?.initDataUnsafe?.user?.username || String(window.Telegram?.WebApp?.initDataUnsafe?.user?.id))).length}</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 text-center min-w-[110px] border border-white/10">
                    <p className="text-[10px] font-black uppercase tracking-widest text-indigo-200 mb-1">Est. Earnings</p>
                    <p className="text-2xl font-black text-emerald-300">
                      {(allMembers.filter(m => m.referral_source === (window.Telegram?.WebApp?.initDataUnsafe?.user?.username || String(window.Telegram?.WebApp?.initDataUnsafe?.user?.id))).reduce((sum, m) => sum + (m.amountPaid * 0.07), 0)).toFixed(1)} <span className="text-xs">TON</span>
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-[10px] font-black uppercase tracking-widest text-indigo-200 ml-1">Your Unique Invite Link</p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl px-5 py-4 flex items-center justify-between overflow-hidden">
                    <span className="text-xs font-mono font-medium truncate opacity-90">
                      t.me/SuboraBot?start=ref_{(typeof window !== 'undefined' && window.Telegram?.WebApp?.initDataUnsafe?.user?.username) || (typeof window !== 'undefined' && window.Telegram?.WebApp?.initDataUnsafe?.user?.id) || 'user'}
                    </span>
                  </div>
                  <button
                    onClick={async () => {
                      const username = window.Telegram?.WebApp?.initDataUnsafe?.user?.username || String(window.Telegram?.WebApp?.initDataUnsafe?.user?.id)
                      const link = `https://t.me/SuboraBot?start=ref_${username}`
                      navigator.clipboard.writeText(link)
                      toast.success('Referral link copied!')
                      handleHaptic()
                    }}
                    className="bg-white text-indigo-600 px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-indigo-50 transition-all active:scale-95 shadow-xl shadow-black/10"
                  >
                    Copy Link
                  </button>
                </div>
              </div>

              {/* Recent Referrals List */}
              {allMembers.filter(m => m.referral_source === (window.Telegram?.WebApp?.initDataUnsafe?.user?.username || String(window.Telegram?.WebApp?.initDataUnsafe?.user?.id))).length > 0 && (
                <div className="pt-4 border-t border-white/10 space-y-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-indigo-200">Recent Referrals</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {allMembers
                      .filter(m => m.referral_source === (window.Telegram?.WebApp?.initDataUnsafe?.user?.username || String(window.Telegram?.WebApp?.initDataUnsafe?.user?.id)))
                      .slice(0, 4)
                      .map((ref, idx) => (
                        <div key={idx} className="bg-white/5 rounded-xl p-3 flex items-center justify-between border border-white/5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-[10px] font-black">
                              {ref.spaceName?.charAt(0) || 'S'}
                            </div>
                            <div className="min-w-0">
                              <p className="text-[11px] font-bold truncate">{ref.spaceName}</p>
                              <p className="text-[9px] text-indigo-200 opacity-70">Joined {new Date(ref.joinDate).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <div className="text-right">
                             <p className="text-[10px] font-black text-emerald-300">+{ (ref.amountPaid * 0.07).toFixed(2) } TON</p>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {localSpaces.length > 0 ? (
            <div className="flex flex-col rounded-[24px] bg-white border border-slate-100 overflow-hidden shadow-sm">
              {localSpaces.map((space) => (
                <div key={space.id} className="group relative">
                  <SpaceCard space={space} />
                  
                  {/* Hover Actions */}
                  <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">

                    <button
                      onClick={() => startEditing(space)}
                      className="bg-white shadow-md p-2 rounded-xl text-slate-950 border border-slate-200 hover:bg-slate-50 transition-colors"
                      title="Edit Space"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteSpace(space.id, space.name)}
                      disabled={isLoading}
                      className="bg-white shadow-md p-2 rounded-xl text-rose-600 border border-slate-200 hover:bg-rose-50 transition-colors"
                      title="Delete Space"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-24 flex flex-col items-center justify-center text-center space-y-6 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[32px]">
              <div className="space-y-2">
                <p className="text-lg font-heading font-semibold text-slate-950">No spaces yet</p>
                <p className="text-sm text-slate-500 font-medium">Launch your first community to get started.</p>
              </div>
              <Link
                href="/create"
                onClick={handleHaptic}
                className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-6 py-3 text-sm font-semibold text-white shadow-xl shadow-slate-950/15 transition hover:bg-slate-900"
              >
                <Plus className="h-4 w-4" />
                Create Space
              </Link>
            </div>
          )}
        </section>

      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {editingSpace && (
          <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm">
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="w-full max-w-lg bg-white rounded-t-[40px] sm:rounded-[40px] p-8 shadow-2xl space-y-6"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-heading font-bold text-slate-950 uppercase tracking-tight">Edit Space</h2>
                <button 
                  onClick={() => setEditingSpace(null)}
                  className="p-2 rounded-full hover:bg-slate-100 text-slate-400"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Community Name</label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full rounded-2xl border border-slate-200 p-4 text-sm font-medium focus:ring-4 focus:ring-primary/10 focus:border-primary/30 outline-none transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Description</label>
                  <textarea
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    rows={3}
                    className="w-full rounded-2xl border border-slate-200 p-4 text-sm font-medium focus:ring-4 focus:ring-primary/10 focus:border-primary/30 outline-none transition-all resize-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Category</label>
                  <select
                    value={editForm.category}
                    onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                    className="w-full rounded-2xl border border-slate-200 p-4 text-sm font-medium focus:ring-4 focus:ring-primary/10 focus:border-primary/30 outline-none transition-all appearance-none bg-white"
                  >
                    <option value="Crypto Alpha">Crypto Alpha</option>
                    <option value="Trading">Trading</option>
                    <option value="Lifestyle">Lifestyle</option>
                    <option value="Education">Education</option>
                    <option value="Technical">Technical</option>
                  </select>
                </div>
              </div>

              <button
                onClick={saveEdit}
                disabled={isLoading}
                className="w-full bg-slate-950 text-white py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-xl shadow-slate-950/10 hover:bg-slate-900 transition-all flex items-center justify-center gap-2"
              >
                {isLoading ? 'Saving Changes...' : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Settings
                  </>
                )}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  )
}
