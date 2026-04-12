'use client';

import { Header } from "@/components/Header";
import { SpaceCard } from "@/components/SpaceCard";
import { useState, useMemo } from "react";
import { Search, Sparkles, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const MOCK_SPACES = [
  {
    id: '1',
    name: 'Alpha Trading Signals',
    description: 'Real-time market analysis and trade setups for high-performing traders.',
    cover_image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80',
    tiers: {
      tier1: { price: 99, duration: 'week' },
      tier2: { price: 299, duration: 'month' }
    }
  },
  {
    id: '2',
    name: 'TON Builders Labs',
    description: 'Technical deep-dives and early access to the next generation of TON apps.',
    cover_image: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&q=80',
    tiers: {
      tier1: { price: 49, duration: 'month' },
      tier2: { price: 499, duration: 'year' }
    }
  },
  {
    id: '3',
    name: 'Macro Insights',
    description: 'Global economic trends and strategic asset allocation for long-term growth.',
    cover_image: 'https://images.unsplash.com/photo-1611974714405-08e13768b726?w=800&q=80',
    tiers: {
      tier1: { price: 150, duration: 'month' }
    }
  }
];

export default function Discover() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredSpaces = useMemo(() => {
    return MOCK_SPACES.filter(space => 
      space.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      space.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  return (
    <main className="min-h-screen bg-[#fdfdfd]">
      <Header />
      
      <div className="container mx-auto px-6 py-12 space-y-16">
        {/* Intentional Hero Section */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-center space-y-6 max-w-2xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 bg-white shadow-sm border border-zinc-100 px-4 py-2 rounded-full text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            Verified Creator Hub
          </div>
          <h1 className="text-4xl md:text-6xl font-heading font-semibold text-zinc-950 tracking-tighter leading-[0.95]">
            Handcrafted <br />
            Telegram Spaces.
          </h1>
          <p className="text-sm text-zinc-500 font-medium leading-relaxed">
            Direct access to high-signal communities. <br />
            Managed securely via Telegram Stars.
          </p>
        </motion.section>

        {/* Professional Search Terminal */}
        <section className="max-w-xl mx-auto">
          <div className="relative group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-primary transition-colors" />
            <input 
              type="text"
              placeholder="Search by community, niche or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-zinc-100 rounded-3xl py-4.5 pl-14 pr-6 text-sm font-medium shadow-sm focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all placeholder:text-zinc-400"
            />
          </div>
        </section>

        {/* Dynamic Grid with Emotional Pull */}
        <section className="space-y-8">
          <div className="flex items-center justify-between border-b border-zinc-50 pb-4">
            <h2 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Featured Ecosystems</h2>
            <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-500 uppercase tracking-widest">
              <ShieldCheck className="w-3.5 h-3.5" />
              Verified Escrow
            </div>
          </div>
          
          <motion.div 
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10"
          >
            <AnimatePresence mode="popLayout">
              {filteredSpaces.map((space, index) => (
                <motion.div
                  key={space.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ 
                    duration: 0.5, 
                    delay: index * 0.1,
                    ease: [0.16, 1, 0.3, 1] 
                  }}
                >
                  <SpaceCard space={space as any} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          {filteredSpaces.length === 0 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <p className="text-zinc-400 font-medium">No communities found matching your configuration.</p>
            </motion.div>
          )}
        </section>
      </div>
    </main>
  );
}
