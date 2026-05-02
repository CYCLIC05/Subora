'use client'

import { useState, useEffect } from 'react'
import { 
  Wallet, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  DollarSign,
  TrendingUp,
  Info
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'

// Platform fee - should be in env in production
const PLATFORM_FEE_PERCENT = 5

type Transaction = {
  id: string
  space_id: string
  spaceName: string
  telegram_user_id: number
  wallet_address: string
  amount: number
  currency: string
  status: string
  created_at: string
}

type PayoutData = {
  connectedWallet: string | null
  availableBalance: number
  pendingBalance: number
  lastPayout: string | null
  currency: string
}

export function PayoutSection({ 
  transactions = [],
  payoutData,
  tonPrice = 5.5,
  isLoading = false
}: { 
  transactions?: Transaction[]
  payoutData?: PayoutData
  tonPrice?: number
  isLoading?: boolean
}) {
  const [showExplanation, setShowExplanation] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'history'>('overview')

  // Calculate totals
  const totalRevenue = transactions?.reduce((sum, tx) => {
    if (tx.status === 'success') {
      return sum + (tx.currency === 'TON' ? tx.amount * tonPrice : tx.amount) 
    }
    return sum
  }, 0) || 0

  const platformFee = totalRevenue * (PLATFORM_FEE_PERCENT / 100)
  const netRevenue = totalRevenue - platformFee

  const formatWallet = (wallet: string | null) => {
    if (!wallet) return 'Not connected'
    return `${wallet.slice(0, 6)}...${wallet.slice(-4)}`
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatAmount = (amount: number, currency: string) => {
    if (currency === 'TON') return `${amount.toFixed(2)} TON`
    if (currency === 'USDT') return `$${amount.toFixed(2)}`
    if (currency === 'Stars') return `${amount} ⭐`
    return `${amount}`
  }

  return (
    <section className="space-y-6">
      {/* Creator Wallet Section */}
      <div className="rounded-3xl bg-white border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-slate-950 flex items-center gap-2">
            <Wallet className="w-5 h-5 text-primary" />
            Payout Wallet
          </h3>
          <span className="text-xs font-medium text-primary bg-primary/10 px-3 py-1 rounded-full">
            {PLATFORM_FEE_PERCENT}% platform fee
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Connected Wallet */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">Connected Wallet</div>
            <div className="font-mono text-sm font-semibold text-slate-900">
              {formatWallet(payoutData?.connectedWallet || null)}
            </div>
            <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              Ready to receive
            </div>
          </div>

          {/* Available Balance */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">Available Balance</div>
            <div className="text-2xl font-bold text-slate-900">
              ${(payoutData?.availableBalance || netRevenue).toFixed(2)}
            </div>
            <div className="text-xs text-slate-500 mt-1">Ready to withdraw</div>
          </div>

          {/* Last Payout */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">Last Payout</div>
            <div className="font-semibold text-slate-900">
              {payoutData?.lastPayout ? formatDate(payoutData.lastPayout) : 'No payouts yet'}
            </div>
            <div className="text-xs text-slate-500 mt-1">Automatic via TON</div>
          </div>
        </div>

        {/* Fee Display */}
        <div className="mt-6 p-4 rounded-2xl bg-primary/5 border border-primary/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-5 h-5 text-primary" />
            <span className="text-sm font-medium text-slate-700">Platform fee: {PLATFORM_FEE_PERCENT}%</span>
          </div>
          <span className="text-sm font-semibold text-slate-900">You receive: {100 - PLATFORM_FEE_PERCENT}%</span>
        </div>
      </div>

      {/* Transaction History */}
      <div className="rounded-3xl bg-white border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-950 flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              Transaction History
            </h3>
            <span className="text-sm text-slate-500">{transactions?.length || 0} transactions</span>
          </div>
        </div>

        {transactions && transactions.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {transactions.slice(0, 10).map((tx) => {
              const fee = tx.amount * (PLATFORM_FEE_PERCENT / 100)
              const net = tx.amount - fee
              
              return (
                <div key={tx.id} className="p-5 flex items-center justify-between hover:bg-slate-50 transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 ${
                      tx.status === 'success' 
                        ? 'bg-green-50 text-green-600' 
                        : tx.status === 'pending'
                        ? 'bg-amber-50 text-amber-600'
                        : 'bg-rose-50 text-rose-600'
                    }`}>
                      {tx.status === 'success' ? (
                        <CheckCircle2 className="w-6 h-6" />
                      ) : tx.status === 'pending' ? (
                        <Clock className="w-6 h-6" />
                      ) : (
                        <AlertCircle className="w-6 h-6" />
                      )}
                    </div>
                    <div>
                      <div className="font-bold text-slate-900">{tx.spaceName}</div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                          {tx.currency}
                        </span>
                        <span className="text-xs text-slate-500 font-medium">
                          {tx.telegram_user_id ? `User ${tx.telegram_user_id}` : tx.wallet_address?.slice(0, 8) + '...'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <div className="font-black text-slate-950 text-lg">
                      +{formatAmount(tx.amount, tx.currency)}
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-[10px] text-slate-400 font-medium">Fee: {formatAmount(fee, tx.currency)}</span>
                      <span className="text-[10px] text-primary font-black uppercase tracking-tighter">Net: {formatAmount(net, tx.currency)}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="p-12 text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-slate-100 flex items-center justify-center mb-4">
              <DollarSign className="w-8 h-8 text-slate-400" />
            </div>
            <h4 className="font-semibold text-slate-900 mb-1">No transactions yet</h4>
            <p className="text-sm text-slate-500">Transactions will appear here when subscribers join your spaces</p>
          </div>
        )}
      </div>
    </section>
  )
}