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

export function DashboardClient({ 
  spaces, 
  revenueData,
  allMembers = []
}: { 
  spaces: Space[]
  revenueData?: any
  allMembers?: any[]
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
            <h1 className="text-3xl font-heading font-semibold text-slate-950 tracking-tight">Your Spaces</h1>
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

        {/* Analytics Section */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <RevenueAnalytics chartData={revenueData} />
          </div>
          <div className="lg:col-span-1">
            <LivePulse members={allMembers} />
          </div>
        </section>

        <section className="space-y-8">
          {localSpaces.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
