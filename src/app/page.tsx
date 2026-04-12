'use client';

import { Header } from "@/components/Header";
import { SpaceCard } from "@/components/SpaceCard";
import { Space } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { Rocket, Search } from "lucide-react";

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
  const [spaces, setSpaces] = useState<Space[]>(MOCK_SPACES);

  return (
    <main className="min-h-screen bg-[#f9f9fb]">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <section className="mb-12 text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-miro-teal-light text-miro-teal-dark px-3 py-1 rounded-full text-xs font-bold mb-4">
            <Rocket className="w-3 h-3" />
            DISCOVER PREMIUM COMMUNITIES
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-miro-black mb-4 tracking-tight">
            Find your tribe in <span className="text-miro-blue">Subora Spaces</span>
          </h1>
          <p className="text-miro-slate text-lg">
            The world's first Miro-inspired marketplace for paid Telegram channels and private groups.
          </p>
        </section>

        <div className="flex items-center gap-4 mb-8 bg-white p-2 rounded-miro-lg border border-miro-ring shadow-sm max-w-md mx-auto">
          <Search className="w-5 h-5 text-miro-slate ml-2" />
          <input 
            type="text" 
            placeholder="Search spaces..." 
            className="flex-1 bg-transparent border-none outline-none text-miro-black font-body py-2"
          />
        </div>

        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-xl font-bold text-miro-black">Trending Spaces</h2>
            <button className="text-miro-blue text-sm font-semibold hover:underline">View All</button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {spaces.map((space) => (
              <SpaceCard key={space.id} space={space} />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
