'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { TonConnectButton } from '@tonconnect/ui-react';
import { useWallet } from './WalletProvider';

export function Header() {
  const { walletAddress } = useWallet();
  const [mounted, setMounted] = useState(false);
  const [tgUser, setTgUser] = useState<any>(null);

  useEffect(() => {
    setMounted(true);
    
    const initUser = async () => {
      try {
        const WebApp = (await import('@twa-dev/sdk')).default;
        if (WebApp.initDataUnsafe?.user) {
          setTgUser(WebApp.initDataUnsafe.user);
        }
      } catch (e) {
        // Ignore if not in Telegram
      }
    };
    initUser();
  }, []);

  const handleHaptic = async (style: 'light' | 'medium' | 'heavy' = 'light') => {
    try {
      const WebApp = (await import('@twa-dev/sdk')).default;
      WebApp.HapticFeedback.impactOccurred(style);
    } catch (error) {
      // Ignore if not in Telegram
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl border-b border-slate-100 dark:border-slate-800 shadow-sm">
      <div className="container mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {tgUser ? (
            <div className="flex items-center gap-2 bg-slate-100/80 dark:bg-slate-800/80 pr-3 pl-1 py-1 rounded-full border border-slate-200/60 dark:border-slate-700/60 shadow-sm">
              <div className="relative w-8 h-8 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700 shrink-0">
                {tgUser.photo_url ? (
                  <img src={tgUser.photo_url} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-500 dark:text-slate-400 font-bold text-xs uppercase">
                    {tgUser.first_name?.charAt(0) || 'U'}
                  </div>
                )}
              </div>
              <div className="flex flex-col justify-center">
                <span className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-none truncate max-w-[90px]">
                  {tgUser.username || tgUser.first_name}
                </span>
                {tgUser.is_premium && (
                  <div className="mt-0.5">
                    <span className="inline-block bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 text-[9px] px-1 py-[2px] rounded-sm font-black uppercase tracking-wider leading-none">
                      Premium
                    </span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <Link 
              href="/" 
              className="flex items-center gap-2 group"
              onClick={() => handleHaptic('light')}
            >
              <span className="font-heading text-2xl font-semibold tracking-tight text-slate-950 dark:text-white group-active:scale-95 transition-transform">
                Subora
              </span>
            </Link>
          )}
        </div>
        <div className="flex items-center gap-4">
          <Link 
            href="/subscriptions"
            onClick={() => handleHaptic('light')}
            className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            My Memberships
          </Link>
          {mounted && <TonConnectButton />}
        </div>
      </div>
    </header>
  );
}
