'use client';

import Link from 'next/link';
import { TonConnectButton } from '@tonconnect/ui-react';
import { useWallet } from './WalletProvider';

export function Header() {
  // We still keep useWallet to potentially use other context values if needed
  const { walletAddress } = useWallet();

  return (
    <header className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-xl border-b border-slate-200/70 shadow-sm">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="font-heading text-2xl font-semibold tracking-tight text-slate-950 group-active:scale-95 transition-transform">
              Subora
            </span>
          </Link>
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest">Verified Network</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <TonConnectButton />
        </div>
      </div>
    </header>
  );
}
