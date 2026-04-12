'use client';

import { TonConnectUIProvider } from '@tonconnect/ui-react';
import { useEffect, useState } from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Initialize Telegram WebApp only on the client
    const initTWA = async () => {
      if (typeof window !== 'undefined') {
        const WebApp = (await import('@twa-dev/sdk')).default;
        try {
          WebApp.ready();
          WebApp.expand();
          WebApp.enableClosingConfirmation();
        } catch (e) {
          console.warn("Telegram WebApp not found", e);
        }
      }
    };

    initTWA();
  }, []);

  if (!mounted) return null;

  return (
    <TonConnectUIProvider manifestUrl="https://subora-spaces.vercel.app/tonconnect-manifest.json">
      {children}
    </TonConnectUIProvider>
  );
}
