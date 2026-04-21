import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { broadcastToUsers } from '@/lib/telegram'

export async function POST(request: Request) {
  if (!supabase) {
    return NextResponse.json({ error: 'Database connection not established' }, { status: 500 })
  }

  try {
    const { spaceIds, message } = await request.json()

    if (!spaceIds || !Array.isArray(spaceIds) || spaceIds.length === 0) {
      return NextResponse.json({ error: 'No spaces selected' }, { status: 400 })
    }

    if (!message || message.trim().length === 0) {
      return NextResponse.json({ error: 'Message cannot be empty' }, { status: 400 })
    }

    // 1. Fetch all unique member Telegram IDs for these spaces
    const { data: subs, error } = await supabase
      .from('space_subscriptions')
      .select('telegram_user_id')
      .in('space_id', spaceIds)

    if (error) throw error

    // Extract unique IDs, filtering out nulls
    const userIds = Array.from(new Set(
      subs
        .map(s => s.telegram_user_id)
        .filter((id): id is number => id !== null && id !== undefined)
    ))

    if (userIds.length === 0) {
      return NextResponse.json({ 
        success: true, 
        sent: 0, 
        message: 'No active members found in selected spaces.' 
      })
    }

    // 2. Trigger the broadcast
    const result = await broadcastToUsers(userIds, message)

    return NextResponse.json({
      success: true,
      sent: result.success,
      failed: result.failed,
      total: userIds.length
    })

  } catch (err: any) {
    console.error('Broadcast API Error:', err)
    return NextResponse.json({ error: 'Failed to deliver broadcast' }, { status: 500 })
  }
}
