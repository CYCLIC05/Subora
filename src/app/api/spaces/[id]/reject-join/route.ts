import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const spaceId = params.id
    const body = await request.json()
    const { subscriptionId } = body

    if (!spaceId || !subscriptionId) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 })
    }

    if (!supabase) {
      return NextResponse.json({ error: 'Database connection failed' }, { status: 500 })
    }

    // 1. Fetch subscription details
    const { data: subscription, error: subError } = await supabase
      .from('space_subscriptions')
      .select('status')
      .eq('id', subscriptionId)
      .single()

    if (subError || !subscription) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 })
    }

    if (subscription.status !== 'pending') {
      return NextResponse.json({ error: 'Request is not in pending state' }, { status: 400 })
    }

    // 2. Update subscription status
    const { error: updateError } = await supabase
      .from('space_subscriptions')
      .update({ status: 'rejected' })
      .eq('id', subscriptionId)

    if (updateError) {
      console.error('Failed to update subscription status', updateError)
      return NextResponse.json({ error: 'Failed to reject request' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Reject request route error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
