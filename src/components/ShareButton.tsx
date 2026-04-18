'use client'

import { Share2 } from 'lucide-react'
import { Space } from '@/lib/supabase'

export function ShareButton({ space }: { space: Space }) {
  const handleShare = async () => {
    try {
      const WebApp = (await import('@twa-dev/sdk')).default
      const username = WebApp.initDataUnsafe.user?.username || 'user'
      const inviteLink = `https://t.me/SuboraBot/app?startapp=space_${space.id}_ref_${username}`
      const shareText = `Join this premium Telegram Space: ${space.name} - Private alpha & daily insights.\n\n${inviteLink}`
      
      // Check if the current Telegram version supports switchInlineQuery (v6.7+)
      if (WebApp.isVersionAtLeast('6.7')) {
        WebApp.switchInlineQuery(shareText, ['users', 'groups', 'channels'])
        WebApp.HapticFeedback.notificationOccurred('success')
      } else {
        // Fallback for older Telegram versions or desktop: Copy to clipboard
        navigator.clipboard.writeText(shareText)
        
        // Use Telegram popup only when the version supports it.
        if (WebApp.showPopup && WebApp.isVersionAtLeast('6.1')) {
          WebApp.showPopup({
            title: 'Link copied!',
            message: 'Your custom invite link was copied to your clipboard. Paste it in any chat to share.',
            buttons: [{ type: 'ok' }]
          })
        } else {
          alert('Invite link copied to clipboard!')
        }

        WebApp.HapticFeedback.notificationOccurred('warning')
      }
    } catch (error) {
      console.warn('Telegram sharing failed', error)
      const fallbackLink = `https://t.me/SuboraBot/app?startapp=space_${space.id}`
      navigator.clipboard.writeText(fallbackLink)
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
