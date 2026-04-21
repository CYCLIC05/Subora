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
    
    console.log(`Attempting to set Telegram webhook to: ${webhookUrl}`)
    const result = await (bot as any).setWebHook(webhookUrl)

    return NextResponse.json({ 
      success: true, 
      message: `Webhook successfully set to ${webhookUrl}`,
      telegram_response: result 
    })
  } catch (error: any) {
    console.error('Failed to set Telegram webhook:', error)
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Unknown error' 
    }, { status: 500 })
  }
}
