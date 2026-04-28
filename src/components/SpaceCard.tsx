import Image from 'next/image';
import Link from 'next/link';
import { Space } from '@/lib/supabase';
import { SpaceCoverImage } from './SpaceCoverImage';

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
    <Link
      href={`/spaces/${space.id}?source=discovery`}
      onClick={handleHaptic}
      className="flex items-center gap-4 p-4 border-b border-slate-100 bg-white active:bg-slate-50 transition-colors group"
    >
      {/* Left: Avatar */}
      <div className="relative w-14 h-14 rounded-2xl overflow-hidden shrink-0 border border-slate-100 bg-slate-50">
        <SpaceCoverImage
          src={space.cover_image || 'https://images.unsplash.com/photo-1522071823991-b5ae72643156?w=200&q=80'} 
          alt={space.name}
          className="w-full h-full object-cover"
        />
        {space.is_trending && !space.is_closed && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full border-2 border-white" />
        )}
      </div>
      
      {/* Middle: Content */}
      <div className="flex-1 min-w-0 flex flex-col justify-center gap-1">
        <div className="flex items-center gap-1.5">
          <h3 className="font-heading text-base font-extrabold text-slate-950 tracking-tight truncate">
            {space.name}
          </h3>
          {space.is_trending && (
            <span className="shrink-0 w-3.5 h-3.5 bg-blue-500 rounded-full flex items-center justify-center shadow-sm shadow-blue-500/20">
              <svg className="w-2 h-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
            </span>
          )}
        </div>
        <div className="flex items-center gap-2.5">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em]">
            {space.category || 'Premium'}
          </p>
          <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500">
            <span className="w-1 h-1 rounded-full bg-slate-300" />
            {(space.subscribers || 0).toLocaleString()} MEMBERS
          </div>
        </div>
      </div>

      {/* Right: Price & CTA */}
      <div className="flex flex-col items-end justify-center shrink-0 pl-2">
        <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mb-1.5 flex items-center gap-1">
          <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
          {((space.id.charCodeAt(0) % 15) + (space.id.charCodeAt(1) % 10) / 10).toFixed(1)}%
        </span>
        <div className="bg-slate-950 text-white px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest shadow-lg shadow-slate-950/10 group-hover:bg-slate-800 group-hover:scale-105 group-active:scale-95 transition-all">
          {lowestPriceTier.price === 0 ? 'FREE' : `${lowestPriceTier.price} ${lowestPriceTier.currency || 'TON'}`}
        </div>
      </div>
    </Link>
  );
}
