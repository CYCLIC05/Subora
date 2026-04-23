import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { generateSingleUseInviteLink, sendTelegramAccessLink } from '@/lib/telegram'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: spaceId } = await params
    const body = await request.json()
    const { subscriptionId } = body

    if (!spaceId || !subscriptionId) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 })
    }

    if (!supabase) {
      return NextResponse.json({ error: 'Database connection failed' }, { status: 500 })
    }

    // 1. Fetch space details
    const { data: space, error: spaceError } = await supabase
      .from('spaces')
      .select('name, channel_link')
      .eq('id', spaceId)
      .single()

    if (spaceError || !space) {
      return NextResponse.json({ error: 'Space not found' }, { status: 404 })
    }

    // 2. Fetch subscription details
    const { data: subscription, error: subError } = await supabase
      .from('space_subscriptions')
      .select('telegram_user_id, status')
      .eq('id', subscriptionId)
      .single()

    if (subError || !subscription) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 })
    }

    if (subscription.status !== 'pending') {
      return NextResponse.json({ error: 'Request is not in pending state' }, { status: 400 })
    }

    // 3. Generate invite link
    let accessUrl: string | null = null
    try {
      accessUrl = await generateSingleUseInviteLink(space.channel_link)
    } catch (e) {
      console.error('Failed to generate invite link on approval', e)
      // Fallback
      accessUrl = space.channel_link.startsWith('https://') ? space.channel_link : `https://t.me/${space.channel_link.replace(/^@/, '')}`
    }

    // 4. Update subscription status
    const { error: updateError } = await supabase
      .from('space_subscriptions')
      .update({ status: 'active', invite_link: accessUrl })
      .eq('id', subscriptionId)

    if (updateError) {
      console.error('Failed to update subscription status', updateError)
      return NextResponse.json({ error: 'Failed to approve request' }, { status: 500 })
    }

    // 5. Update subscribers count
    const { data: spaceObj } = await supabase.from('spaces').select('subscribers').eq('id', spaceId).single()
    if (spaceObj) {
      await supabase.from('spaces').update({ subscribers: (spaceObj.subscribers || 0) + 1 }).eq('id', spaceId)
    }

    // 6. Notify user via DM
    if (subscription.telegram_user_id && accessUrl) {
      await sendTelegramAccessLink(String(subscription.telegram_user_id), accessUrl, space.name)
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Approve request route error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
