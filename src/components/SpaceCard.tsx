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
      className="flex flex-col h-full justify-between bg-white rounded-3xl border border-slate-100 shadow-[0_2px_16px_-4px_rgba(80,80,120,0.06)] hover:shadow-[0_4px_32px_-4px_rgba(80,80,120,0.10)] transition-all p-5 group"
      style={{ position: 'relative', minHeight: 180 }}
    >
      {/* Top: Avatar and Price */}
      <div className="flex items-start justify-between w-full mb-3">
        <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-slate-100 bg-slate-50 shadow-sm">
          <SpaceCoverImage
            src={space.cover_image || 'https://images.unsplash.com/photo-1522071823991-b5ae72643156?w=200&q=80'}
            alt={space.name}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex flex-col items-end">
          <div className="bg-primary text-white px-4 py-1.5 rounded-full text-[12px] font-black uppercase tracking-widest shadow-lg shadow-primary/10 border-2 border-white/80 min-w-[64px] text-center">
            {lowestPriceTier.price === 0 ? 'FREE' : `${lowestPriceTier.price} ${lowestPriceTier.currency || 'TON'}`}
          </div>
        </div>
      </div>

      {/* Middle: Content */}
      <div className="flex-1 min-w-0 flex flex-col justify-center gap-1">
        <h3 className="font-heading text-base font-extrabold text-slate-950 tracking-tight truncate mb-0.5">
          {space.name}
        </h3>
        <div className="flex items-center gap-2.5 mb-1">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em]">
            {space.category || 'Premium'}
          </p>
          <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500">
            <span className="w-1 h-1 rounded-full bg-slate-300" />
            {(space.subscribers || 0).toLocaleString()} MEMBERS
          </div>
        </div>
        <div className="text-[11px] text-slate-500 font-medium truncate mt-1 leading-relaxed">
          {space.description}
        </div>
      </div>
    </Link>
  );
}
