'use client'

import { useEffect, useState } from 'react'
import { Header } from '@/components/Header'
import { SpaceCard } from '@/components/SpaceCard'
import { SubscriptionWithSpace, getUserSubscriptions } from '@/lib/database'
import { useWallet } from '@/components/WalletProvider'
import { Library, Zap, ArrowRight, ShieldCheck } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'

export default function SubscriptionsPage() {
  const { walletAddress } = useWallet()
  const [subscriptions, setSubscriptions] = useState<SubscriptionWithSpace[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadSubs() {
      // For now we'll fetch by a dummy ID or find the user ID.
      // In a real TWA we'd use WebApp.initDataUnsafe.user.id
      try {
        const WebApp = (await import('@twa-dev/sdk')).default
        const userId = WebApp.initDataUnsafe?.user?.id
        
        if (userId) {
          const data = await getUserSubscriptions(userId)
          setSubscriptions(data)
        }
      } catch (err) {
        console.error('Failed to load subscriptions', err)
      } finally {
        setIsLoading(false)
      }
    }
    loadSubs()
  }, [])

  return (
    <main className="min-h-screen bg-background pb-32">
      <Header />
      
      <div className="container mx-auto px-6 py-12 max-w-4xl space-y-12">
        <header className="space-y-4">
          <div className="flex items-center gap-3">
             <div className="p-2.5 rounded-2xl bg-primary/10 text-primary">
                <Library className="w-6 h-6" />
             </div>
             <h1 className="text-3xl font-heading font-black text-slate-950 tracking-tight">Memberships</h1>
          </div>
          <p className="text-sm font-medium text-slate-500 max-w-md leading-relaxed">
            Manage your active access keys, track expiration dates, and jump directly into your premium communities.
          </p>
        </header>

        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 w-full rounded-[32px] bg-slate-100 animate-pulse" />
            ))}
          </div>
        ) : subscriptions.length > 0 ? (
          <div className="flex flex-col rounded-[24px] bg-white border border-slate-100 overflow-hidden shadow-sm max-w-3xl mx-auto">
            {subscriptions.map((sub) => (
              <div key={sub.id} className="relative group border-b border-slate-100 last:border-0">
                <SpaceCard space={sub} />
                <div className="absolute top-1/2 -translate-y-1/2 right-24 opacity-0 group-hover:opacity-100 transition-opacity">
                  <a 
                    href={sub.invite_link || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 text-slate-900 text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
                  >
                    Enter <Zap className="w-3 h-3 fill-current" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-24 flex flex-col items-center justify-center text-center space-y-8 bg-white border border-slate-100 rounded-[44px] shadow-sm">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/10 rounded-full blur-2xl" />
              <div className="relative w-20 h-20 rounded-[28px] bg-slate-50 flex items-center justify-center">
                <ShieldCheck className="w-10 h-10 text-slate-300" />
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-xl font-heading font-black text-slate-950">No Active Keys</h3>
              <p className="text-sm text-slate-500 font-medium max-w-xs mx-auto">
                You haven't unlocked any premium spaces yet. Explore the marketplace to find your first signal.
              </p>
            </div>

            <Link
              href="/"
              className="inline-flex items-center gap-3 rounded-2xl bg-primary px-8 py-4 text-[11px] font-black text-white uppercase tracking-[0.2em] shadow-xl shadow-primary/20 transition hover:scale-105 active:scale-95"
            >
              Start Discovery
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>
    </main>
  )
}
