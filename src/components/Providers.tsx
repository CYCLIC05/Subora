'use client';

import { TonConnectUIProvider } from '@tonconnect/ui-react';
import { createContext, useContext, useEffect, useState } from 'react';

const TonConnectAvailabilityContext = createContext(false);

export function useTonConnectAvailable() {
  return useContext(TonConnectAvailabilityContext);
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [isTonConnectAvailable, setIsTonConnectAvailable] = useState(false);
  const [hasTonConnectError, setHasTonConnectError] = useState(false);

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

    const handleOnlineStatus = () => {
      setIsTonConnectAvailable(navigator.onLine);
      if (!navigator.onLine) {
        setHasTonConnectError(true);
      }
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      const message = reason instanceof Error ? reason.message : String(reason);

      if (message.includes('Failed to fetch')) {
        console.warn('TonConnect wallet list fetch failed, disabling wallet UI for this session.', reason);
        event.preventDefault();
        setIsTonConnectAvailable(false);
        setHasTonConnectError(true);
      }
    };

    const handleErrorEvent = (event: ErrorEvent) => {
      const message = event.error?.message ?? event.message;
      if (typeof message === 'string' && message.includes('Failed to fetch')) {
        console.warn('TonConnect wallet list fetch failed, disabling wallet UI for this session.', event.error || message);
        event.preventDefault();
        setIsTonConnectAvailable(false);
        setHasTonConnectError(true);
      }
    };

    initTWA();
    handleOnlineStatus();
    window.addEventListener('online', handleOnlineStatus);
    window.addEventListener('offline', handleOnlineStatus);
    window.addEventListener('unhandledrejection', handleUnhandledRejection as EventListener);
    window.addEventListener('error', handleErrorEvent);

    return () => {
      window.removeEventListener('online', handleOnlineStatus);
      window.removeEventListener('offline', handleOnlineStatus);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection as EventListener);
      window.removeEventListener('error', handleErrorEvent);
    };
  }, []);

  const manifestUrl = process.env.NEXT_PUBLIC_TONCONNECT_MANIFEST_URL ?? '/tonconnect-manifest.json';

  const content = (
    <TonConnectAvailabilityContext.Provider value={isTonConnectAvailable && !hasTonConnectError}>
      {children}
    </TonConnectAvailabilityContext.Provider>
  );

  if (!isTonConnectAvailable || hasTonConnectError) {
    return content;
  }

  return (
    <TonConnectAvailabilityContext.Provider value={true}>
      <TonConnectUIProvider manifestUrl={manifestUrl}>
        {children}
      </TonConnectUIProvider>
    </TonConnectAvailabilityContext.Provider>
  );
}
