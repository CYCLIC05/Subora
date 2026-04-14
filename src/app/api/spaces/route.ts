import { NextResponse } from 'next/server'
import { createSpace, getDiscoverSpaces } from '@/lib/mockApi'
import { notifySpaceCreated } from '@/lib/telegram'

export async function GET() {
  const spaces = await getDiscoverSpaces()
  return NextResponse.json(spaces)
}

export async function POST(request: Request) {
  const payload = await request.json()
  const created = await createSpace(payload)

  try {
    await notifySpaceCreated(created)
  } catch (error) {
    console.error('Telegram notification failed', error)
  }

  return NextResponse.json(created)
}
