'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { WalletProvider } from './WalletProvider';
import { ThemeProvider, useTheme } from 'next-themes';

export function Providers({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    const initTWA = async () => {
      try {
        const WebApp = (await import('@twa-dev/sdk')).default;
        if (WebApp.ready) WebApp.ready();
        if (WebApp.expand) WebApp.expand();
        if (WebApp.enableClosingConfirmation) WebApp.enableClosingConfirmation();

        // Handle Deep Linking & Referrals
        const startParam = WebApp.initDataUnsafe?.start_param;
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
            } else if (parts[i] === 'creator' && parts[i + 1] === 'ref' && parts[i + 2]) {
              const walletAddress = parts.slice(i + 2).join('_');
              localStorage.setItem('creator_referrer', walletAddress);
              console.log('Creator Referrer stored:', walletAddress);
              break;
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

    initTWA();
  }, [router]);

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <TelegramThemeSync />
      <WalletProvider>
        {children}
      </WalletProvider>
    </ThemeProvider>
  );
}

function TelegramThemeSync() {
  const { setTheme } = useTheme();

  useEffect(() => {
    const syncTheme = async () => {
      try {
        const WebApp = (await import('@twa-dev/sdk')).default;
        if (WebApp.colorScheme) {
          setTheme(WebApp.colorScheme);
        }
        
        // Listen for theme changes in real-time
        WebApp.onEvent('themeChanged', () => {
          if (WebApp.colorScheme) {
            setTheme(WebApp.colorScheme);
          }
        });
      } catch (e) {
        console.warn('Telegram SDK theme sync failed', e);
      }
    };

    syncTheme();
  }, [setTheme]);

  return null;
}
