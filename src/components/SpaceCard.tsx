import Image from 'next/image';
import Link from 'next/link';
import { Space } from '@/lib/supabase';
import { ShieldCheck, ArrowRight } from 'lucide-react';

export function SpaceCard({ space }: { space: Space }) {
  const lowestPrice = space.tiers.tier1.price;
  const duration = space.tiers.tier1.duration;

  const handleHaptic = async () => {
    try {
      const WebApp = (await import('@twa-dev/sdk')).default;
      WebApp.HapticFeedback.impactOccurred('light');
    } catch (e) {}
  };

  return (
    <div className="group relative bg-white border border-zinc-100 rounded-3xl overflow-hidden shadow-pro shadow-pro-hover active:scale-[0.98]">
      <div className="relative w-full aspect-[16/10] overflow-hidden">
        <Image 
          src={space.cover_image || 'https://images.unsplash.com/photo-1522071823991-b5ae72643156?w=800&q=80'} 
          alt={space.name}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/40 to-transparent opacity-60" />
        
        {/* Trust Layer: Verified Badge */}
        <div className="absolute top-3 right-3 bg-white/95 backdrop-blur shadow-sm px-2.5 py-1 rounded-full flex items-center gap-1.5 border border-zinc-100 transition-transform group-hover:scale-105">
          <ShieldCheck className="w-3.5 h-3.5 text-primary" />
          <span className="text-[10px] font-bold text-zinc-900 uppercase tracking-tight">Verified</span>
        </div>
      </div>
      
      <div className="p-5 flex flex-col gap-5">
        <div className="flex flex-col gap-1">
          <div className="flex items-start justify-between">
            <h3 className="font-heading text-lg font-semibold text-zinc-900 line-clamp-1 flex-1">
              {space.name}
            </h3>
          </div>
          <p className="text-xs text-zinc-400 font-medium font-heading">Powered by Telegram Stars</p>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-mono font-bold text-zinc-950 tracking-tighter">{lowestPrice}</span>
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Stars / {duration}</span>
          </div>
          
          <Link 
            href={`/spaces/${space.id}`}
            onClick={handleHaptic}
            className="inline-flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl bg-primary text-white text-xs font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95"
          >
            Access Space
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
