import { NextResponse } from 'next/server'
import { createSpace, getDiscoverSpaces } from '@/lib/mockApi'

export async function GET() {
  const spaces = await getDiscoverSpaces()
  return NextResponse.json(spaces)
}

export async function POST(request: Request) {
  const payload = await request.json()
  const created = await createSpace(payload)
  return NextResponse.json(created)
}
