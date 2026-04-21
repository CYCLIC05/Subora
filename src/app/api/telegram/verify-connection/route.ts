import { NextResponse } from 'next/server'
import { createBot } from '@/lib/telegram'

export async function POST(request: Request) {
  try {
    const { channelLink } = await request.json()

    if (!channelLink) {
      return NextResponse.json({ error: 'Missing channelLink' }, { status: 400 })
    }

    const bot = createBot()
    
    // Normalize logic
    let chatId = channelLink.trim()
    if (chatId.startsWith('https://t.me/')) {
      const slug = chatId.replace('https://t.me/', '')
      if (slug.startsWith('+')) {
        return NextResponse.json({ 
          success: false, 
          error: 'Private invite links cannot be verified automatically. Please use the Channel Username or Numeric ID instead.' 
        })
      }
      chatId = `@${slug}`
    } else if (!chatId.startsWith('@') && !/^-?\d+$/.test(chatId)) {
      chatId = `@${chatId}`
    }

    try {
      // 1. Get the bot's own information to find its ID (or we can just skip if we know our ID)
      const botMe = await bot.getMe()
      
      // 2. Check bot's status in the chat
      const chatMember = await bot.getChatMember(chatId, botMe.id)
      
      const isAdmin = ['administrator', 'creator'].includes(chatMember.status)
      // Note: 'can_invite_users' is typically present for administrators
      const hasInvitePermission = chatMember.can_invite_users === true || chatMember.status === 'creator'

      if (!isAdmin) {
        return NextResponse.json({ 
          success: false, 
          error: 'Bot is in the channel but is not an administrator. Please promote the bot to Administrator.' 
        })
      }

      if (!hasInvitePermission) {
        return NextResponse.json({ 
          success: false, 
          error: 'Bot is an admin but lacks "Invite Users via Link" permission. Please enable this permission.' 
        })
      }

      return NextResponse.json({ 
        success: true, 
        message: 'Bot connected and authorized successfully!',
        chatTitle: chatMember.chat?.title
      })

    } catch (botError: any) {
      const desc = botError?.response?.body?.description || String(botError)
      if (desc.includes('chat not found')) {
        return NextResponse.json({ 
          success: false, 
          error: 'Channel not found. Ensure the channel is public or the bot has been added to the private channel first.' 
        })
      }
      return NextResponse.json({ 
        success: false, 
        error: `Telegram Error: ${desc}` 
      })
    }

  } catch (err) {
    console.error('Verify connection error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
