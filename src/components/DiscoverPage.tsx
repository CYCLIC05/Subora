'use client';

import { useEffect, useMemo, useState, useCallback } from 'react'
import Link from 'next/link'
import { Header } from '@/components/Header'
import { SpaceCard } from '@/components/SpaceCard'
import { Space } from '@/lib/supabase'
import { Search, Users, ExternalLink, X, Loader2 } from 'lucide-react'

import { rankSpaces } from '@/lib/searchRanking';
import { SpaceCoverImage } from '@/components/SpaceCoverImage'

export function DiscoverPage({ spaces: initialSpaces }: { spaces: Space[] }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  const [spaces, setSpaces] = useState<Space[]>(initialSpaces)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [isLoading, setIsLoading] = useState(false)

  const categories = ['All', 'Free', 'Premium', 'Crypto Alpha', 'Trading', 'Lifestyle', 'Technical']

  // Handle debouncing
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery)
    }, 600)
    return () => clearTimeout(timer)
  }, [searchQuery])

  // Reset spaces when filters change
  useEffect(() => {
    setSpaces(initialSpaces)
    setPage(1)
    setHasMore(true)
  }, [initialSpaces, debouncedQuery, selectedCategory])

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
      .sort((a, b) => {
        const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
        return dateB - dateA;
      })
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

  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore) return
    
    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        page: String(page + 1),
        limit: '20',
      })
      if (selectedCategory !== 'All') {
        params.set('category', selectedCategory)
      }
      if (debouncedQuery) {
        params.set('search', debouncedQuery)
      }

      const res = await fetch(`/api/spaces?${params}`)
      const data = await res.json()
      
      if (data.data?.length > 0) {
        setSpaces(prev => [...prev, ...data.data])
        setPage(prev => prev + 1)
        setHasMore(data.hasMore)
      } else {
        setHasMore(false)
      }
    } catch (err) {
      console.error('Failed to load more spaces:', err)
    } finally {
      setIsLoading(false)
    }
  }, [isLoading, hasMore, page, selectedCategory, debouncedQuery])

  return (
    <main className="min-h-screen bg-background">
      <Header />

      <div className="w-full space-y-8 pt-6 pb-24">
        <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md px-4 py-4 border-b border-slate-100 rounded-b-3xl shadow-md">
          <div className="relative group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              placeholder="Search by community, niche or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-[32px] py-4 pl-14 pr-12 text-base font-semibold shadow-lg focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/30 transition-all placeholder:text-slate-400"
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

          <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-2 pt-3">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`flex-shrink-0 px-7 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all border ${
                  selectedCategory === cat 
                  ? 'bg-primary text-white border-primary shadow-lg' 
                  : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Premium Featured Banner */}
        {!searchQuery && selectedCategory === 'All' && trendingSpaces.length > 0 && (
          <div className="px-4 pb-8">
            <Link 
              href={`/spaces/${trendingSpaces[0].id}?source=featured`}
              className="group block relative aspect-[16/8] w-full rounded-[40px] overflow-hidden border-2 border-primary/30 shadow-2xl shadow-primary/10 active:scale-[0.98] transition-transform bg-primary"
            >
              <SpaceCoverImage 
                src={trendingSpaces[0].cover_image} 
                alt={trendingSpaces[0].name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-80"
              />
              <div className="absolute inset-0 bg-slate-950/60" />
              <div className="absolute bottom-8 left-8 right-8 space-y-2">
                <div className="flex items-center gap-3 mb-2">
                  <span className="px-3 py-1 rounded-full bg-primary text-[11px] font-black text-white uppercase tracking-tighter shadow-md">Featured</span>
                  <span className="text-[12px] font-bold text-white/80 uppercase tracking-widest">{trendingSpaces[0].category}</span>
                </div>
                <h2 className="text-2xl font-black text-white leading-tight drop-shadow-lg">{trendingSpaces[0].name}</h2>
                <p className="text-[13px] font-medium text-white/80 line-clamp-1 max-w-[80%] drop-shadow">{trendingSpaces[0].description}</p>
              </div>
            </Link>
          </div>
        )}

        {/* Trending and New Today sections */}
        {!searchQuery && selectedCategory === 'All' && (
          <div className="space-y-12 pb-6">
            {trendingSpaces.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between px-4">
                  <h2 className="text-[12px] font-black text-primary uppercase tracking-[0.2em]">Trending</h2>
                </div>
                <div className="flex overflow-x-auto no-scrollbar gap-6 px-4 pb-2">
                  {trendingSpaces.map((space) => (
                    <Link 
                      key={`trend-${space.id}`}
                      href={`/spaces/${space.id}?source=trending`}
                      className="flex-shrink-0 w-[300px] group relative"
                    >
                      <div className="relative aspect-[16/10] rounded-[36px] overflow-hidden border-2 border-primary/10 bg-slate-50 shadow-lg transition-all group-active:scale-95">
                        <SpaceCoverImage 
                          src={space.cover_image || 'https://images.unsplash.com/photo-1522071823991-b5ae72643156?w=600&q=80'} 
                          alt={space.name}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-slate-950/40" />
                        <div className="absolute bottom-6 left-6 right-6 space-y-1">
                          <p className="text-[11px] font-black text-primary uppercase tracking-widest drop-shadow">{space.category}</p>
                          <h3 className="text-base font-black text-white truncate drop-shadow-lg">{space.name}</h3>
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
                  <h2 className="text-[12px] font-black text-primary uppercase tracking-[0.2em]">New Today</h2>
                </div>
                <div className="flex overflow-x-auto no-scrollbar gap-6 px-4 pb-2">
                  {recentlyLaunched.map((space) => (
                    <Link 
                      key={`new-${space.id}`}
                      href={`/spaces/${space.id}?source=new`}
                      className="flex-shrink-0 w-[150px] group"
                    >
                      <div className="relative aspect-square rounded-[32px] overflow-hidden border-2 border-primary/10 bg-slate-50 mb-3 group-active:scale-95 transition-transform shadow-md">
                        <SpaceCoverImage 
                          src={space.cover_image || 'https://images.unsplash.com/photo-1522071823991-b5ae72643156?w=400&q=80'} 
                          alt={space.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <h3 className="text-[12px] font-black text-slate-950 truncate px-1">{space.name}</h3>
                      <p className="text-[10px] font-medium text-slate-500 truncate px-1">{space.category}</p>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Main Discover Feed - Grid Layout */}
        <div className="space-y-2">
          <h2 className="px-4 text-[12px] font-black text-primary uppercase tracking-widest">
            {searchQuery || selectedCategory !== 'All' ? 'Search Results' : 'Discover'}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 px-4 pt-2 border-t border-slate-100">
            {discoverFeed.map((space: Space) => (
              <SpaceCard key={space.id} space={space} />
            ))}
          </div>

          {/* Load More Button */}
          {hasMore && !searchQuery && selectedCategory === 'All' && (
            <div className="flex justify-center py-8">
              <button
                onClick={loadMore}
                disabled={isLoading}
                className="flex items-center gap-2 px-6 py-3 rounded-full bg-primary/10 text-primary font-semibold text-sm hover:bg-primary/20 transition-colors disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  'Load more'
                )}
              </button>
            </div>
          )}

          {discoverFeed.length === 0 && (
            <div className="text-center space-y-2 py-20 bg-slate-50 border-b border-slate-100 rounded-3xl shadow-inner">
              <h3 className="text-lg font-heading font-semibold text-slate-950">No spaces found</h3>
              <p className="text-sm text-slate-500 font-medium">Try a different search term or category.</p>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
