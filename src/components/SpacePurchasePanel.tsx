'use client'

import { useCallback, useEffect, useState } from 'react'
import { SendTransactionRequest } from '@tonconnect/ui'
import { TonConnectButton, useTonAddress, useTonConnectUI } from '@tonconnect/ui-react'
import { Space } from '@/lib/supabase'
import { motion } from 'framer-motion'

const trustLines = [
  'Instant access via Telegram',
  'Secure payment with Stars',
]

export function SpacePurchasePanel({ space }: { space: Space }) {
  const [selectedTierIndex, setSelectedTierIndex] = useState(0)
  const [tonConnectUI] = useTonConnectUI()
  const walletAddress = useTonAddress()
  const paymentAddress = space.payment_address ?? process.env.NEXT_PUBLIC_TON_PAYMENT_ADDRESS ?? ''
  const network = process.env.NEXT_PUBLIC_TON_NETWORK ?? '-239'

  const isWalletConnected = Boolean(walletAddress)

  const [checkoutState, setCheckoutState] = useState<'idle' | 'processing' | 'complete'>('idle')
  const tiers = space.tiers.length ? space.tiers : [{ name: 'Standard Access', price: 0, duration: 'month' }]
  const currentTier = tiers[selectedTierIndex] ?? tiers[0]

  const handleTonCheckout = useCallback(async () => {
    if (!paymentAddress) {
      alert('Payment address is not configured for this space. Please contact the creator.')
      return
    }

    if (!tonConnectUI) {
      alert('Wallet integration is not available in this browser session.')
      return
    }

    if (!walletAddress) {
      alert('Please connect your TON wallet before paying.')
      return
    }

    setCheckoutState('processing')

    try {
      const amountNano = String(currentTier.price * 1_000_000_000)
      const tx: SendTransactionRequest = {
        validUntil: Math.floor(Date.now() / 1000) + 300,
        network,
        messages: [
          {
            address: paymentAddress,
            amount: amountNano,
          },
        ],
      }

      await tonConnectUI.sendTransaction(tx, {
        onRequestSent: () => {
          console.log('TON payment request sent')
        },
      })

      setCheckoutState('complete')
    } catch (error) {
      console.warn('Payment failed', error)
      alert('Payment failed. Make sure your wallet is connected and try again.')
      setCheckoutState('idle')
    }
  }, [currentTier.price, network, paymentAddress, tonConnectUI, walletAddress])

  useEffect(() => {
    if (!space) {
      return
    }

    let cleanup = () => {}

    const initMainButton = async () => {
      try {
        const WebApp = (await import('@twa-dev/sdk')).default
        const currentTier = space.tiers[selectedTierIndex] ?? space.tiers[0]

        WebApp.MainButton.setText(`Join Space • ${currentTier.price}`)
        WebApp.MainButton.show()

        const handleMainButtonClick = async () => {
          WebApp.HapticFeedback.notificationOccurred('success')
          await handleTonCheckout()
        }

        WebApp.MainButton.onClick(handleMainButtonClick)
        cleanup = () => {
          WebApp.MainButton.offClick(handleMainButtonClick)
          WebApp.MainButton.hide()
        }
      } catch (error) {
        console.warn('Telegram WebApp not available', error)
      }
    }

    initMainButton()
    return () => cleanup()
  }, [space, selectedTierIndex, handleTonCheckout])

  return (
    <div className="sticky top-28 space-y-8">
      <div className="rounded-[40px] border border-slate-200 bg-white p-8 shadow-xl shadow-slate-900/5">
        <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-slate-400">Your access plan</p>
        <div className="mt-4 flex flex-col gap-1">
          <div className="flex items-baseline gap-2">
            <span className="text-8xl font-heading font-bold tracking-tighter text-slate-950">
              {currentTier.price}
            </span>
            <span className="text-lg font-bold text-slate-500 uppercase tracking-widest">Stars</span>
          </div>
          <span className="text-sm font-semibold uppercase tracking-[0.32em] text-slate-400">per {currentTier.duration}</span>
        </div>
        <p className="mt-3 text-sm text-slate-600">Includes 24/7 premium alerts, gated discussions, and exclusive creator drops.</p>
        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-2">
          <div className="flex -space-x-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-slate-200 overflow-hidden">
                <div className="w-full h-full bg-gradient-to-br from-slate-300 to-slate-400" />
              </div>
            ))}
          </div>
          <p className="text-[11px] font-bold text-slate-900 uppercase tracking-tight">
            Join {space.subscribers.toLocaleString()}+ active members
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {tiers.map((tier, index) => {
          const isSelected = selectedTierIndex === index

          return (
            <motion.button
              key={`${tier.name}-${index}`}
              type="button"
              onClick={() => setSelectedTierIndex(index)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`relative w-full rounded-[30px] border p-5 text-left transition-all ${
                isSelected
                  ? 'border-primary bg-primary/[0.08] shadow-primary/10'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-base font-semibold text-slate-950">{tier.name}</p>
                  <p className="mt-1 text-sm text-slate-500">Full access for one {tier.duration}</p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-mono font-bold text-slate-950">{tier.price}</p>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">per {tier.duration}</p>
                </div>
              </div>
              {isSelected && (
                <div className="mt-4 rounded-2xl bg-primary/10 px-3 py-2 text-sm font-semibold text-primary">Selected tier</div>
              )}
            </motion.button>
          )
        })}
      </div>

      <div className="space-y-4">
        <div className="rounded-[32px] border border-slate-200 bg-slate-50 p-5">
          <p className="text-sm font-semibold text-slate-950">Wallet connection needed</p>
          <p className="mt-2 text-xs text-slate-500">
            Connect a TON wallet to authorize payment and unlock automated access for this space.
          </p>
          {isWalletConnected ? (
            <p className="mt-3 text-xs font-semibold text-emerald-700">Connected wallet: {walletAddress}</p>
          ) : (
            <div className="mt-4">
              <TonConnectButton className="w-full rounded-3xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-900 transition" />
            </div>
          )}
          {!paymentAddress && (
            <p className="mt-4 text-xs text-rose-500">No payment address configured for this community.</p>
          )}
        </div>

        <button
          onClick={handleTonCheckout}
          disabled={checkoutState !== 'idle' || !paymentAddress || !isWalletConnected}
          className="w-full rounded-[30px] bg-slate-950 px-6 py-5 text-xl font-bold text-white shadow-2xl shadow-slate-950/20 hover:bg-slate-900 transition-all active:scale-95 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {checkoutState === 'processing'
            ? 'Processing payment...'
            : checkoutState === 'complete'
            ? 'Success!'
            : isWalletConnected
            ? `Pay ${currentTier.price} Stars`
            : 'Connect wallet to pay'}
        </button>

        {checkoutState === 'complete' && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-primary/[0.08] border border-primary/20 rounded-[30px] p-6 text-center space-y-4"
          >
            <p className="text-sm font-bold text-primary italic">You're in! Access is unlocked.</p>
            <p className="text-xs text-slate-700 font-medium leading-relaxed">
              Invite your network to join this High-Value community and help us grow the ecosystem.
            </p>
            <button
              onClick={async () => {
                const WebApp = (await import('@twa-dev/sdk')).default
                const username = WebApp.initDataUnsafe.user?.username || 'user'
                const inviteLink = `https://t.me/SuboraBot/app?startapp=space_${space.id}_ref_${username}`
                const shareText = `I just joined this premium Telegram Space: ${space.name}. Access early alpha & insights here 👇\n\n${inviteLink}`
                WebApp.switchInlineQuery(shareText, ['users', 'groups', 'channels'])
              }}
              className="w-full bg-primary text-white py-3 rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-primary/90 transition-all font-heading"
            >
              Share with Friends
            </button>
          </motion.div>
        )}
        
        <div className="flex flex-col gap-2 px-2">
          {trustLines.map((line) => (
            <div key={line} className="flex items-center gap-2.5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
              <div className="w-1 h-1 rounded-full bg-primary" />
              {line}
            </div>
          ))}
        </div>
      </div>


      <footer className="text-center space-y-6 px-4 pt-6 border-t border-zinc-100/50">
        <div className="text-[11px] font-bold uppercase tracking-widest text-slate-950 opacity-80">
          Powered by Telegram Stars
        </div>
        <div className="space-y-1 text-[10px] text-slate-500 font-semibold uppercase tracking-[0.18em]">
          <p>Instant access after payment</p>
          <p>No hidden fees · Secure purchase</p>
        </div>
      </footer>
    </div>
  )
}
