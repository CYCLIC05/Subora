'use client'

import { useEffect, useState } from 'react'
import { Space } from '@/lib/supabase'
import { motion } from 'framer-motion'

const trustLines = [
  'Instant access after payment',
  'Secure via Stars',
  'No hidden fees',
]

export function SpacePurchasePanel({ space }: { space: Space }) {
  const [selectedTierIndex, setSelectedTierIndex] = useState(0)

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

        const handleMainButtonClick = () => {
          WebApp.HapticFeedback.notificationOccurred('success')
          alert(`Proceeding to encrypted checkout for ${space.name} - ${currentTier.name}`)
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
  }, [space, selectedTierIndex])

  const [checkoutState, setCheckoutState] = useState<'idle' | 'processing' | 'complete'>('idle')
  const tiers = space.tiers.length ? space.tiers : [{ name: 'Standard Access', price: 0, duration: 'month' }]
  const currentTier = tiers[selectedTierIndex] ?? tiers[0]

  const handleLocalCheckout = async () => {
    setCheckoutState('processing')
    try {
      await new Promise((resolve) => setTimeout(resolve, 900))
      setCheckoutState('complete')
      alert(`Success! You have joined ${space.name} on the ${currentTier.name} plan.`)
    } catch (error) {
      console.warn('Checkout failed', error)
      setCheckoutState('idle')
    }
  }

  return (
    <div className="sticky top-28 space-y-8">
      <div className="rounded-[40px] border border-slate-200 bg-white p-8 shadow-xl shadow-slate-900/5">
        <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-slate-400">Your access plan</p>
        <div className="mt-4 flex items-end gap-3">
          <span className="text-6xl font-heading font-bold tracking-tight text-slate-950">{currentTier.price}</span>
          <span className="pb-1 text-sm font-semibold uppercase tracking-[0.32em] text-slate-500">/ {currentTier.duration}</span>
        </div>
        <p className="mt-3 text-sm text-slate-600">Premium access to exclusive signals, community updates, and drops.</p>
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

      <button
        onClick={handleLocalCheckout}
        disabled={checkoutState !== 'idle'}
        className="w-full rounded-[28px] bg-primary px-6 py-4 text-lg font-semibold text-white shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all disabled:cursor-not-allowed disabled:opacity-70"
      >
        {checkoutState === 'processing'
          ? 'Joining space...'
          : checkoutState === 'complete'
          ? 'Access granted'
          : 'Join Space'}
      </button>

      <div className="rounded-[32px] border border-slate-200 bg-zinc-50 p-5 text-sm text-slate-600 space-y-3">
        {trustLines.map((line) => (
          <p key={line} className="flex items-center gap-2 text-slate-600">
            <span className="text-primary font-bold">•</span>
            {line}
          </p>
        ))}
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
