'use client'

import { Header } from '@/components/Header'
import { SpaceCard } from '@/components/SpaceCard'
import { RevenueAnalytics } from '@/components/RevenueAnalytics'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Plus, ExternalLink, ShieldCheck, TrendingUp, Users } from 'lucide-react'
import { Space } from '@/lib/supabase'
import { DashboardStat, RevenuePoint } from '@/lib/mockApi'

export function DashboardClient({
  spaces,
  stats,
  revenueData,
}: {
  spaces: Space[]
  stats: DashboardStat[]
  revenueData: RevenuePoint[]
}) {
  const [notification, setNotification] = useState<{ title: string; message: string } | null>(null)

  const handleHaptic = async () => {
    try {
      const WebApp = (await import('@twa-dev/sdk')).default
      WebApp.HapticFeedback.impactOccurred('light')
    } catch (e) {}
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

  return (
    <main className="min-h-screen bg-background pb-32">
      <Header />

      {notification && (
        <div className="fixed right-6 top-24 z-50 max-w-sm rounded-[32px] border border-slate-200 bg-slate-950/95 p-5 shadow-2xl shadow-slate-950/20 backdrop-blur-md text-white">
          <p className="text-xs uppercase tracking-[0.35em] text-slate-400">{notification.title}</p>
          <p className="mt-2 text-sm font-semibold">{notification.message}</p>
        </div>
      )}

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
                      <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-white/10 text-slate-100">
                        {index === 0 ? <TrendingUp className="h-4 w-4" /> : index === 1 ? <Users className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
                      </span>
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
              <h3 className="mt-4 text-xl font-semibold text-slate-950">Focus for the week</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">Launch the new membership tier for your top performing space and push engagement reminders to high-value members.</p>
            </div>
            <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm uppercase tracking-[0.32em] text-slate-500">Quick wins</p>
              <div className="mt-5 grid gap-3">
                <div className="rounded-3xl bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-slate-950">Best revenue day</p>
                  <p className="mt-2 text-sm text-slate-500">Sunday revenue was strongest at $625.</p>
                </div>
                <div className="rounded-3xl bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-slate-950">Top performing space</p>
                  <p className="mt-2 text-sm text-slate-500">Gaming Hub drove 48 new members this week.</p>
                </div>
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
                <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
                  <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Performance snapshot</p>
                  <p className="mt-4 text-2xl font-semibold text-slate-950">Momentum is accelerating</p>
                  <p className="mt-3 text-sm leading-6 text-slate-600">Revenue and member growth are both trending upward — exciting signals for your next launch.</p>
                  <div className="mt-6 grid gap-3">
                    <div className="flex items-center justify-between rounded-3xl bg-slate-50 p-4">
                      <span className="text-sm text-slate-600">Avg. revenue per day</span>
                      <strong className="text-slate-950">$1.38k</strong>
                    </div>
                    <div className="flex items-center justify-between rounded-3xl bg-slate-50 p-4">
                      <span className="text-sm text-slate-600">Engagement score</span>
                      <strong className="text-slate-950">82</strong>
                    </div>
                  </div>
                </div>
                <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Top channel</p>
                      <p className="mt-3 text-xl font-semibold text-slate-950">Gaming Hub</p>
                    </div>
                    <span className="rounded-3xl bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-emerald-700">Momentum</span>
                  </div>
                  <p className="mt-4 text-sm leading-6 text-slate-600">This space drove the strongest engagement and revenue this period.</p>
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
                      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <a
                          href={`https://t.me/${space.channel_link.replace(/^@/, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-white shadow-md p-2 rounded-full text-slate-950 hover:text-slate-600"
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
                    <p className="mt-3 text-2xl font-semibold text-slate-950">$2.45k</p>
                    <p className="mt-2 text-sm text-slate-500">March 12</p>
                  </div>
                  <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Best member surge</p>
                    <p className="mt-3 text-2xl font-semibold text-slate-950">70</p>
                    <p className="mt-2 text-sm text-slate-500">New members on March 12</p>
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
            <div className="grid gap-6 xl:grid-cols-[1.5fr_0.9fr]">
              <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-slate-950">Member engagement</h2>
                <p className="mt-2 text-sm text-slate-500">Keep your community active with member-focused signals.</p>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-400">New members</p>
                    <p className="mt-3 text-2xl font-semibold text-slate-950">55</p>
                    <p className="mt-2 text-sm text-slate-500">Joined in the last 7 days</p>
                  </div>
                  <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Churn rate</p>
                    <p className="mt-3 text-2xl font-semibold text-slate-950">3.2%</p>
                    <p className="mt-2 text-sm text-slate-500">Subscriber turnover this period</p>
                  </div>
                </div>
              </div>
              <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">Engagement highlights</h3>
                <div className="mt-6 space-y-4">
                  <div className="rounded-3xl bg-slate-50 p-4 border border-slate-200">
                    <p className="text-sm font-semibold text-slate-950">Peak interaction</p>
                    <p className="mt-2 text-sm text-slate-500">Sunday evening is the top engagement window.</p>
                  </div>
                  <div className="rounded-3xl bg-slate-50 p-4 border border-slate-200">
                    <p className="text-sm font-semibold text-slate-950">Retention score</p>
                    <p className="mt-2 text-sm text-slate-500">Customers are returning 4.6x per week.</p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}
