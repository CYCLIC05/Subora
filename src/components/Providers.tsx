'use client';

import { TonConnectUIProvider } from '@tonconnect/ui-react';
import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const TonConnectAvailabilityContext = createContext(false);

export function useTonConnectAvailable() {
  return useContext(TonConnectAvailabilityContext);
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [isTonConnectAvailable, setIsTonConnectAvailable] = useState(false);
  const [hasTonConnectError, setHasTonConnectError] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const initTWA = async () => {
      try {
        const WebApp = (await import('@twa-dev/sdk')).default;
        WebApp.ready();
        WebApp.expand();
        WebApp.enableClosingConfirmation();

        // Handle Deep Linking & Referrals
        const startParam = WebApp.initDataUnsafe.start_param;
        if (startParam) {
          console.log('Detected start_param:', startParam);
          
          // Pattern: space_{id}_ref_{username}
          const parts = startParam.split('_');
          let spaceId = '';
          let referrerId = '';

          for (let i = 0; i < parts.length; i++) {
            if (parts[i] === 'space' && parts[i + 1]) {
              spaceId = parts[i + 1];
            } else if (parts[i] === 'ref' && parts[i + 1]) {
              referrerId = parts[i + 1];
            }
          }

          if (referrerId) {
            localStorage.setItem('subora_referrer', referrerId);
            console.log('Referrer stored:', referrerId);
          }

          if (spaceId) {
            console.log('Redirecting to space:', spaceId);
            router.replace(`/spaces/${spaceId}`);
          }
        }
      } catch (e) {
        console.warn('Telegram WebApp not found or failed to initialize', e);
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
