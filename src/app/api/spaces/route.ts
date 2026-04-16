import { NextResponse } from 'next/server'
import { createSpace, getDiscoverSpaces } from '@/lib/mockApi'
import { notifySpaceCreated } from '@/lib/telegram'
import { revalidatePath } from 'next/cache'

export async function GET() {
  const spaces = await getDiscoverSpaces()
  return NextResponse.json(spaces)
}

export async function POST(request: Request) {
  try {
    const payload = await request.json()
    const created = await createSpace(payload)

    try {
      await notifySpaceCreated(created)
    } catch (error) {
      console.error('Telegram notification failed', error)
    }

    revalidatePath('/')
    return NextResponse.json(created)
  } catch (error) {
    console.error('Failed to create space:', error)
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown database error' }, { status: 500 })
  }
}
