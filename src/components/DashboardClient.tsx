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
import { DashboardStat } from '@/lib/mockApi'
import { RevenuePoint } from '@/lib/supabase'

import { useMockWallet } from './WalletProvider'

function CreatorReferralLink() {
  const { walletAddress, isConnecting, connectWallet } = useMockWallet()
  const [copied, setCopied] = useState(false)


  if (!walletAddress) {
    return (
      <div className="space-y-3">
        <p className="text-xs text-slate-500">Connect your wallet first to generate your unique creator invite link.</p>
        <button
          onClick={connectWallet}
          disabled={isConnecting}
          className="w-full py-2.5 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 disabled:opacity-70 transition-colors"
        >
          {isConnecting ? 'Connecting...' : 'Connect Mock Wallet'}
        </button>
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
  tonPrice,
}: {
  spaces: Space[]
  stats: DashboardStat[]
  revenueData: RevenuePoint[]
  tonPrice: number
}) {
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
    const allMembers = spaces.flatMap(space =>
      Array.from({ length: Math.min(space.subscribers, 5) }).map((_, i) => ({
        id: `USER_${Math.floor(1000000 + Math.random() * 9000000)}`,
        spaceName: space.name,
        date: new Date(Date.now() - Math.random() * 1000 * 60 * 60 * 24 * 7).toLocaleDateString(),
        status: 'Active'
      }))
    )

    const csvContent = "data:text/csv;charset=utf-8," 
      + "Member ID,Space Name,Joined Date,Status\n"
      + allMembers.map(m => `${m.id},${m.spaceName},${m.date},${m.status}`).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "subora_members_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
                <div className="rounded-[32px] border border-slate-200 bg-slate-950 p-8 text-white relative overflow-hidden group shadow-xl h-full">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-transparent opacity-50" />
                  <div className="relative z-10">
                    <h3 className="text-xl font-bold mb-2">Discovery Pulse</h3>
                    <p className="text-sm text-slate-400 font-medium leading-relaxed mb-6">
                      <span className="text-primary font-bold">42%</span> of your recent members found you through the <span className="text-white">Subora Marketplace</span>.
                    </p>
                    <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: "42%" }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className="h-full bg-primary" 
                      />
                    </div>
                    <p className="mt-4 text-[10px] text-slate-500 uppercase tracking-widest font-bold">Marketplace Value Proof</p>
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
            <div className="grid gap-6 xl:grid-cols-[1.5fr_0.9fr]">
              <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-slate-950">Market insights</h2>
                <p className="mt-2 text-sm text-slate-500">Understand the forces shaping revenue and retention this month.</p>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Peak revenue day</p>
                    <p className="mt-3 text-2xl font-semibold text-slate-950">
                      {revenueData.length > 0 ? `${Math.max(...revenueData.map(p => p.revenue)).toLocaleString()} Stars` : "0"}
                    </p>
                    <p className="mt-2 text-sm text-slate-500">
                      {revenueData.length > 0 ? new Date([...revenueData].sort((a,b) => b.revenue - a.revenue)[0].date).toLocaleDateString() : "No data"}
                    </p>
                  </div>
                  <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Total member base</p>
                    <p className="mt-3 text-2xl font-semibold text-slate-950">
                      {spaces.reduce((sum, s) => sum + (s.subscribers || 0), 0).toLocaleString()}
                    </p>
                    <p className="mt-2 text-sm text-slate-500">Active across all spaces</p>
                  </div>
                </div>
              </div>
              <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">Runner-up metrics</h3>
                <div className="mt-6 space-y-4">
                  <div className="rounded-3xl bg-slate-50 p-4 border border-slate-200">
                    <p className="text-sm font-semibold text-slate-950">Retention signal</p>
                    <p className="mt-2 text-sm text-slate-500">70% of followers remain active after one week.</p>
                  </div>
                  <div className="rounded-3xl bg-slate-50 p-4 border border-slate-200">
                    <p className="text-sm font-semibold text-slate-950">Revenue concentration</p>
                    <p className="mt-2 text-sm text-slate-500">Top 3 spaces contribute 68% of earnings.</p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="members" className="mt-0">
            <div className="space-y-6">
              <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                  <div className="space-y-1">
                    <h2 className="text-2xl font-semibold text-slate-950">Active Subscribers</h2>
                    <p className="text-sm text-slate-500">Real-time pulse of every member across your verified spaces.</p>
                  </div>
                  <button 
                    onClick={downloadMembersAsCSV}
                    className="flex items-center justify-center gap-2 bg-slate-50 border border-slate-200 px-5 py-2.5 rounded-2xl text-[11px] font-bold uppercase tracking-widest transition-all hover:bg-slate-100 active:scale-95"
                  >
                    <Download className="w-4 h-4" />
                    Export to CSV
                  </button>
                </div>

                {spaces.length === 0 ? (
                  <div className="py-12 text-center bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                    <p className="text-sm text-slate-400 font-medium font-heading">Launch a space to see your member roster</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto -mx-8 px-8">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-100">
                          <th className="pb-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-4">Member ID</th>
                          <th className="pb-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Space Name</th>
                          <th className="pb-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Joined</th>
                          <th className="pb-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest pr-4 text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {spaces.flatMap(space => 
                          // Mocking members based on subscriber count for visual until real members bridge
                          Array.from({ length: Math.min(space.subscribers, 5) }).map((_, i) => ({
                            id: `USER_${Math.floor(1000000 + Math.random() * 9000000)}`,
                            spaceName: space.name,
                            date: new Date(Date.now() - Math.random() * 1000 * 60 * 60 * 24 * 7).toLocaleDateString(),
                            status: 'Active'
                          }))
                        ).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((member, idx) => (
                          <tr key={idx} className="group hover:bg-slate-50/50 transition-colors">
                            <td className="py-5 text-sm font-semibold text-slate-900 pl-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-[10px] text-primary font-bold">
                                  {member.id.substring(5, 7)}
                                </div>
                                {member.id}
                              </div>
                            </td>
                            <td className="py-5 text-sm text-slate-500 font-medium">{member.spaceName}</td>
                            <td className="py-5 text-sm text-slate-500 font-medium">{member.date}</td>
                            <td className="py-5 text-right pr-4">
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase tracking-widest border border-emerald-100">
                                <div className="w-1 h-1 rounded-full bg-emerald-600 animate-pulse" />
                                {member.status}
                              </span>
                            </td>
                          </tr>
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
