import { NextResponse } from 'next/server'
import { getSpaceById } from '@/lib/mockApi'

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const space = await getSpaceById(params.id)
  if (!space) {
    return NextResponse.json({ error: 'Space not found' }, { status: 404 })
  }
  return NextResponse.json(space)
}
