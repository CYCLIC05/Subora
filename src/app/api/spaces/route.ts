import { NextResponse } from 'next/server'
import { createSpace, getDiscoverSpaces } from '@/lib/database'
import { notifySpaceCreated } from '@/lib/telegram'
import { revalidatePath } from 'next/cache'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')
  const category = searchParams.get('category') || undefined
  const search = searchParams.get('search') || undefined

  const result = await getDiscoverSpaces({ page, limit, category, search })
  return NextResponse.json(result)
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
