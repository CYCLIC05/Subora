'use client';

import { TonConnectButton } from '@tonconnect/ui-react';
import Link from 'next/link';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full bg-white/70 backdrop-blur-xl border-b border-zinc-100">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="font-heading text-2xl font-semibold tracking-tighter text-zinc-900 group-active:scale-95 transition-transform">
              Subora
            </span>
          </Link>
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100/50">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Verified Network</span>
          </div>
        </div>
        
        <div className="flex items-center gap-4 scale-90 origin-right">
          <TonConnectButton />
        </div>
      </div>
    </header>
  );
}
