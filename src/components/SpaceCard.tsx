import Image from 'next/image';
import Link from 'next/link';
import { Space } from '@/lib/supabase';
import WebApp from '@twa-dev/sdk';

export function SpaceCard({ space }: { space: Space }) {
  const lowestPrice = space.tiers.tier1.price;
  const duration = space.tiers.tier1.duration;

  const handleHaptic = () => {
    try {
      WebApp.HapticFeedback.impactOccurred('light');
    } catch (e) {}
  };

  return (
    <div className="group relative bg-white border border-zinc-100 rounded-2xl overflow-hidden active:scale-[0.98] transition-all duration-200">
      <div className="relative w-full aspect-[16/10] overflow-hidden">
        <Image 
          src={space.cover_image || 'https://images.unsplash.com/photo-1522071823991-b5ae72643156?w=800&q=80'} 
          alt={space.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
      </div>
      
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-heading text-base font-semibold text-zinc-900 line-clamp-1">
            {space.name}
          </h3>
          <div className="text-right">
            <span className="text-sm font-bold text-zinc-950">{lowestPrice} Stars</span>
            <span className="block text-[10px] text-zinc-400 font-medium uppercase tracking-tight">/ {duration}</span>
          </div>
        </div>
        
        <p className="text-sm text-zinc-500 line-clamp-2 leading-relaxed mb-4">
          {space.description}
        </p>
        
        <Link 
          href={`/spaces/${space.id}`}
          onClick={handleHaptic}
          className="inline-flex items-center justify-center w-full py-2.5 rounded-xl bg-zinc-900 text-white text-xs font-semibold hover:bg-zinc-800 transition-colors"
        >
          View Space
        </Link>
      </div>
    </div>
  );
}
