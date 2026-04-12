'use client';

import { TonConnectButton } from '@tonconnect/ui-react';
import Link from 'next/link';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full bg-white/70 backdrop-blur-xl border-b border-zinc-100">
      <div className="container mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="font-heading text-xl font-semibold tracking-[-0.03em] text-zinc-900 group-active:scale-95 transition-transform">
            Subora
          </span>
        </Link>
        
        <div className="flex items-center gap-4 scale-90 origin-right">
          <TonConnectButton />
        </div>
      </div>
    </header>
  );
}
