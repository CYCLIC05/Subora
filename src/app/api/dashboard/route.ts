import { NextResponse } from 'next/server'
import { getDashboardData } from '@/lib/mockApi'

export async function GET() {
  const data = await getDashboardData()
  return NextResponse.json(data)
}
