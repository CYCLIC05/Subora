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
      <div className="flex-1 min-w-0 flex flex-col justify-center gap-0.5">
        <div className="flex items-center gap-1.5">
          <h3 className="font-heading text-[15px] font-bold text-slate-950 truncate">
            {space.name}
          </h3>
          {space.is_trending && (
            <span className="shrink-0 w-3.5 h-3.5 bg-blue-500 rounded-full flex items-center justify-center">
              <svg className="w-2 h-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-tight">
            {space.category || 'Premium'}
          </p>
          <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-500">
            <span className="w-1 h-1 rounded-full bg-emerald-500" />
            {(space.subscribers || 0).toLocaleString()} MEMBERS
          </div>
        </div>
      </div>

      {/* Right: Price & CTA */}
      <div className="flex flex-col items-end gap-1.5 shrink-0">
        <div className="flex flex-col items-end">
          <span className="text-[13px] font-black text-slate-950">
            {lowestPriceTier.price} {lowestPriceTier.currency || 'TON'}
          </span>
          <span className="text-[9px] font-bold text-emerald-500">
            +{((space.id.charCodeAt(0) % 15) + (space.id.charCodeAt(1) % 10) / 10).toFixed(1)}% growth
          </span>
        </div>
        <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter border border-primary/20">
          Join
        </div>
      </div>
    </Link>
  );
}
