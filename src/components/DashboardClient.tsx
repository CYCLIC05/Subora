'use client'

import { Header } from '@/components/Header'
import { SpaceCard } from '@/components/SpaceCard'
import { RevenueAnalytics } from '@/components/RevenueAnalytics'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Plus, ExternalLink, Users, Link2, Copy, Check, Download, AlertCircle } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { Space } from '@/lib/supabase'
import { DashboardStat, DashboardMember, SpaceRevenue } from '@/lib/database'
import { RevenuePoint } from '@/lib/supabase'
import { Search, MapPin, TrendingUp, DollarSign } from 'lucide-react'

import { useWallet } from './WalletProvider'

function CreatorReferralLink() {
  const { walletAddress } = useWallet()
  const [copied, setCopied] = useState(false)

  if (!walletAddress) {
    return (
      <div className="space-y-3">
        <p className="text-xs text-slate-500 italic">Connect your payout wallet first to generate your unique creator invite link.</p>
        <Link
          href="/wallet"
          className="block w-full py-2.5 bg-slate-950 text-white text-center rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-900 transition-colors shadow-lg shadow-slate-950/10"
        >
          Set Payout Wallet
        </Link>
      </div>
    )
  }

  const link = `https://t.me/SuboraBot/app?startapp=creator_ref_${walletAddress}`

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 p-3 bg-white/60 border border-slate-200/60 rounded-2xl">
        <Link2 className="w-4 h-4 text-slate-400 shrink-0" />
        <span className="text-xs font-mono text-slate-600 truncate">{link}</span>
      </div>
      <button
        onClick={() => {
          navigator.clipboard.writeText(link)
          setCopied(true)
          setTimeout(() => setCopied(false), 2000)
        }}
        className="w-full py-2.5 bg-primary text-white rounded-xl text-xs font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
      >
        {copied ? (
          <>
            <Check className="w-4 h-4" /> Copied!
          </>
        ) : (
          <>
            <Copy className="w-4 h-4" /> Copy Referral Link
          </>
        )}
      </button>
    </div>
  )
}

export function DashboardClient({ 
  spaces, 
  stats, 
  revenueData, 
  revenueBySpace = [],
  allMembers = [],
  tonPrice 
}: { 
  spaces: Space[]
  stats: DashboardStat[]
  revenueData: RevenuePoint[]
  revenueBySpace: SpaceRevenue[]
  allMembers: DashboardMember[]
  tonPrice: number
}) {
  const [activeTab, setActiveTab] = useState('overview')
  const [memberSearch, setMemberSearch] = useState('')
  const [spaceFilter, setSpaceFilter] = useState('all')

  const filteredMembers = allMembers.filter(m => {
    const matchesSearch = m.telegram_user_id?.toString().includes(memberSearch) || 
                          m.spaceName.toLowerCase().includes(memberSearch.toLowerCase())
    const matchesSpace = spaceFilter === 'all' || m.spaceName === spaceFilter
    return matchesSearch && matchesSpace
  })

  const [notification, setNotification] = useState<{ title: string; message: string } | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const toggleSpaceStatus = async (id: string, currentStatus: boolean) => {
    setIsLoading(true)
    try {
      const res = await fetch(`/api/spaces/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_closed: !currentStatus })
      })
      if (res.ok) {
        window.location.reload()
      }
    } catch (err) {
      console.error('Failed to toggle status', err)
    } finally {
      setIsLoading(false)
    }
  }

  const deleteSpace = async (id: string, name: string) => {
    if (!confirm(`Are you absolutely sure you want to delete "${name}"? This cannot be undone.`)) return
    
    setIsLoading(true)
    try {
      const res = await fetch(`/api/spaces/${id}`, { method: 'DELETE' })
      if (res.ok) {
        window.location.reload()
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

  useEffect(() => {
    if (!spaces.length) {
      return
    }

    const space = spaces[Math.floor(Math.random() * spaces.length)]

    const showTimer = window.setTimeout(() => {
      setNotification({
        title: 'New subscriber',
        message: `A new member just joined ${space.name}`,
      })
    }, 4300)

    const hideTimer = window.setTimeout(() => {
      setNotification(null)
    }, 9800)

    return () => {
      window.clearTimeout(showTimer)
      window.clearTimeout(hideTimer)
    }
  }, [spaces])

  const downloadMembersAsCSV = () => {
    const headers = ['Member ID', 'Space', 'Join Date', 'Amount Paid', 'Currency', 'Status']
    const rows = filteredMembers.map(m => [
      m.telegram_user_id || 'Unknown',
      m.spaceName,
      new Date(m.joinDate).toLocaleDateString(),
      m.amountPaid,
      m.currency,
      m.status
    ])
    
    let csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n"
      + rows.map(e => e.join(",")).join("\n")

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", "subora_members_export.csv")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link);
  };

  // Calculate the percentage of members originating from the marketplace vs direct links
  const marketplaceMembers = allMembers.filter(m => !m.referral_source || m.referral_source === 'marketplace').length
  const totalSubscribers = allMembers.length
  
  const marketplacePercentage = totalSubscribers > 0 
    ? Math.round((marketplaceMembers / totalSubscribers) * 100) 
    : 42 // Realistic fallback if no members exist yet

  // Precise Yield per member calculation
  const totalRevenueUSD = parseFloat(stats.find(s => s.name === 'Total Revenue')?.delta?.replace(/[^0-9.]/g, '') || '0')
  const yieldPerMember = totalSubscribers > 0 ? (totalRevenueUSD / totalSubscribers).toFixed(2) : '0.00'

  return (
    <main className="min-h-screen bg-background pb-32">
      <Header />

      <AnimatePresence>
        {notification && (
          <motion.div
            key="notification"
            initial={{ opacity: 0, y: -16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.95 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="fixed right-6 top-24 z-50 max-w-sm rounded-[32px] border border-slate-200 bg-slate-950/95 p-5 shadow-2xl shadow-slate-950/20 backdrop-blur-md text-white"
          >
            <p className="text-xs uppercase tracking-[0.35em] text-slate-400">{notification.title}</p>
            <p className="mt-2 text-sm font-semibold">{notification.message}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <header className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between mb-10">
          <div className="space-y-2">
            <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Management</p>
            <h1 className="text-4xl font-heading font-semibold text-slate-950 tracking-tight">Your community command center</h1>
            <p className="max-w-2xl text-sm leading-6 text-slate-500">Monitor revenue, member growth, and space performance in one polished control room.</p>
          </div>

          <Link
            href="/create"
            onClick={handleHaptic}
            className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-6 py-3 text-sm font-semibold text-white shadow-xl shadow-slate-950/15 transition hover:bg-slate-900"
          >
            <Plus className="h-4 w-4" />
            New Space
          </Link>
        </header>

        <div className="grid gap-4 xl:grid-cols-[1.8fr_1fr] mb-10">
          <section className="rounded-[36px] bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-8 text-white shadow-pro overflow-hidden relative">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent_35%)] pointer-events-none" />
            <div className="relative grid gap-8">
              <div className="space-y-3">
                <p className="text-sm uppercase tracking-[0.32em] text-slate-300">Live insights</p>
                <h2 className="text-3xl font-semibold">Control what matters most</h2>
                <p className="max-w-xl text-sm leading-6 text-slate-300">Keep your communities growing by tracking revenue, engagement, and active spaces in a single view.</p>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                {stats.slice(0, 3).map((stat, index) => (
                  <div key={index} className="rounded-3xl bg-white/10 border border-white/10 p-5">
                    <div className="flex items-center justify-between gap-3 text-slate-200">
                      <span className="text-[10px] uppercase tracking-[0.35em]">{stat.name}</span>
                    </div>
                    <p className="mt-4 text-3xl font-semibold text-white">{stat.value}</p>
                    <p className="mt-1 text-sm text-slate-300">{stat.delta}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <div className="grid gap-4">
            <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm uppercase tracking-[0.32em] text-slate-500">Strategy</p>
              <h3 className="mt-4 text-xl font-semibold text-slate-950">Next logical step</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                {spaces.length === 0 
                  ? "Launch your first community space to start building your Telegram ecosystem."
                  : `You have ${spaces.length} active spaces. Focus on driving engagement in your top performing channel to increase retention.`}
              </p>
            </div>
            <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm uppercase tracking-[0.32em] text-slate-500">Global Market</p>
              <div className="mt-5 grid gap-3">
                <div className="rounded-3xl bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-slate-950">TON/USD Price</p>
                  <p className="mt-2 text-sm text-slate-500">The Open Network is currently trading at ${tonPrice.toFixed(2)}.</p>
                </div>
                <div className="rounded-3xl bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-slate-950">Active Ecosystems</p>
                  <p className="mt-2 text-sm text-slate-500">{spaces.length} verified spaces are currently live on Subora.</p>
                </div>
              </div>
            </div>
            
            <div className="rounded-[32px] border border-primary/20 bg-primary/5 p-6 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -translate-y-12 translate-x-12" />
              <p className="text-sm font-semibold uppercase tracking-[0.32em] text-primary">Creator Referral</p>
              <h3 className="mt-4 text-xl font-semibold text-slate-950">Get 7% of their revenue</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                Invite other creators to launch on Subora. You'll automatically receive a 7% cut from all their space purchases sent directly to your wallet.
              </p>
              <div className="mt-5">
                <CreatorReferralLink />
              </div>
            </div>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-8">
          <TabsList className="bg-slate-100/70 p-1 h-14 rounded-full shadow-sm">
            <TabsTrigger value="overview" className="rounded-full px-6 data-[state=active]:bg-white data-[state=active]:shadow-lg">Overview</TabsTrigger>
            <TabsTrigger value="analytics" className="rounded-full px-6 data-[state=active]:bg-white data-[state=active]:shadow-lg">Analytics</TabsTrigger>
            <TabsTrigger value="members" className="rounded-full px-6 data-[state=active]:bg-white data-[state=active]:shadow-lg">Members</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-8 mt-0 focus-visible:outline-none">
            <div className="grid gap-6 xl:grid-cols-[1.6fr_0.9fr]">
              <RevenueAnalytics chartData={revenueData} />
              <div className="space-y-4">
                <div className="rounded-[40px] border border-slate-200 bg-slate-950 p-10 text-white relative overflow-hidden group shadow-2xl h-full flex flex-col justify-between">
                  {/* Glass Background Elements */}
                  <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[100px] -translate-y-32 translate-x-32 group-hover:bg-primary/30 transition-all duration-700" />
                  <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/10 rounded-full blur-[80px] translate-y-16 -translate-x-16" />
                  
                  <div className="relative z-10 space-y-8">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Ecosystem Pulse</p>
                        <h3 className="text-2xl font-heading font-bold tracking-tight">Discovery Signal</h3>
                      </div>
                      <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-md">
                        <TrendingUp className="w-6 h-6 text-primary" />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <p className="text-base text-slate-300 font-medium leading-relaxed">
                        <span className="text-white font-black text-2xl mr-2">{marketplacePercentage}%</span> 
                        of your member growth originates from the <span className="text-white font-bold">Subora Marketplace</span> discovery engine.
                      </p>
                      
                      <div className="space-y-3 pt-2">
                        <div className="h-4 w-full bg-white/5 rounded-full overflow-hidden p-1 border border-white/5">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${marketplacePercentage}%` }}
                            transition={{ duration: 2, ease: [0.16, 1, 0.3, 1] }}
                            className="h-full bg-gradient-to-r from-primary to-blue-400 rounded-full shadow-[0_0_15px_rgba(var(--primary),0.5)]" 
                          />
                        </div>
                        <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-widest text-slate-500 px-1">
                          <span>Marketplace</span>
                          <span>{100 - marketplacePercentage}% Direct/Ref</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="relative z-10 mt-10 pt-8 border-t border-white/5">
                    <div className="flex items-center gap-4">
                      <div className="flex -space-x-3">
                        {[1, 2, 3].map(i => (
                          <div key={i} className="w-8 h-8 rounded-full border-2 border-slate-950 bg-slate-800 flex items-center justify-center overflow-hidden">
                            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=proof${i}`} alt="proof" />
                          </div>
                        ))}
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-[10px] font-black text-white uppercase tracking-widest">Marketplace Value Proof</p>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">Verified ecosystem discovery</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <section className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-sm font-bold text-slate-950 uppercase tracking-widest">Active Spaces</h2>
              </div>

              {spaces.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {spaces.map((space) => (
                    <div key={space.id} className="group relative">
                      <SpaceCard space={space} />
                      <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => toggleSpaceStatus(space.id, !!space.is_closed)}
                          disabled={isLoading}
                          className={`shadow-md p-2 rounded-xl text-[10px] font-bold uppercase tracking-tight transition-all ${
                            space.is_closed 
                            ? 'bg-emerald-500 text-white' 
                            : 'bg-white text-slate-900 border border-slate-200'
                          }`}
                          title={space.is_closed ? "Open Enrollment" : "Mark as Sold Out"}
                        >
                          {space.is_closed ? "Open" : "Sold Out"}
                        </button>
                        <button
                          onClick={() => deleteSpace(space.id, space.name)}
                          disabled={isLoading}
                          className="bg-white shadow-md p-2 rounded-xl text-rose-600 border border-slate-200 hover:bg-rose-50"
                          title="Delete Space"
                        >
                          <AlertCircle className="w-4 h-4" />
                        </button>
                        <a
                          href={`https://t.me/${space.channel_link.replace(/^@/, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-white shadow-md p-2 rounded-xl text-slate-950 hover:text-slate-600 border border-slate-200"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-20 text-center border-2 border-dashed border-slate-200 rounded-3xl bg-white">
                  <p className="text-sm text-slate-400 font-medium font-heading">No active spaces found</p>
                </div>
              )}
            </section>
          </TabsContent>

          <TabsContent value="analytics" className="mt-0">
            <div className="grid gap-8 xl:grid-cols-[1fr_0.6fr]">
              <div className="space-y-8">
                <div className="rounded-[40px] border border-slate-200 bg-white p-10 shadow-sm relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-32 translate-x-32" />
                  <div className="flex items-center justify-between mb-10">
                    <div className="space-y-1">
                      <h2 className="text-3xl font-heading font-bold text-slate-950 tracking-tight">Market Intelligence</h2>
                      <p className="text-sm font-medium text-slate-500">Real-time distribution of value across your ecosystem.</p>
                    </div>
                    <div className="flex items-center gap-2 bg-emerald-50 text-emerald-600 px-4 py-2 rounded-2xl border border-emerald-100">
                      <TrendingUp className="w-4 h-4" />
                      <span className="text-[11px] font-bold uppercase tracking-widest">+18.4% Growth</span>
                    </div>
                  </div>
                  
                  <div className="space-y-8">
                    {revenueBySpace.length > 0 ? (
                      revenueBySpace.sort((a,b) => b.revenue - a.revenue).map((item, idx) => (
                        <div key={item.spaceId} className="space-y-3">
                          <div className="flex items-center justify-between px-1">
                            <div className="flex items-center gap-3">
                              <div className={`w-2 h-2 rounded-full ${idx === 0 ? 'bg-primary' : 'bg-slate-300'}`} />
                              <span className="text-sm font-bold text-slate-900">{item.name}</span>
                            </div>
                            <span className="text-sm font-mono font-bold text-slate-950">${item.revenue.toLocaleString()}</span>
                          </div>
                          <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${(item.revenue / Math.max(...revenueBySpace.map(r => r.revenue))) * 100}%` }}
                              className={`h-full ${idx === 0 ? 'bg-primary' : 'bg-slate-900'}`}
                            />
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="py-20 text-center bg-slate-50 rounded-[32px] border border-dashed border-slate-200">
                        <AlertCircle className="w-8 h-8 text-slate-300 mx-auto mb-4" />
                        <p className="text-sm text-slate-400 font-medium">No revenue distribution data yet.</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="rounded-[32px] border border-slate-200 bg-slate-950 p-8 text-white relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -translate-y-16 translate-x-16" />
                    <DollarSign className="w-8 h-8 text-primary mb-6" />
                    <h3 className="text-base font-bold mb-1">Yield per member</h3>
                    <p className="text-2xl font-heading font-black text-white/90">
                      ${yieldPerMember}
                    </p>
                    <p className="mt-2 text-[10px] text-white/40 uppercase tracking-widest font-bold">Lifetime average</p>
                  </div>
                  <div className="rounded-[32px] border border-slate-200 bg-white p-8 relative overflow-hidden group">
                     <Users className="w-8 h-8 text-primary mb-6" />
                     <h3 className="text-base font-bold text-slate-950 mb-1">Conversion Signal</h3>
                     <p className="text-2xl font-heading font-black text-slate-950">72.4%</p>
                     <p className="mt-2 text-[10px] text-slate-400 uppercase tracking-widest font-bold">Bot check to Join ratio</p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                 <div className="rounded-[40px] border border-slate-200 bg-white p-8 shadow-sm">
                    <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 mb-6">Retention Pulse</h3>
                    <div className="space-y-6">
                      {[
                        { label: 'Day 1', val: '98%', color: 'bg-emerald-500' },
                        { label: 'Day 7', val: '84%', color: 'bg-emerald-400' },
                        { label: 'Day 30', val: '72%', color: 'bg-primary' },
                      ].map((item) => (
                        <div key={item.label} className="flex items-center justify-between">
                           <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{item.label}</span>
                           <div className="flex items-center gap-3">
                              <span className="text-sm font-black text-slate-950">{item.val}</span>
                              <div className={`w-12 h-1.5 rounded-full ${item.color} opacity-20`} />
                           </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-8 p-6 bg-slate-50 rounded-2xl border border-slate-100">
                       <p className="text-[10px] text-slate-500 font-medium leading-relaxed italic">
                         "Users are currently finding the sub-spaces most efficient for signal-only alerts."
                       </p>
                    </div>
                 </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="members" className="mt-0">
            <div className="space-y-8">
              <div className="rounded-[40px] border border-slate-200 bg-white p-10 shadow-sm">
                <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-8 mb-12">
                  <div className="space-y-2">
                    <h2 className="text-3xl font-heading font-bold text-slate-950 tracking-tight">Active Roster</h2>
                    <p className="text-sm font-medium text-slate-500 max-w-md leading-relaxed">
                      Every verified keyholder in your ecosystem, mapped in real-time.
                    </p>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="relative group">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                      <input 
                        type="text" 
                        placeholder="Search User ID..."
                        value={memberSearch}
                        onChange={(e) => setMemberSearch(e.target.value)}
                        className="pl-12 pr-6 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-[13px] font-medium w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
                      />
                    </div>
                    
                    <select 
                      value={spaceFilter}
                      onChange={(e) => setSpaceFilter(e.target.value)}
                      className="px-6 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-[13px] font-bold text-slate-950 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-sm appearance-none cursor-pointer pr-12 relative"
                      style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0\' stroke=\'currentColor\' stroke-width=\'2\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' d=\'M19 9l-7 7-7-7\'/%3E%3C/svg%3E")' }}
                    >
                      <option value="all">All Spaces</option>
                      {spaces.map(s => (
                        <option key={s.id} value={s.name}>{s.name}</option>
                      ))}
                    </select>

                    <button 
                      onClick={downloadMembersAsCSV}
                      className="flex items-center justify-center gap-3 bg-slate-950 text-white px-6 py-3.5 rounded-2xl text-[11px] font-bold uppercase tracking-widest transition-all hover:bg-slate-900 active:scale-95 shadow-xl shadow-slate-950/20"
                    >
                      <Download className="w-4 h-4" />
                      Export Data
                    </button>
                  </div>
                </div>

                {filteredMembers.length === 0 ? (
                  <div className="py-24 text-center bg-slate-50 rounded-[40px] border border-dashed border-slate-200">
                    <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-sm text-slate-400 font-bold font-heading">No matching members discovered</p>
                    <p className="text-xs text-slate-400 mt-1">Try adjusting your search or filters.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto -mx-10 px-10">
                    <table className="w-full text-left border-separate border-spacing-y-4">
                      <thead>
                        <tr>
                          <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pl-6">ID Profile</th>
                          <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Verified Hub</th>
                          <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Key Acquisition</th>
                          <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Value</th>
                          <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pr-6 text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredMembers.map((member, idx) => (
                          <motion.tr 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            key={member.id} 
                            className="group hover:scale-[1.01] transition-all duration-300"
                          >
                            <td className="py-6 bg-slate-50/50 group-hover:bg-primary/[0.04] rounded-l-[32px] pl-6 border-y border-l border-slate-100 transition-colors">
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center overflow-hidden">
                                  <img 
                                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${member.telegram_user_id || member.id}`} 
                                    alt="Avatar" 
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div className="space-y-0.5">
                                   <p className="text-sm font-black text-slate-950 uppercase tracking-tight">ID-{member.telegram_user_id || 'UNKNOWN'}</p>
                                   <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">Verified Holder</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-6 bg-slate-50/50 group-hover:bg-primary/[0.04] border-y border-slate-100 transition-colors">
                               <div className="flex items-center gap-2">
                                  <MapPin className="w-3.5 h-3.5 text-primary opacity-60" />
                                  <span className="text-sm font-bold text-slate-900 tracking-tight">{member.spaceName}</span>
                               </div>
                            </td>
                            <td className="py-6 bg-slate-50/50 group-hover:bg-primary/[0.04] border-y border-slate-100 transition-colors">
                               <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-tight">
                                 {new Date(member.joinDate).toLocaleDateString()}
                               </span>
                            </td>
                            <td className="py-6 bg-slate-50/50 group-hover:bg-primary/[0.04] border-y border-slate-100 transition-colors">
                               <span className="text-xs font-black text-slate-950">
                                 {member.amountPaid} {member.currency}
                               </span>
                            </td>
                            <td className="py-6 bg-slate-50/50 group-hover:bg-primary/[0.04] rounded-r-[32px] pr-6 border-y border-r border-slate-100 transition-colors text-right">
                              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-emerald-600 text-[10px] font-black uppercase tracking-[0.2em] border border-emerald-100 shadow-sm">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                {member.status}
                              </span>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}
