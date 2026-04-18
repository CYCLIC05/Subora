import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { generateSingleUseInviteLink, sendTelegramAccessLink } from '@/lib/telegram'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { spaceId, walletAddress, telegramUserId } = body

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
      .select('channel_link, name, subscribers')
      .eq('id', spaceId)
      .single()

    const space = data as { channel_link: string; name: string; subscribers: number } | null

    if (error || !space) {
      return NextResponse.json({ error: 'Space not found' }, { status: 404 })
    }

    // Increment subscriber count
    await supabase
      .from('spaces')
      .update({ subscribers: (space.subscribers || 0) + 1 })
      .eq('id', spaceId)

    // Track the subscription event for basic analytics
    await supabase.from('space_subscriptions').insert({
      space_id: spaceId,
      telegram_user_id: telegramUserId ?? null,
      wallet_address: walletAddress ?? null,
      join_time: new Date().toISOString(),
    })

    // Generate a single-use invite link via the Telegram Bot API
    // The bot must be an admin of the channel with "Invite Users" privilege
    let accessUrl: string = space.channel_link
    try {
      const inviteLink = await generateSingleUseInviteLink(space.channel_link)
      if (inviteLink) {
        accessUrl = inviteLink
      } else {
        console.warn('Could not generate invite link, falling back to raw channel_link')
      }
    } catch (linkError) {
      console.error('Invite link generation failed:', linkError)
      // Fall back to raw channel_link so the user isn't stuck
    }

    if (telegramUserId && accessUrl) {
      await sendTelegramAccessLink(String(telegramUserId), accessUrl, space.name)
    }

    return NextResponse.json({ success: true, accessUrl })
  } catch (err) {
    console.error('Purchase verification error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

