import Image from 'next/image';
import Link from 'next/link';
import { Space } from '@/lib/supabase';
import { Star } from 'lucide-react';
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
    <div className="miro-card flex flex-col h-full group">
      <div className="relative w-full aspect-[16/9] mb-4 overflow-hidden rounded-miro-md">
        <Image
          src={space.cover_image || 'https://images.unsplash.com/photo-1522071823991-b5ae72643156?w=800&q=80'}
          alt={space.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute top-2 right-2">
          <div className="miro-badge-yellow flex items-center gap-1 shadow-sm">
            <Star className="w-3 h-3 fill-miro-black" />
            {lowestPrice}
          </div>
        </div>
      </div>
      
      <div className="flex-1">
        <h3 className="font-display text-lg font-bold text-miro-black mb-1 line-clamp-1">
          {space.name}
        </h3>
        <p className="text-miro-slate text-sm mb-4 line-clamp-2 h-10">
          {space.description}
        </p>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-miro-ring mt-auto">
        <div className="text-xs text-miro-slate">
          From <span className="font-bold text-miro-black">{lowestPrice} Stars</span>/{duration}
        </div>
        <Link 
          href={`/spaces/${space.id}`}
          onClick={handleHaptic}
          className="text-miro-blue text-sm font-bold hover:underline"
        >
          View Space
        </Link>
      </div>
    </div>
  );
}
