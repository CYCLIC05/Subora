'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, X, ShieldCheck, Info } from 'lucide-react';
import { useWallet } from './WalletProvider';
import { TonConnectButton } from '@tonconnect/ui-react';

export function ConnectWalletModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const { walletAddress, isConnecting } = useWallet();

  useEffect(() => {
    if (walletAddress && isOpen) {
      onClose();
    }
  }, [walletAddress, isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[60] bg-slate-950/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 z-[70] w-full max-w-md -translate-x-1/2 -translate-y-1/2 p-4"
          >
            <div className="overflow-hidden rounded-[40px] border border-slate-200 bg-white p-8 shadow-2xl shadow-slate-950/20">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-white shadow-lg shadow-primary/20">
                    <Wallet className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-heading font-black text-slate-950 tracking-tight">Connect TON Wallet</h2>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-1">Secure Connection</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="text-center space-y-4">
                  <div className="flex items-center justify-center gap-2 text-sm text-slate-600">
                    <ShieldCheck className="h-4 w-4 text-green-500" />
                    <span>Secure connection via TON Connect</span>
                  </div>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    Connect your TON wallet to access your digital vault and manage your assets securely.
                  </p>
                </div>

                <div className="flex justify-center">
                  <TonConnectButton />
                </div>

                <div className="bg-slate-50 rounded-2xl p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <Info className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-slate-700">Supported Wallets</p>
                      <p className="text-xs text-slate-500">
                        Tonkeeper, Tonhub, MyTonWallet, and other TON Connect compatible wallets.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
