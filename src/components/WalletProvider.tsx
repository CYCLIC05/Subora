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

// Compute a stable manifest URL — must never be empty when passed to TonConnectUIProvider.
// NEXT_PUBLIC_ vars are inlined at build time, so this is safe on both server and client.
const MANIFEST_URL =
  process.env.NEXT_PUBLIC_TONCONNECT_MANIFEST_URL ||
  'https://subora-two.vercel.app/tonconnect-manifest.json';

export function WalletProvider({ children }: { children: React.ReactNode }) {
  return (
    <TonConnectUIProvider
      manifestUrl={MANIFEST_URL}
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
