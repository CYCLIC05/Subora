import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  if (!supabase) return NextResponse.json({ error: 'DB not ready' }, { status: 500 })

  const { data: space, error } = await supabase
    .from('spaces')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !space) {
    return NextResponse.json({ error: 'Space not found' }, { status: 404 })
  }
  return NextResponse.json(space)
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  if (!supabase) return NextResponse.json({ error: 'DB not ready' }, { status: 500 })

  const authHeader = request.headers.get('x-telegram-init-data')
  if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { verifyTelegramWebAppData, getTelegramUserFromInitData } = await import('@/lib/auth')
  const isValid = verifyTelegramWebAppData(authHeader, process.env.BOT_TOKEN || '')
  if (!isValid) return NextResponse.json({ error: 'Invalid authentication' }, { status: 401 })

  const requesterId = getTelegramUserFromInitData(authHeader)

  try {
    const { is_closed } = await request.json()
    
    // Ensure the requester owns the space
    const { data: space, error } = await supabase
      .from('spaces')
      .update({ is_closed })
      .eq('id', id)
      .eq('creator_telegram_id', requesterId) // Security check: must own the space
      .select()
      .single()

    if (error || !space) {
      return NextResponse.json({ error: 'Unauthorized or Space not found' }, { status: 403 })
    }
    return NextResponse.json(space)
  } catch (err) {
    console.error('Update space error:', err)
    return NextResponse.json({ error: 'Failed to update space' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  if (!supabase) return NextResponse.json({ error: 'DB not ready' }, { status: 500 })

  const authHeader = request.headers.get('x-telegram-init-data')
  if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { verifyTelegramWebAppData, getTelegramUserFromInitData } = await import('@/lib/auth')
  const isValid = verifyTelegramWebAppData(authHeader, process.env.BOT_TOKEN || '')
  if (!isValid) return NextResponse.json({ error: 'Invalid authentication' }, { status: 401 })

  const requesterId = getTelegramUserFromInitData(authHeader)

  try {
    const { error } = await supabase
      .from('spaces')
      .delete()
      .eq('id', id)
      .eq('creator_telegram_id', requesterId) // Security check: must own the space

    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Delete space error:', err)
    return NextResponse.json({ error: 'Failed to delete space' }, { status: 500 })
  }
}
