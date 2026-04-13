'use client';

import { TonConnectUIProvider } from '@tonconnect/ui-react';
import { useEffect, useState } from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const initTWA = async () => {
      try {
        const WebApp = (await import('@twa-dev/sdk')).default;
        WebApp.ready();
        WebApp.expand();
        WebApp.enableClosingConfirmation();
      } catch (e) {
        console.warn("Telegram WebApp not found", e);
      }
    };

    initTWA();
  }, []);

  return (
    <TonConnectUIProvider manifestUrl="https://subora-spaces.vercel.app/tonconnect-manifest.json">
      {children}
    </TonConnectUIProvider>
  );
}
