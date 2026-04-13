'use client'

import { useEffect, useState } from 'react'
import { Space } from '@/lib/supabase'
import { motion } from 'framer-motion'

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

        WebApp.MainButton.setText(`Pay ${currentTier.price} • Secure Escrow`)
        WebApp.MainButton.show()

        const handleMainButtonClick = () => {
          WebApp.HapticFeedback.notificationOccurred('success')
          alert(`Proceeding to encrypted Vault checkout for ${space.name} - ${currentTier.name}`)
        }

        WebApp.MainButton.onClick(handleMainButtonClick)
        cleanup = () => {
          WebApp.MainButton.offClick(handleMainButtonClick)
          WebApp.MainButton.hide()
        }
      } catch (e) {}
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
    } catch {
      setCheckoutState('idle')
    }
  }

  return (
    <div className="sticky top-28 space-y-8">
      <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">Select Service Plan</h2>

      {tiers.map((tier, index) => {
        const isSelected = selectedTierIndex === index

        return (
          <motion.div
            key={`${tier.name}-${index}`}
            onClick={() => setSelectedTierIndex(index)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`relative p-8 rounded-[40px] border-2 cursor-pointer transition-all overflow-hidden shadow-xl ${
              isSelected
                ? 'border-primary bg-primary/[0.06] shadow-primary/15'
                : 'border-slate-200 bg-white hover:border-slate-300 shadow-slate-200/60'
            }`}
          >
            {isSelected && <div className="absolute inset-0 bg-primary/[0.06]" />}
            <div className="relative z-10 mb-8">
              <h3 className="font-heading text-xl font-bold tracking-tight text-slate-950">{tier.name}</h3>
              {isSelected && <p className="mt-2 text-[10px] text-primary font-bold uppercase tracking-widest">Selected</p>}
            </div>

            <div className="space-y-4 relative z-10">
              <div className="flex items-baseline gap-3">
                <span className="text-5xl font-mono font-bold tracking-tighter text-zinc-950">{tier.price}</span>
                <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">per {tier.duration}</span>
              </div>
              <p className="text-sm font-semibold text-zinc-500 tracking-tight">Full access for one {tier.duration}</p>
            </div>

            {isSelected && (
              <div className="relative z-10 pt-8">
                <div className="text-[10px] font-bold uppercase tracking-widest text-primary bg-white/90 p-4 rounded-2xl border border-primary/10 text-center">
                  Escrow Ready
                </div>
              </div>
            )}
          </motion.div>
        )
      })}

      <button
        onClick={handleLocalCheckout}
        disabled={checkoutState === 'processing'}
        className="w-full rounded-3xl bg-primary px-5 py-4 text-sm font-bold text-white shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all disabled:cursor-not-allowed disabled:opacity-70"
      >
        {checkoutState === 'processing'
          ? 'Processing purchase...'
          : checkoutState === 'complete'
          ? 'Purchase complete'
          : `Buy ${currentTier.name} for ${currentTier.price}`}
      </button>

      <footer className="text-center space-y-6 px-10 pt-8 border-t border-zinc-100/50">
        <div className="text-[11px] font-bold uppercase tracking-widest text-zinc-950 opacity-75">
          Powered by Telegram
        </div>
        <div className="space-y-1">
          <p className="text-[9px] text-zinc-400 font-bold tracking-[0.2em]">SMART CONTRACT ESCROW</p>
          <p className="text-[9px] text-zinc-400 font-bold tracking-[0.1em] opacity-80">FUNDS RELEASED AFTER 24H VERIFICATION</p>
        </div>
      </footer>
    </div>
  )
}
