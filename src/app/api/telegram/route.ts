import { NextResponse } from 'next/server'
import { handleTelegramWebhookUpdate } from '@/lib/telegram'

export async function POST(request: Request) {
  const update = await request.json()

  try {
    await handleTelegramWebhookUpdate(update)
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Telegram webhook error', error)
    return NextResponse.json({ ok: false, error: (error as Error)?.message ?? 'Unknown error' }, { status: 500 })
  }
}
