'use client'

import { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Space } from '@/lib/supabase'
import { motion } from 'framer-motion'
import { useMockWallet } from './WalletProvider'

const trustLines = [
  'Instant access via Telegram',
  'Secure payment with Stars',
]

export function SpacePurchasePanel({ space }: { space: Space }) {
  const searchParams = useSearchParams()
  const referralSource = searchParams.get('source') || 'direct'
  const [selectedTierIndex, setSelectedTierIndex] = useState(0)
  const { walletAddress, isConnecting, connectWallet } = useMockWallet()
  const paymentAddress = space.payment_address ?? process.env.NEXT_PUBLIC_TON_PAYMENT_ADDRESS ?? ''
  
  const isWalletConnected = Boolean(walletAddress)

  // Check if we are inside Telegram
  const [isInsideTelegram, setIsInsideTelegram] = useState(false)

  useEffect(() => {
    import('@twa-dev/sdk').then(m => {
      if (m.default?.initDataUnsafe?.user?.id) setIsInsideTelegram(true)
    }).catch(() => {})
  }, [])

  const [checkoutState, setCheckoutState] = useState<'idle' | 'processing' | 'complete'>('idle')
  const [accessUrl, setAccessUrl] = useState<string | null>(null)
  const tiers = space.tiers?.length ? space.tiers : [{ name: 'Standard Access', price: 0, duration: 'month' }]
  const currentTier = tiers[selectedTierIndex] ?? tiers[0]

  const handleTonCheckout = useCallback(async () => {
    console.log('[SpacePurchasePanel] Payment triggered', { walletConnected: !!walletAddress, paymentAddress })
    
    if (!paymentAddress) {
      alert('Payment address is not configured for this space. Please contact the creator.')
      return
    }

    // NEW: If not connected, trigger connection first for smoother UX
    let currentWallet = walletAddress;
    if (!currentWallet) {
      try {
        await connectWallet();
        // Since connectWallet updates state, we might need a small delay or use the updated value.
        // However, the simple UX is to let the user click again or await the state change.
        // For the mock wallet, we can just assume it worked or check the return format.
        return; // Return so the user sees the "connected" state and then clicks Pay again (or we could recursive call)
      } catch (err) {
        alert('Failed to connect wallet.');
        return;
      }
    }

    setCheckoutState('processing')

    try {
      const messages = [];
      const spaceCreatedAt = new Date(space.created_at).getTime();
      const thirtyDaysInMs = 30 * 24 * 60 * 60 * 1000;
      const isFirstMonth = (Date.now() - spaceCreatedAt) < thirtyDaysInMs;

      if (space.referrer_payment_address && isFirstMonth) {
        // 7% to the creator-referrer, 93% to the creator
        // Rule: Only applies to the referred creator's first month
        console.log('[Referral] 7% referral split active (First Month rule)');
        const referrerCut = currentTier.price * 0.07;
        const creatorCut = currentTier.price * 0.93;
        
        messages.push({
          address: paymentAddress,
          amount: String(Math.floor(creatorCut * 1_000_000_000)),
        });
        messages.push({
          address: space.referrer_payment_address,
          amount: String(Math.floor(referrerCut * 1_000_000_000)),
        });
      } else {
        // 100% to creator
        if (space.referrer_payment_address && !isFirstMonth) {
          console.log('[Referral] Referral address found but bypassed (First Month ended)');
        }
        messages.push({
          address: paymentAddress,
          amount: String(currentTier.price * 1_000_000_000),
        });
      }

      const tx = {
        validUntil: Math.floor(Date.now() / 1000) + 300,
        network: '-239',
        messages,
      }

      console.log('--- SIMULATING BLOCKCHAIN TRANSACTION ---')
      console.log('Sending from mock wallet:', walletAddress)
      console.log('Payload data:', JSON.stringify(tx, null, 2))
      console.log('-----------------------------------------')
      
      // Simulate real-world contract signing block time
      await new Promise(res => setTimeout(res, 2500));

      let telegramUserId: number | undefined
      try {
        const WebApp = (await import('@twa-dev/sdk')).default
        telegramUserId = WebApp.initDataUnsafe.user?.id
      } catch (error) {
        console.warn('Telegram WebApp user id unavailable', error)
      }

      try {
        const res = await fetch('/api/purchase', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            spaceId: space.id,
            walletAddress,
            telegramUserId,
            amount: String(currentTier.price * 1_000_000_000),
            referralSource,
          })
        })
        const data = await res.json()
        if (data.accessUrl) {
          setAccessUrl(data.accessUrl)
        } else {
          setAccessUrl(space.channel_link)
        }
      } catch (e) {
        console.error('Failed to verify purchase', e)
        setAccessUrl(space.channel_link)
      }

      setCheckoutState('complete')
    } catch (error) {
      console.warn('Payment failed', error)
      alert('Payment failed. Try again.')
      setCheckoutState('idle')
    }
  }, [currentTier.price, paymentAddress, space, walletAddress, connectWallet])

  useEffect(() => {
    if (!space || space.is_closed) {
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
            {space.is_closed 
              ? 'This community is currently at capacity or closed by the creator. New enrollments are paused.' 
              : 'Connect a TON wallet to authorize payment and unlock automated access for this space.'}
          </p>
          {isWalletConnected ? (
            <p className="mt-3 text-xs font-semibold text-emerald-700">Connected wallet: {walletAddress}</p>
          ) : (
            <div className="mt-4">
              <button
                onClick={connectWallet}
                disabled={isConnecting}
                className="w-full rounded-3xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-900 transition disabled:opacity-70"
              >
                {isConnecting ? 'Connecting Mock Wallet...' : 'Connect Wallet'}
              </button>
            </div>
          )}

          {!paymentAddress && (
            <p className="mt-4 text-xs text-rose-500">No payment address configured for this community.</p>
          )}
        </div>

        <button
          onClick={handleTonCheckout}
          disabled={checkoutState !== 'idle' || !paymentAddress || space.is_closed}
          className={`w-full rounded-[30px] px-6 py-5 text-xl font-bold text-white shadow-2xl transition-all active:scale-95 disabled:cursor-not-allowed disabled:opacity-70 ${
            space.is_closed ? 'bg-slate-500' : 'bg-slate-950 shadow-slate-950/20 hover:bg-slate-900'
          }`}
        >
          {space.is_closed
            ? 'Sold Out'
            : checkoutState === 'processing'
            ? 'Processing payment...'
            : checkoutState === 'complete'
            ? 'Success!'
            : `Pay ${currentTier.price} Stars`}
        </button>

        {checkoutState === 'complete' && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-primary/[0.08] border border-primary/20 rounded-[30px] p-6 text-center space-y-4 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -translate-y-12 translate-x-12" />
            <p className="text-sm font-bold text-primary italic relative z-10">You're in! Access is unlocked.</p>
            <p className="text-sm text-slate-800 font-semibold leading-relaxed relative z-10">
              Click below to enter the community, then invite your friends to join the Alpha.
            </p>
            {accessUrl && (
              <a 
                href={accessUrl.startsWith('http') ? accessUrl : `https://t.me/${accessUrl.replace(/^@/, '')}`}
                target="_blank" 
                rel="noopener noreferrer"
                className="block w-full bg-slate-950 text-white py-4 rounded-2xl text-[12px] font-bold uppercase tracking-widest hover:bg-slate-900 transition-all font-heading shadow-xl relative z-10 mb-3"
              >
                Open Private Channel
              </a>
            )}
            <button
              onClick={async () => {
                const WebApp = (await import('@twa-dev/sdk')).default
                const username = WebApp.initDataUnsafe.user?.username || 'user'
                const inviteLink = `https://t.me/SuboraBot/app?startapp=space_${space.id}_ref_${username}`
                const shareText = `I just joined ${space.name} on Subora. The alpha inside is insane. Join me here: ${inviteLink}`
                
                if (WebApp.isVersionAtLeast('6.7')) {
                  WebApp.switchInlineQuery(shareText, ['users', 'groups', 'channels'])
                } else {
                  // Fallback for older Telegram versions
                  navigator.clipboard.writeText(shareText)
                  if (WebApp.showPopup && WebApp.isVersionAtLeast('6.1')) {
                    WebApp.showPopup({
                      title: 'Link copied!',
                      message: 'Your custom invite link was copied to your clipboard. Share it with your friends!',
                      buttons: [{ type: 'ok' }]
                    })
                  } else {
                    alert('Invite link copied to clipboard!')
                  }
                }
              }}
              className="w-full bg-primary text-white py-4 rounded-2xl text-[11px] font-bold uppercase tracking-widest hover:bg-primary/90 transition-all font-heading shadow-lg shadow-primary/20 relative z-10"
            >
              Invite a Friend
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
