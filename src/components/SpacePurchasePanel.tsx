'use client'

import { useEffect, useState } from 'react'
import { Space } from '@/lib/supabase'
import { Check, Lock, ArrowRight, Zap } from 'lucide-react'
import { motion } from 'framer-motion'

export function SpacePurchasePanel({ space }: { space: Space }) {
  const [selectedTier, setSelectedTier] = useState<'tier1' | 'tier2'>('tier1')

  useEffect(() => {
    if (!space) {
      return
    }

    let cleanup = () => {}

    const initMainButton = async () => {
      try {
        const WebApp = (await import('@twa-dev/sdk')).default
        const currentTier = space.tiers[selectedTier]

        WebApp.MainButton.setText(`Pay ${currentTier.price} ⭐ • Secure Escrow`)
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
  }, [space, selectedTier])

  const [checkoutState, setCheckoutState] = useState<'idle' | 'processing' | 'complete'>('idle')
  const currentTier = space.tiers[selectedTier]
  const tiers = [space.tiers.tier1, space.tiers.tier2].filter(Boolean)

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
      <h2 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-6">Select Service Plan</h2>

      {tiers.map((tier, index) => {
        const tierKey = index === 0 ? 'tier1' : 'tier2'
        const isSelected = selectedTier === tierKey

        return (
          <motion.div
            key={tier.name}
            onClick={() => setSelectedTier(tierKey as 'tier1' | 'tier2')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`p-8 rounded-[40px] border-2 cursor-pointer transition-all overflow-hidden shadow-xl ${
              isSelected
                ? 'border-primary bg-primary/[0.02] shadow-primary/10'
                : 'border-zinc-100 bg-white hover:border-zinc-300 shadow-zinc-950/5'
            }`}
          >
            {isSelected && <div className="absolute inset-0 bg-primary/[0.03]" />}
            <div className="relative z-10 flex justify-between items-start mb-8">
              <div className="space-y-1">
                <h3 className="font-heading text-xl font-bold tracking-tight text-zinc-950">{tier.name}</h3>
                {isSelected && <p className="text-[10px] text-primary font-bold uppercase tracking-widest">Selected</p>}
              </div>
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${isSelected ? 'bg-primary/10' : 'bg-zinc-50'}`}>
                <Zap className={`w-6 h-6 ${isSelected ? 'text-primary' : 'text-zinc-400'}`} />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-mono font-bold tracking-tighter text-zinc-950">{tier.price}</span>
                <span className={`text-xs font-bold uppercase tracking-widest ${isSelected ? 'text-primary/80' : 'text-zinc-400'}`}>Stars</span>
              </div>
              <p className="text-sm font-semibold text-zinc-500 tracking-tight">Access for one {tier.duration}</p>
            </div>

            {isSelected && (
              <div className="pt-8">
                <div className="flex items-center justify-center gap-3 text-[10px] font-bold text-primary bg-white shadow-pro p-4 rounded-2xl border border-primary/10 uppercase tracking-widest">
                  <Lock className="w-3.5 h-3.5" />
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
          : `Buy ${currentTier.name} for ${currentTier.price} Stars`}
      </button>

      <footer className="text-center space-y-6 px-10 pt-8 border-t border-zinc-100/50">
        <div className="flex items-center justify-center gap-3 opacity-60 grayscale hover:grayscale-0 transition-all">
          <div className="w-6 h-6 bg-zinc-900 rounded-lg flex items-center justify-center shadow-lg">
            <Lock className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-[11px] font-bold uppercase tracking-widest text-zinc-950">Powered by Telegram Stars</span>
        </div>
        <div className="space-y-1">
          <p className="text-[9px] text-zinc-400 font-bold tracking-[0.2em]">SMART CONTRACT ESCROW</p>
          <p className="text-[9px] text-zinc-400 font-bold tracking-[0.1em] opacity-80">FUNDS RELEASED AFTER 24H VERIFICATION</p>
        </div>
      </footer>
    </div>
  )
}
