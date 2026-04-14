'use client'

import { useEffect, useState } from 'react'
import { Space } from '@/lib/supabase'
import { motion } from 'framer-motion'

const trustLines = [
  'Instant access via Telegram',
  'Secure payment with Stars',
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
        <button
          onClick={handleLocalCheckout}
          disabled={checkoutState !== 'idle'}
          className="w-full rounded-[30px] bg-slate-950 px-6 py-5 text-xl font-bold text-white shadow-2xl shadow-slate-950/20 hover:bg-slate-900 transition-all active:scale-95 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {checkoutState === 'processing'
            ? 'Accessing...'
            : checkoutState === 'complete'
            ? 'Welcome Inside'
            : 'Join Space'}
        </button>
        
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
