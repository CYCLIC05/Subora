'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { TonConnectButton } from '@tonconnect/ui-react';
import { useWallet } from './WalletProvider';

export function Header() {
  const { walletAddress } = useWallet();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleHaptic = async (style: 'light' | 'medium' | 'heavy' = 'light') => {
    try {
      const WebApp = (await import('@twa-dev/sdk')).default
      WebApp.HapticFeedback.impactOccurred(style)
    } catch (error) {
      // Ignore if not in Telegram
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-xl border-b border-slate-100 shadow-sm">
      <div className="container mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link 
            href="/" 
            className="flex items-center gap-2 group"
            onClick={() => handleHaptic('light')}
          >
            <span className="font-heading text-2xl font-semibold tracking-tight text-slate-950 group-active:scale-95 transition-transform">
              Subora
            </span>
          </Link>
          {/* Removed shield/verified badge for a cleaner, more premium look */}
        </div>
        <div className="flex items-center gap-4">
          <Link 
            href="/subscriptions"
            onClick={() => handleHaptic('light')}
            className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
          >
            My Memberships
          </Link>
          {mounted && <TonConnectButton />}
        </div>
      </div>
    </header>
  );
}
