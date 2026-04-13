'use client';

import { TonConnectUIProvider } from '@tonconnect/ui-react';
import { createContext, useContext, useEffect, useState } from 'react';

const TonConnectAvailabilityContext = createContext(false);

export function useTonConnectAvailable() {
  return useContext(TonConnectAvailabilityContext);
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [isTonConnectAvailable, setIsTonConnectAvailable] = useState(false);

  useEffect(() => {
    const initTWA = async () => {
      try {
        const WebApp = (await import('@twa-dev/sdk')).default;
        WebApp.ready();
        WebApp.expand();
        WebApp.enableClosingConfirmation();
      } catch (e) {
        console.warn('Telegram WebApp not found', e);
      }
    };

    const handleOnlineStatus = () => setIsTonConnectAvailable(navigator.onLine);
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      if (
        reason instanceof Error &&
        reason.message.includes('Failed to fetch')
      ) {
        console.warn('TonConnect wallet list fetch failed, disabling wallet UI for this session.', reason);
        event.preventDefault();
        setIsTonConnectAvailable(false);
      }
    };

    initTWA();
    handleOnlineStatus();
    window.addEventListener('online', handleOnlineStatus);
    window.addEventListener('offline', handleOnlineStatus);
    window.addEventListener('unhandledrejection', handleUnhandledRejection as EventListener);

    return () => {
      window.removeEventListener('online', handleOnlineStatus);
      window.removeEventListener('offline', handleOnlineStatus);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection as EventListener);
    };
  }, []);

  const content = (
    <TonConnectAvailabilityContext.Provider value={isTonConnectAvailable}>
      {children}
    </TonConnectAvailabilityContext.Provider>
  );

  if (!isTonConnectAvailable) {
    return content;
  }

  return (
    <TonConnectAvailabilityContext.Provider value={isTonConnectAvailable}>
      <TonConnectUIProvider manifestUrl="https://subora-spaces.vercel.app/tonconnect-manifest.json">
        {children}
      </TonConnectUIProvider>
    </TonConnectAvailabilityContext.Provider>
  );
}
