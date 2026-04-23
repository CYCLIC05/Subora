import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { spaceId, telegramUserId, referralSource } = body

    if (!spaceId) {
      return NextResponse.json({ error: 'Missing spaceId' }, { status: 400 })
    }

    if (!supabase) {
      return NextResponse.json({ error: 'Database connection failed' }, { status: 500 })
    }

    // --- Fetch Space ---
    const { data, error } = await supabase
      .from('spaces')
      .select('name, is_closed')
      .eq('id', spaceId)
      .single()

    const space = data as { name: string; is_closed: boolean } | null

    if (error || !space) {
      return NextResponse.json({ error: 'Space not found' }, { status: 404 })
    }

    if (space.is_closed) {
      return NextResponse.json({ error: 'Enrollment is currently closed for this space' }, { status: 403 })
    }

    // --- Record pending subscription ---
    const { error: insertError } = await supabase.from('space_subscriptions').insert({
      space_id: spaceId,
      telegram_user_id: telegramUserId ?? null,
      wallet_address: null,
      referral_source: referralSource ?? null,
      currency: 'FREE',
      amount_paid: 0,
      invite_link: null,
      join_time: new Date().toISOString(),
      status: 'pending'
    })

    if (insertError) {
      console.error('[request-join] Insert error:', insertError)
      return NextResponse.json({ error: 'Failed to record request' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Request join route error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
