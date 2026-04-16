import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { spaceId, walletAddress } = body

    if (!spaceId) {
      return NextResponse.json({ error: 'Missing spaceId' }, { status: 400 })
    }

    // In a production environment, we would query the TON blockchain here 
    // to verify that `walletAddress` successfully transferred the required amount
    // to the creator's paymentAddress before proceeding.

    if (!supabase) {
        return NextResponse.json({ error: 'Database connection failed' }, { status: 500 })
    }

    const { data, error } = await supabase
      .from('spaces')
      .select('channel_link')
      .eq('id', spaceId)
      .single()

    const space = data as { channel_link: string } | null

    if (error || !space) {
      return NextResponse.json({ error: 'Space not found' }, { status: 404 })
    }

    // In a future update, we would generate a 1-time invite link using Telegram Bot API
    // e.g. await bot.createChatInviteLink(...)
    
    // For now, return the channel fallback link
    return NextResponse.json({ success: true, accessUrl: space.channel_link })
  } catch (err) {
    console.error('Purchase verification error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
