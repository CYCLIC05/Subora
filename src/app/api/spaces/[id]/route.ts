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

  try {
    const { is_closed } = await request.json()
    
    const { data: space, error } = await supabase
      .from('spaces')
      .update({ is_closed })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return NextResponse.json(space)
  } catch (err) {
    console.error('Update space error:', err)
    return NextResponse.json({ error: 'Failed to update space' }, { status: 500 })
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  if (!supabase) return NextResponse.json({ error: 'DB not ready' }, { status: 500 })

  try {
    // Note: In a real app we'd verify the creator_telegram_id from session/headers
    const { error } = await supabase
      .from('spaces')
      .delete()
      .eq('id', id)

    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Delete space error:', err)
    return NextResponse.json({ error: 'Failed to delete space' }, { status: 500 })
  }
}
