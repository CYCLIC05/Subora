'use client'

import { Header } from '@/components/Header'
import { AdminData } from '@/lib/database'
import { Search, CreditCard, Users, TrendingUp, Clock, ExternalLink, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { useEffect, useState } from 'react'

const AUTHORIZED_ADMINS = [
  612745678, // Placeholder: User should add their ID here
  565789012, 
]

export function AdminDashboard({ data }: { data: AdminData }) {
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const WebApp = (await import('@twa-dev/sdk')).default
        const userId = WebApp.initDataUnsafe?.user?.id
        
        // In production, you would fetch this list from an env var or DB
        if (userId && AUTHORIZED_ADMINS.includes(userId)) {
          setIsAuthorized(true)
        } else {
          setIsAuthorized(false)
        }
      } catch (err) {
        setIsAuthorized(false)
      }
    }
    checkAuth()
  }, [])

  if (isAuthorized === null) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    )
  }

  if (isAuthorized === false) {
    return (
      <main className="min-h-screen bg-slate-950 flex items-center justify-center p-8 text-center">
        <div className="max-w-md space-y-6">
          <div className="w-20 h-20 bg-rose-500/10 rounded-3xl flex items-center justify-center mx-auto text-rose-500 border border-rose-500/20">
             <AlertCircle className="w-10 h-10" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-heading font-black text-white uppercase tracking-tight">Access Restricted</h1>
            <p className="text-slate-400 font-medium">This terminal is restricted to Subora core maintainers. If you are the owner, please add your Telegram ID to the authorization list.</p>
          </div>
          <Link href="/" className="inline-block px-8 py-4 bg-white text-slate-950 rounded-2xl text-[11px] font-black uppercase tracking-widest">
            Return to Safety
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#F8FAFC] pb-32">
      <Header />
      
      <div className="container mx-auto px-6 py-12 max-w-6xl space-y-12">
        <header className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 text-[10px] font-black text-white uppercase tracking-widest">
            System Admin
          </div>
          <h1 className="text-4xl font-heading font-black text-slate-900 tracking-tight">Validation Pulse</h1>
          <p className="text-sm font-medium text-slate-500">Real-time monitoring of marketplace demand and payment success.</p>
        </header>

        {/* Global KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { label: 'Ecosystem Revenue', value: `$${data.globalStats.totalRevenue.toLocaleString()}`, icon: CreditCard, color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { label: 'Total Memberships', value: data.globalStats.totalMembers.toLocaleString(), icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Live Spaces', value: data.globalStats.totalSpaces.toLocaleString(), icon: TrendingUp, color: 'text-indigo-600', bg: 'bg-indigo-50' }
          ].map((stat, i) => (
            <div key={i} className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm space-y-4">
              <div className={`w-12 h-12 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{stat.label}</p>
                <p className="text-3xl font-black text-slate-900">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Search Trends */}
          <section className="space-y-6">
            <div className="flex items-center gap-3">
               <Search className="w-5 h-5 text-slate-400" />
               <h2 className="text-xl font-heading font-black text-slate-900 uppercase tracking-tight">Search Trends</h2>
            </div>
            <div className="bg-white rounded-[32px] border border-slate-100 overflow-hidden shadow-sm">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Query</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Hits</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Last Seen</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {data.searchTrends.map((s, i) => (
                    <tr key={i} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-900">{s.query}</td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-[10px] font-black">
                          {s.count}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-500 font-medium text-right">
                        {formatDistanceToNow(new Date(s.last_searched))} ago
                      </td>
                    </tr>
                  ))}
                  {data.searchTrends.length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-6 py-12 text-center text-slate-400 text-sm font-medium">No search data yet</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* Recent Payments */}
          <section className="space-y-6">
            <div className="flex items-center gap-3">
               <Clock className="w-5 h-5 text-slate-400" />
               <h2 className="text-xl font-heading font-black text-slate-900 uppercase tracking-tight">Recent Payments</h2>
            </div>
            <div className="bg-white rounded-[32px] border border-slate-100 overflow-hidden shadow-sm">
              <div className="max-h-[500px] overflow-y-auto no-scrollbar">
                <table className="w-full text-left border-collapse">
                  <thead className="sticky top-0 bg-slate-50 border-b border-slate-100 z-10">
                    <tr>
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Space</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Amount</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">TX</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {data.recentTransactions.map((tx, i) => (
                      <tr key={i} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                           <p className="font-bold text-slate-900 truncate max-w-[120px]">{tx.space_name}</p>
                           <p className="text-[10px] text-slate-400 font-medium">{formatDistanceToNow(new Date(tx.created_at!))} ago</p>
                        </td>
                        <td className="px-6 py-4">
                           <p className="font-black text-slate-900">{tx.amount} {tx.currency}</p>
                        </td>
                        <td className="px-6 py-4 text-right">
                           {tx.tx_hash ? (
                             <a 
                               href={`https://tonviewer.com/transaction/${tx.tx_hash}`}
                               target="_blank"
                               className="p-2 rounded-xl bg-slate-50 text-slate-400 hover:text-primary hover:bg-primary/5 transition-all inline-block"
                             >
                               <ExternalLink className="w-4 h-4" />
                             </a>
                           ) : (
                             <span className="text-[10px] font-bold text-slate-300 uppercase">Off-chain</span>
                           )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}
