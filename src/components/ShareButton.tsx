'use client'

import { Share2 } from 'lucide-react'
import { Space } from '@/lib/supabase'

export function ShareButton({ space }: { space: Space }) {
  const handleShare = async () => {
    try {
      const WebApp = (await import('@twa-dev/sdk')).default
      
      // Get current user for referral tracking
      const username = WebApp.initDataUnsafe.user?.username || 'user'
      
      // Generate the invite link with deep link parameter and referral
      const inviteLink = `https://t.me/SuboraBot/app?startapp=space_${space.id}_ref_${username}`
      
      const shareText = `Join this premium Telegram Space: ${space.name} - Private alpha & daily insights. Subscribe instantly with Stars 👇\n\n${inviteLink}`
      
      // Use Telegram's native inline query sharing
      WebApp.switchInlineQuery(shareText, ['users', 'groups', 'channels'])
      
      // Provide light haptic feedback
      WebApp.HapticFeedback.notificationOccurred('success')
    } catch (error) {
      console.warn('Telegram sharing failed', error)
      
      // Fallback: Copy to clipboard if not in Telegram
      const inviteLink = `https://t.me/SuboraBot/app?startapp=space_${space.id}`
      navigator.clipboard.writeText(inviteLink)
      alert('Link copied to clipboard!')
    }
  }

  return (
    <button
      onClick={handleShare}
      className="flex items-center gap-2 bg-white/95 backdrop-blur shadow-xl p-3 rounded-2xl text-slate-900 hover:bg-white hover:scale-105 transition-all active:scale-95 border border-white/90 group"
    >
      <Share2 className="w-5 h-5 group-hover:text-primary transition-colors" />
      <span className="text-sm font-bold pr-1">Share</span>
    </button>
  )
}
