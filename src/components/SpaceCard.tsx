import Image from 'next/image';
import Link from 'next/link';
import { Space } from '@/lib/supabase';
import { ShieldCheck, ArrowRight } from 'lucide-react';

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
          className="object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/30 to-transparent" />
        
        <div className="absolute top-4 right-4 bg-white/95 backdrop-blur shadow-sm px-3 py-1.5 rounded-full flex items-center gap-2 border border-slate-200 transition-transform group-hover:scale-105">
          <ShieldCheck className="w-3.5 h-3.5 text-primary" />
          <span className="text-[10px] font-semibold text-slate-900 uppercase tracking-tight">Verified</span>
        </div>
      </div>
      
      <div className="p-6 flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-heading text-lg font-semibold text-slate-950 line-clamp-1 flex-1">
              {space.name}
            </h3>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 font-medium">
            <span>Powered by Telegram</span>
            <span className="rounded-full bg-slate-100 px-2 py-1">{space.subscribers.toLocaleString()} subscribers</span>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-mono font-bold text-slate-950 tracking-tighter">{lowestPriceTier.price}</span>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">per {lowestPriceTier.duration}</span>
          </div>
          
          <Link 
            href={`/spaces/${encodeURIComponent(String(space.id))}`}
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
