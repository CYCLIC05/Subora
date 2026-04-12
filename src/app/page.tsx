'use client';

import { Header } from "@/components/Header";
import { SpaceCard } from "@/components/SpaceCard";
import { Space } from "@/lib/supabase";
import { useEffect, useState, useMemo } from "react";
import { Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";

// Mock data for initial view
const MOCK_SPACES: Space[] = [
  {
    id: '1',
    creator_telegram_id: 123,
    name: 'Growth Alpha Group',
    description: 'Exclusive signals and growth strategies for upcoming projects. Learn from the best in the space.',
    cover_image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80',
    channel_link: '@growthalpha',
    tiers: {
      tier1: { name: 'Weekly Access', price: 99, duration: 'week' },
      tier2: { name: 'Monthly Access', price: 299, duration: 'month' },
    },
    created_at: new Date().toISOString(),
  },
  {
    id: '2',
    creator_telegram_id: 456,
    name: 'TON Builders Hub',
    description: 'A collaborative space for developers building on the TON network. Share code, get feedback.',
    cover_image: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=800&q=80',
    channel_link: '@tonbuilders',
    tiers: {
      tier1: { name: 'Monthly Support', price: 150, duration: 'month' },
    },
    created_at: new Date().toISOString(),
  },
  {
    id: '3',
    creator_telegram_id: 789,
    name: 'Creator Circle',
    description: 'The ultimate mastermind for content creators looking to scale their audience and monetization.',
    cover_image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80',
    channel_link: '@creatorcircle',
    tiers: {
      tier1: { name: 'Access', price: 49, duration: 'week' },
    },
    created_at: new Date().toISOString(),
  }
];

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  
  const filteredSpaces = useMemo(() => {
    return MOCK_SPACES.filter(space => 
      space.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      space.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  return (
    <main className="min-h-screen bg-white pb-32">
      <Header />
      
      <div className="container mx-auto px-4 py-16 max-w-5xl">
        <section className="mb-20 text-center max-w-3xl mx-auto space-y-6">
          <h1 className="text-5xl md:text-6xl font-heading font-semibold text-zinc-950 tracking-tight">
            Discovery
          </h1>
          <p className="text-zinc-500 text-lg font-medium leading-relaxed">
            Access curated Telegram ecosystems. Secure, tiered, and focused on value.
          </p>
          
          <div className="pt-4 flex items-center gap-3 max-w-md mx-auto">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <Input 
                type="text" 
                placeholder="Search spaces..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 rounded-2xl border-zinc-100 bg-zinc-50/50 focus-visible:ring-zinc-200 transition-all"
              />
            </div>
            <button className="h-12 w-12 flex items-center justify-center rounded-2xl border border-zinc-100 bg-white text-zinc-900 hover:bg-zinc-50 transition-colors">
              <Filter className="w-4 h-4" />
            </button>
          </div>
        </section>

        <section className="space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-widest leading-none">Featured</h2>
            {searchQuery && (
              <p className="text-xs text-zinc-400 font-medium italic">Found {filteredSpaces.length} result{filteredSpaces.length !== 1 ? 's' : ''}</p>
            )}
          </div>
          
          {filteredSpaces.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredSpaces.map((space) => (
                <SpaceCard key={space.id} space={space} />
              ))}
            </div>
          ) : (
            <div className="py-24 text-center border-2 border-dashed border-zinc-100 rounded-[32px]">
              <p className="text-sm text-zinc-400 font-medium font-heading">No spaces match your criteria</p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
