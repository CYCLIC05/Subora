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
  const [manifestUrl, setManifestUrl] = useState<string>(process.env.NEXT_PUBLIC_TONCONNECT_MANIFEST_URL || '');

  useEffect(() => {
    if (!manifestUrl && typeof window !== 'undefined') {
      // Create an absolute URL if not provided in env
      const absoluteUrl = `${window.location.origin}/tonconnect-manifest.json`;
      setManifestUrl(absoluteUrl);
    }
  }, [manifestUrl]);

  return (
    <TonConnectUIProvider
      manifestUrl={manifestUrl}
      uiPreferences={{ theme: 'SYSTEM' }}
      actionsConfiguration={{
        twaReturnUrl: 'https://t.me/SuboraBot'
      }}
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
