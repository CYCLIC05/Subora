'use client';

import { TonConnectButton } from '@tonconnect/ui-react';
import Link from 'next/link';
import { Rocket } from 'lucide-react';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-miro-ring">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-miro-yellow rounded-lg flex items-center justify-center transform rotate-3">
            <Rocket className="w-5 h-5 text-miro-black" />
          </div>
          <span className="font-display text-lg font-bold text-miro-black tracking-tight sm:block hidden">
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
