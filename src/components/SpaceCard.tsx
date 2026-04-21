import Image from 'next/image';
import Link from 'next/link';
import { Space } from '@/lib/supabase';
import { ArrowRight } from 'lucide-react';

export function SpaceCard({ space }: { space: Space }) {
  const primaryTier = space.tiers[0] ?? { name: 'Entry', price: 0, duration: 'month' };
  const lowestPriceTier = space.tiers.reduce(
    (lowest, tier) => (tier.price < lowest.price ? tier : lowest),
    primaryTier
  );

  const handleHaptic = async () => {
    try {
      const WebApp = (await import('@twa-dev/sdk')).default;
      WebApp.HapticFeedback.impactOccurred('light');
    } catch (error) {
      console.debug('Haptic feedback unavailable', error);
    }
  };

  return (
    <div className="group relative bg-white border border-slate-200 rounded-[32px] overflow-hidden shadow-pro shadow-pro-hover active:scale-[0.98]">
      <div className="relative w-full aspect-[16/10] overflow-hidden">
        <Image 
          src={space.cover_image || 'https://images.unsplash.com/photo-1522071823991-b5ae72643156?w=800&q=80'} 
          alt={space.name}
          fill
          sizes="100vw"
          className="object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/30 to-transparent" />
        
        <div className="absolute top-4 right-4 bg-white/95 backdrop-blur shadow-sm px-3 py-1.5 rounded-full flex items-center border border-slate-200 transition-transform group-hover:scale-105">
          <span className="text-[10px] font-bold text-slate-900 uppercase tracking-[0.1em]">Verified</span>
        </div>

        {space.is_closed && (
          <div className="absolute top-4 left-4 bg-slate-900 shadow-sm px-3 py-1.5 rounded-full flex items-center transition-transform group-hover:scale-105 z-10">
            <span className="text-[10px] font-bold text-white uppercase tracking-[0.1em]">Sold Out</span>
          </div>
        )}

        {space.is_trending && !space.is_closed && (
          <div className="absolute top-4 left-4 bg-primary shadow-sm px-3 py-1.5 rounded-full flex items-center transition-transform group-hover:scale-105 z-10">
            <span className="text-[10px] font-bold text-white uppercase tracking-[0.1em]">Trending</span>
          </div>
        )}

        {space.is_active_today && (
          <div className="absolute bottom-4 left-4 bg-slate-950/80 backdrop-blur shadow-sm px-3 py-1.5 rounded-full flex items-center gap-2 border border-white/10 transition-transform group-hover:scale-105 z-10">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] font-bold text-white uppercase tracking-tight">Active Today</span>
          </div>
        )}
      </div>
      
      <div className="p-6 flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-heading text-xl font-bold text-slate-950 line-clamp-1 flex-1">
              {space.name}
            </h3>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">
            <span className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-xl">
              by <span className="text-slate-950 tracking-tight">{space.creator_name || 'Verified Space'}</span>
            </span>
            <span className="bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-xl border border-emerald-100/50">
              {space.subscribers.toLocaleString()} members
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex items-baseline gap-1.5">
            <span className="text-4xl font-heading font-bold text-slate-950 tracking-tighter">{lowestPriceTier.price}</span>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Stars / {lowestPriceTier.duration}</span>
          </div>
          
          <Link
            href={`/spaces/${space.id}?source=discovery`}
            prefetch={false}
            onClick={handleHaptic}
            className="inline-flex items-center justify-center gap-2 w-full py-3.5 rounded-3xl bg-primary text-white text-sm font-semibold shadow-lg shadow-primary/15 hover:bg-primary/90 transition-all active:scale-95"
          >
            Join Space
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
