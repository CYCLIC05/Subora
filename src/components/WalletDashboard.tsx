'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Wallet, 
  ArrowUpRight, 
  ArrowDownLeft, 
  ArrowRightLeft, 
  History, 
  ExternalLink,
  Copy,
  Check,
  ShieldCheck,
  Coins,
  CreditCard,
  Sparkles
} from 'lucide-react';
import { Transaction } from '@/lib/supabase';
import { getTonBalance } from '@/lib/toncenter';
import { useWallet } from './WalletProvider';
import { getUserTransactions } from '@/lib/database';
import { ConnectWalletModal } from './ConnectWalletModal';

export function WalletDashboard() {
  const { walletAddress, disconnectWallet, isConnecting } = useWallet();
  const [balance, setBalance] = useState<number | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeAsset, setActiveAsset] = useState<'TON' | 'USDT' | 'STARS'>('TON');
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    async function loadData() {
      if (walletAddress) {
        setIsLoading(true);
        try {
          const [bal, txs] = await Promise.all([
            getTonBalance(walletAddress),
            getUserTransactions(walletAddress)
          ]);
          setBalance(bal);
          setTransactions(txs);
        } catch (err) {
          console.error('Failed to load wallet data:', err);
        } finally {
          setIsLoading(false);
        }
      }
    }
    loadData();
  }, [walletAddress]);

  const copyAddress = () => {
    if (walletAddress) {
      navigator.clipboard.writeText(walletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const truncatedAddress = walletAddress 
    ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-6)}`
    : 'Not Connected';

  if (!walletAddress) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-8 px-6">
        <ConnectWalletModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        
        <div className="relative">
          <div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl animate-pulse" />
          <div className="relative w-24 h-24 rounded-[32px] bg-slate-950 flex items-center justify-center shadow-2xl">
            <Wallet className="w-10 h-10 text-white" />
          </div>
        </div>
        
        <div className="space-y-3">
          <h2 className="text-3xl font-heading font-black text-slate-950 tracking-tight">Access Your Vault</h2>
          <p className="text-sm font-medium text-slate-500 max-w-xs mx-auto leading-relaxed">
            Directly connect your TON wallet to view your real-time balance, earnings, and transaction ledger.
          </p>
        </div>

        <button 
          onClick={() => setIsModalOpen(true)}
          disabled={isConnecting}
          className="w-full max-w-xs py-4 bg-slate-950 text-white rounded-2xl text-sm font-black uppercase tracking-[0.2em] shadow-xl shadow-slate-950/20 active:scale-95 transition-all disabled:opacity-50"
        >
          {isConnecting ? 'Establishing Link...' : 'Link TON Wallet'}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-20">
      {/* Premium Wallet Card */}
      <section className="relative overflow-hidden pt-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 rounded-[44px] bg-slate-950 p-8 text-white shadow-2xl shadow-slate-950/20"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.12),transparent_40%)]" />
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[100px] translate-x-20 translate-y-20" />
          
          <div className="relative space-y-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center backdrop-blur-md">
                   <ShieldCheck className="w-5 h-5 text-primary" />
                </div>
                <div className="space-y-0.5">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Security Active</p>
                  <p className="text-sm font-bold tracking-tight">Verified Subora Hub</p>
                </div>
              </div>
              <button 
                onClick={copyAddress}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/5 text-[11px] font-bold hover:bg-white/10 transition-colors"
              >
                {truncatedAddress}
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
              </button>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-slate-400">Total Balance</p>
              <div className="flex items-baseline gap-3">
                <h2 className="text-5xl font-black tracking-tighter">
                  {balance !== null ? balance.toFixed(2) : '--.--'}
                </h2>
                <span className="text-2xl font-black text-primary italic uppercase tracking-tighter">TON</span>
              </div>
              <p className="text-sm font-medium text-slate-400">≈ ${( (balance ?? 0) * 5.2).toLocaleString()} USD</p>
            </div>

            <div className="grid grid-cols-3 gap-3 pt-4">
              <button className="flex flex-col items-center gap-3 p-4 rounded-[28px] bg-primary text-white transition-all hover:scale-[1.02] active:scale-95 shadow-lg shadow-primary/20">
                 <ArrowUpRight className="w-6 h-6" />
                 <span className="text-[10px] font-black uppercase tracking-widest">Send</span>
              </button>
              <button className="flex flex-col items-center gap-3 p-4 rounded-[28px] bg-white text-slate-950 transition-all hover:scale-[1.02] active:scale-95 shadow-lg shadow-white/5">
                 <ArrowDownLeft className="w-6 h-6" />
                 <span className="text-[10px] font-black uppercase tracking-widest">Receive</span>
              </button>
              <button className="flex flex-col items-center gap-3 p-4 rounded-[28px] bg-white/10 border border-white/10 text-white transition-all hover:scale-[1.02] active:scale-95">
                 <ArrowRightLeft className="w-6 h-6" />
                 <span className="text-[10px] font-black uppercase tracking-widest">Swap</span>
              </button>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Asset Selection */}
      <section className="space-y-4">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Digital Assets</h3>
        <div className="grid grid-cols-3 gap-3">
          {[
            { id: 'TON', name: 'Toncoin', val: balance?.toFixed(1) || '0.0', icon: Coins, color: 'text-primary' },
            { id: 'STARS', name: 'Stars', val: '1,240', icon: Sparkles, color: 'text-amber-400' },
            { id: 'USDT', name: 'Tether', val: '42.00', icon: CreditCard, color: 'text-emerald-500' }
          ].map((asset) => (
            <button
              key={asset.id}
              onClick={() => setActiveAsset(asset.id as any)}
              className={`p-5 rounded-[32px] border transition-all text-left space-y-3 ${
                activeAsset === asset.id 
                  ? 'bg-white border-primary shadow-xl shadow-primary/5' 
                  : 'bg-slate-50/50 border-slate-100 hover:bg-slate-50'
              }`}
            >
              <asset.icon className={`w-5 h-5 ${asset.color}`} />
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{asset.name}</p>
                <p className="text-sm font-black text-slate-950">{asset.val}</p>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Internal Ledger / History */}
      <section className="space-y-6">
        <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-3">
                <History className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-black text-slate-950 uppercase tracking-[0.2em]">Transaction Ledger</h3>
            </div>
            <button className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline">View All</button>
        </div>

        {transactions.length === 0 ? (
          <div className="py-20 text-center bg-slate-50/50 rounded-[40px] border border-dashed border-slate-200">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
               <History className="w-5 h-5 text-slate-300" />
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No transaction history discovered</p>
          </div>
        ) : (
          <div className="space-y-3">
            {transactions.map((tx, idx) => (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                key={tx.id}
                className="group flex items-center justify-between p-5 rounded-[32px] bg-white border border-slate-100 shadow-sm hover:border-primary/20 hover:shadow-md transition-all"
              >
                <div className="flex items-center gap-4">
                   <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                     tx.status === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                   }`}>
                      {tx.status === 'success' ? <ArrowDownLeft className="w-5 h-5" /> : <ExternalLink className="w-5 h-5" />}
                   </div>
                   <div className="space-y-0.5">
                      <p className="text-sm font-black text-slate-950 uppercase tracking-tight">Purchase Inbound</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        {new Date(tx.created_at!).toLocaleDateString()} • {tx.currency}
                      </p>
                   </div>
                </div>
                <div className="text-right space-y-1">
                   <p className="text-sm font-black text-slate-950">+{tx.amount}</p>
                   <p className={`text-[9px] font-black uppercase tracking-widest ${
                     tx.status === 'success' ? 'text-emerald-500' : 'text-amber-500'
                   }`}>{tx.status}</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* Danger Zone / Disconnect */}
      <section className="pt-8 border-t border-slate-100">
          <button 
            onClick={disconnectWallet}
            className="w-full p-6 rounded-[32px] bg-rose-50 text-rose-600 text-xs font-black uppercase tracking-[0.2em] hover:bg-rose-100 transition-colors"
          >
            Terminal Disconnect
          </button>
      </section>
    </div>
  );
}
