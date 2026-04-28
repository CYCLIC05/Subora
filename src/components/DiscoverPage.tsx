'use client';

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Header } from '@/components/Header'
import { SpaceCard } from '@/components/SpaceCard'
import { Space } from '@/lib/supabase'
import { Search, Users, ExternalLink, X } from 'lucide-react'

import { rankSpaces } from '@/lib/searchRanking';
import { SpaceCoverImage } from '@/components/SpaceCoverImage'

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
    () => spaces.filter((s) => s.is_trending).slice(0, 5),
    [spaces]
  )

  const recentlyLaunched = useMemo(
    () => [...spaces]
      .filter(s => !s.is_trending)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5),
    [spaces]
  )

  const discoverFeed = useMemo(() => {
    if (searchQuery || selectedCategory !== 'All') return filteredSpaces;
    const highlightedIds = new Set([
      ...trendingSpaces.map(s => s.id),
      ...recentlyLaunched.map(s => s.id)
    ]);
    return spaces.filter(s => !highlightedIds.has(s.id));
  }, [spaces, trendingSpaces, recentlyLaunched, searchQuery, selectedCategory, filteredSpaces]);

  return (
    <main className="min-h-screen bg-background">
      <Header />

      <div className="w-full bg-white space-y-6 pt-4 pb-20">
        <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md px-4 py-3 border-b border-slate-100">
          
          <div className="relative group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              placeholder="Search by community, niche or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-[32px] py-4 pl-14 pr-12 text-sm font-medium shadow-sm focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/30 transition-all placeholder:text-slate-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-5 top-1/2 -translate-y-1/2 p-1.5 rounded-full hover:bg-slate-100 text-slate-400 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
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
        </div>

        {!searchQuery && selectedCategory === 'All' && (
          <div className="space-y-10 pb-6">
            {trendingSpaces.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between px-4">
                  <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Trending</h2>
                </div>
                <div className="flex overflow-x-auto no-scrollbar gap-4 px-4 pb-2">
                  {trendingSpaces.map((space) => (
                    <Link 
                      key={`trend-${space.id}`}
                      href={`/spaces/${space.id}?source=trending`}
                      className="flex-shrink-0 w-[280px] group relative"
                    >
                      <div className="relative aspect-[16/10] rounded-[32px] overflow-hidden border border-slate-100 bg-slate-50 shadow-sm transition-all group-active:scale-95">
                        <SpaceCoverImage 
                          src={space.cover_image || 'https://images.unsplash.com/photo-1522071823991-b5ae72643156?w=600&q=80'} 
                          alt={space.name}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
                        <div className="absolute bottom-5 left-5 right-5 space-y-1">
                          <p className="text-[10px] font-bold text-primary uppercase tracking-widest">{space.category}</p>
                          <h3 className="text-sm font-bold text-white truncate">{space.name}</h3>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {recentlyLaunched.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between px-4">
                  <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">New Today</h2>
                </div>
                <div className="flex overflow-x-auto no-scrollbar gap-4 px-4 pb-2">
                  {recentlyLaunched.map((space) => (
                    <Link 
                      key={`new-${space.id}`}
                      href={`/spaces/${space.id}?source=new`}
                      className="flex-shrink-0 w-[140px] group"
                    >
                      <div className="relative aspect-square rounded-[28px] overflow-hidden border border-slate-100 bg-slate-50 mb-3 group-active:scale-95 transition-transform">
                        <SpaceCoverImage 
                          src={space.cover_image || 'https://images.unsplash.com/photo-1522071823991-b5ae72643156?w=400&q=80'} 
                          alt={space.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <h3 className="text-[11px] font-bold text-slate-950 truncate px-1">{space.name}</h3>
                      <p className="text-[9px] font-medium text-slate-500 truncate px-1">{space.category}</p>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="space-y-2">
          <h2 className="px-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
            {searchQuery || selectedCategory !== 'All' ? 'Search Results' : 'Discover'}
          </h2>
          <div className="flex flex-col border-t border-slate-100">
              {discoverFeed.map((space: Space) => (
                <SpaceCard key={space.id} space={space} />
              ))}
          </div>

          {discoverFeed.length === 0 && (
              <div className="text-center space-y-2 py-20 bg-slate-50 border-b border-slate-100">
                <Search className="w-8 h-8 text-slate-300 mx-auto" />
                <h3 className="text-lg font-heading font-semibold text-slate-950">No spaces found</h3>
                <p className="text-sm text-slate-500 font-medium">Try a different search term or category.</p>
              </div>
          )}
        </div>
      </div>


    </main>
  )
}
