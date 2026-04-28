import { NextResponse } from 'next/server'
import { createBot } from '@/lib/telegram'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const url = searchParams.get('url')
  const secret = searchParams.get('secret')

  if (!url) {
    return NextResponse.json({ 
      error: 'Missing "url" parameter. usage: /api/telegram/setup?url=https://your-domain.vercel.app&secret=YOUR_TOKEN' 
    })
  }

  // Security: only the person with the token or a fixed secret should be able to set this
  if (secret !== process.env.TELEGRAM_BOT_TOKEN) {
    return NextResponse.json({ error: 'Unauthorized. The "secret" parameter must match your TELEGRAM_BOT_TOKEN.' })
  }

  try {
    const bot = createBot()
    const webhookUrl = `${url}/api/telegram`
    const botToken = process.env.TELEGRAM_BOT_TOKEN
    
    // 1. Set Webhook
    console.log(`Setting Webhook: ${webhookUrl}`)
    await (bot as any).setWebHook(webhookUrl)

    // 2. Set Menu Button (The "Open App" button)
    // We use raw fetch to ensure we hit the latest Telegram API features
    console.log(`Setting Menu Button to: ${url}`)
    const menuRes = await fetch(`https://api.telegram.org/bot${botToken}/setChatMenuButton`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        menu_button: {
          type: 'web_app',
          text: 'Open Subora',
          web_app: { url: `${url}/` }
        }
      })
    })
    const menuData = await menuRes.json()

    // 3. Set Commands
    console.log(`Setting Bot Commands`)
    await (bot as any).setMyCommands([
      { command: 'start', description: 'Launch Subora Mini App' },
      { command: 'discover', description: 'Explore premium spaces' },
      { command: 'help', description: 'Get support' }
    ])

    return NextResponse.json({ 
      success: true, 
      message: `Bot activated successfully!`,
      details: {
        webhook: webhookUrl,
        menuButton: menuData.ok ? 'Configured' : 'Failed',
        commands: 'Registered'
      }
    })
  } catch (error: any) {
    console.error('Bot activation failed:', error)
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Unknown error' 
    }, { status: 500 })
  }
}
