'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type WalletContextType = {
  walletAddress: string | null;
  isConnecting: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
};

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  // Load from local storage if available
  useEffect(() => {
    const saved = localStorage.getItem('mock_wallet_address');
    if (saved) setWalletAddress(saved);
  }, []);

  const connectWallet = async () => {
    setIsConnecting(true);
    // Simulate real-world connection delay
    await new Promise(res => setTimeout(res, 1200));
    
    // Using a realistic mock address format
    const mockAddress = 'UQB2-dKJkNjL3I4M79-dKJkNjL3I4M79_8Mv7A-Dk1234F';
    setWalletAddress(mockAddress);
    localStorage.setItem('mock_wallet_address', mockAddress);
    setIsConnecting(false);
  };

  const disconnectWallet = () => {
    setWalletAddress(null);
    localStorage.removeItem('mock_wallet_address');
  };

  return (
    <WalletContext.Provider value={{ walletAddress, isConnecting, connectWallet, disconnectWallet }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useMockWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useMockWallet must be used within a WalletProvider');
  }
  return context;
}
