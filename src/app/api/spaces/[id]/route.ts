import { NextResponse } from 'next/server'
import { getSpaceById } from '@/lib/mockApi'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const space = await getSpaceById(id)
  if (!space) {
    return NextResponse.json({ error: 'Space not found' }, { status: 404 })
  }
  return NextResponse.json(space)
}
