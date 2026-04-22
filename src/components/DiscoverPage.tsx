'use client';

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Header } from '@/components/Header'
import { SpaceCard } from '@/components/SpaceCard'
import { Space } from '@/lib/supabase'
import { Search, Users, ExternalLink } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'

import { rankSpaces } from '@/lib/searchRanking';

export function DiscoverPage({ spaces }: { spaces: Space[] }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('All')

  const categories = ['All', 'Crypto Alpha', 'Trading', 'Lifestyle', 'Education', 'Technical']

  // Handle debouncing
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery)
    }, 600)
    return () => clearTimeout(timer)
  }, [searchQuery])

  // Track the search query for SEO metrics
  useEffect(() => {
    if (debouncedQuery.trim().length >= 2) {
      fetch('/api/search/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: debouncedQuery.trim() })
      }).catch(err => console.error('Failed to track search:', err))
    }
  }, [debouncedQuery])

  const filteredSpaces = useMemo(
    () => rankSpaces(spaces, searchQuery, selectedCategory),
    [searchQuery, spaces, selectedCategory]
  )

  const trendingSpaces = useMemo(
    () => spaces.filter((s) => s.is_trending).slice(0, 3),
    [spaces]
  )

  const recentlyLaunched = useMemo(
    () => [...spaces].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 3),
    [spaces]
  )

  return (
    <main className="min-h-screen bg-background">
      <Header />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="container mx-auto px-6 py-12 space-y-16"
      >
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-center space-y-6 max-w-2xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-full text-[10px] font-bold text-slate-500 uppercase tracking-[0.15em] shadow-sm">
            Verified Community Hub
          </div>
          <h1 className="text-5xl md:text-7xl font-heading font-semibold text-slate-950 tracking-tight leading-[0.95]">
            Premium Spaces <br />
            in One Place.
          </h1>
          <p className="text-base md:text-xl text-slate-600 font-medium leading-relaxed max-w-xl mx-auto">
            Find high-value Telegram communities faster. Subora is the discovery layer for serious alpha and private discussions.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-900 uppercase tracking-[0.1em] bg-white px-4 py-2 rounded-full border border-slate-200 shadow-sm">
               Subscribe with Stars
            </div>
            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-900 uppercase tracking-[0.1em] bg-white px-4 py-2 rounded-full border border-slate-200 shadow-sm">
               Instant Onboarding
            </div>
          </div>
        </motion.section>

        <section className="bg-slate-950 rounded-[48px] p-8 md:p-12 text-white overflow-hidden relative">
           <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[100px] -translate-y-1/2 translate-x-1/2" />
           <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                 <h2 className="text-3xl md:text-4xl font-heading font-bold leading-tight">Why not join directly on Telegram?</h2>
                 <p className="text-slate-400 text-lg leading-relaxed">
                   Telegram is huge, but signal is hard to find. Subora curates the top 1% of communities, ensuring you only pay for high-value access with zero noise.
                 </p>
                 <div className="flex items-center gap-6">
                    <div>
                       <p className="text-2xl font-bold text-white">100%</p>
                       <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Verified</p>
                    </div>
                    <div className="w-px h-8 bg-slate-800" />
                    <div>
                       <p className="text-2xl font-bold text-white">Instant</p>
                       <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Onboarding</p>
                    </div>
                 </div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-[32px] p-8 backdrop-blur-sm">
                 <p className="text-sm font-bold text-primary mb-4 uppercase tracking-[0.2em]">Strategy</p>
                 <p className="text-xl font-medium leading-relaxed">
                   "Subora isn't just a UI—it's your filter for the Telegram ecosystem. Find alpha, not spam."
                 </p>
              </div>
           </div>
        </section>

        <section className="max-w-3xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="bg-slate-50 border border-slate-200 rounded-[32px] p-8 flex flex-col items-center text-center gap-4">
              <div className="space-y-2">
                <p className="text-sm font-bold text-slate-950 uppercase tracking-tight">Curation Focus</p>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">Exclusive alpha and high-signal communities only.</p>
              </div>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-[32px] p-8 flex flex-col items-center text-center gap-4">
              <div className="space-y-2">
                <p className="text-sm font-bold text-slate-950 uppercase tracking-tight">Verified Payments</p>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">Instant Telegram access after secured payment.</p>
              </div>
            </div>
          </div>
          
          <div className="relative group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              placeholder="Search by community, niche or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-[32px] py-4 pl-14 pr-6 text-sm font-medium shadow-sm focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/30 transition-all placeholder:text-slate-400"
            />
          </div>

          <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-2 pt-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`flex-shrink-0 px-6 py-2.5 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all border ${
                  selectedCategory === cat 
                  ? 'bg-slate-950 text-white border-slate-950 shadow-md' 
                  : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </section>

        {trendingSpaces.length > 0 && !searchQuery && (
          <section className="space-y-8 bg-primary/5 rounded-[48px] p-8 border border-primary/10">
            <div className="flex items-center justify-between gap-4 border-b border-primary/10 pb-4">
              <h2 className="text-[10px] font-bold text-slate-950 uppercase tracking-widest">Trending Now</h2>
              <div className="flex items-center gap-2 text-[10px] font-bold text-primary uppercase tracking-widest bg-white px-2 py-1 rounded-lg shadow-sm">
                High Momentum
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {trendingSpaces.map((space) => (
                <SpaceCard key={space.id} space={space} />
              ))}
            </div>
          </section>
        )}

        {recentlyLaunched.length > 0 && !searchQuery && (
          <section className="space-y-8">
            <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <h2 className="text-[10px] font-bold text-primary uppercase tracking-widest">New Today</h2>
              <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Latest Alpha
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {recentlyLaunched.map((space) => (
                <SpaceCard key={`recent-${space.id}`} space={space} />
              ))}
            </div>
          </section>
        )}

        <section className="grid gap-4 md:grid-cols-3">
          {[
            {
              title: 'Telegram-native flow',
              description: 'Designed for in-app Telegram Web Apps, with main button and haptic feedback support.',
            },
            {
              title: 'Verified membership',
              description: 'Secure discovery and onboarding for premium creator spaces and members.',
            },
            {
              title: 'Tiered access',
              description: 'Build recurring channel tiers and manage subscriptions through Telegram-native workflows.',
            },
          ].map((feature, index) => (
            <div key={index} className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] mb-3">{feature.title}</p>
              <p className="text-sm leading-6 text-slate-600">{feature.description}</p>
            </div>
          ))}
        </section>

        <section className="space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-4">
            <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Featured Ecosystems</h2>
            <div className="flex items-center gap-2 text-[10px] font-bold text-primary uppercase tracking-widest">
              Verified Marketplace
            </div>
          </div>

          <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            <AnimatePresence mode="popLayout">
              {filteredSpaces.map((space: Space, index: number) => (
                <motion.div
                  key={space.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.5, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
                >
                  <SpaceCard space={space} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          {filteredSpaces.length === 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }} 
              className="space-y-12 py-10"
            >
              <div className="text-center space-y-4 max-w-sm mx-auto">
                <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto">
                  <Search className="w-8 h-8 text-slate-300" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-heading font-bold text-slate-950 tracking-tight">Zero signals found.</h3>
                  <p className="text-sm text-slate-500 font-medium leading-relaxed">
                    This niche is currently underserved. This is your chance to lead the community.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 opacity-50 pointer-events-none grayscale">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="border-2 border-dashed border-slate-200 rounded-[32px] p-6 space-y-5 h-[400px] flex flex-col justify-end bg-slate-50/50">
                    <div className="w-full aspect-[16/10] bg-slate-100 rounded-2xl" />
                    <div className="space-y-3">
                      <div className="h-4 w-2/3 bg-slate-200 rounded-full" />
                      <div className="h-3 w-full bg-slate-100 rounded-full" />
                      <div className="h-10 w-full bg-slate-200 rounded-2xl mt-4" />
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-center pt-4">
                <div className="bg-white border border-slate-200 p-8 rounded-[40px] shadow-2xl shadow-slate-900/5 text-center space-y-6 max-w-sm relative overflow-hidden group">
                   <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -translate-y-16 translate-x-16" />
                   <h4 className="text-lg font-bold text-slate-950 tracking-tight italic">
                     "Be the first to dominate the {searchQuery || selectedCategory !== 'All' ? `${searchQuery || selectedCategory} niche` : 'this segment'}."
                   </h4>
                   <p className="text-xs text-slate-500 font-medium leading-relaxed">
                     Users are currently searching for <span className="text-slate-950 font-bold underline">"{searchQuery}"</span>. 
                     Capture this traffic by launching your space today.
                   </p>
                   <Link 
                     href="/create"
                     onClick={() => {
                        import('@twa-dev/sdk').then(m => m.default.HapticFeedback.impactOccurred('heavy'))
                     }}
                     className="inline-flex items-center justify-center gap-2 w-full py-4 rounded-3xl bg-slate-950 text-white text-xs font-bold uppercase tracking-widest hover:bg-slate-900 transition-all active:scale-95 shadow-xl shadow-slate-950/10 group-hover:bg-primary group-hover:shadow-primary/20"
                   >
                     🚀 Launch Space & Dominate
                   </Link>
                </div>
              </div>
            </motion.div>
          )}
        </section>
      </motion.div>
    </main>
  )
}
