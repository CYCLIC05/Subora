'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { TonConnectUIProvider, useTonConnectUI, useTonWallet, useTonAddress } from '@tonconnect/ui-react';

type WalletContextType = {
  walletAddress: string | null;
  isConnecting: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  tonConnectUI: any;
};

const WalletContext = createContext<WalletContextType | undefined>(undefined);

function WalletProviderInner({ children }: { children: React.ReactNode }) {
  const [tonConnectUI] = useTonConnectUI();
  const wallet = useTonWallet();
  const address = useTonAddress();
  const [isConnecting, setIsConnecting] = useState(false);

  const connectWallet = async () => {
    try {
      setIsConnecting(true);
      await tonConnectUI.connectWallet();
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    tonConnectUI.disconnect();
  };

  const walletAddress = address || null;

  return (
    <WalletContext.Provider value={{ walletAddress, isConnecting, connectWallet, disconnectWallet, tonConnectUI }}>
      {children}
    </WalletContext.Provider>
  );
}

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [manifestUrl, setManifestUrl] = useState<string>('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Add a timestamp to bypass any browser/SDK caching of the manifest file
      const url = `${window.location.origin}/tonconnect-manifest.json?v=${Date.now()}`;
      setManifestUrl(url);
    }
  }, []);

  // If we don't have a manifest URL yet, provide a placeholder context 
  // so useWallet doesn't throw. This happens during the very first 
  // client-side render or during SSR.
  if (!manifestUrl) {
    return (
      <WalletContext.Provider value={{ 
        walletAddress: null, 
        isConnecting: true, 
        connectWallet: async () => {}, 
        disconnectWallet: () => {}, 
        tonConnectUI: null 
      }}>
        {children}
      </WalletContext.Provider>
    );
  }

  return (
    <TonConnectUIProvider
      manifestUrl={manifestUrl}
      uiPreferences={{ theme: 'SYSTEM' }}
    >
      <WalletProviderInner>
        {children}
      </WalletProviderInner>
    </TonConnectUIProvider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}

// Legacy export for backward compatibility
export const useMockWallet = useWallet;
