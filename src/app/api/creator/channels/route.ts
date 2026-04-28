import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const telegramId = searchParams.get('telegram_id')

  if (!telegramId) {
    return NextResponse.json({ error: 'Missing telegram_id' }, { status: 400 })
  }

  if (supabase) {
    const { data, error } = await supabase
      .from('creator_channels' as any)
      .select('*')
      .eq('creator_telegram_id', Number(telegramId))

    if (!error && data) {
      return NextResponse.json({ channels: data })
    }
  }

  // Fallback to empty if table doesn't exist
  return NextResponse.json({ channels: [] })
}
