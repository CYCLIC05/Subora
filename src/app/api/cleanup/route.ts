import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  // Gate behind admin secret to prevent unauthorized database wipes
  const { searchParams } = new URL(request.url)
  const key = searchParams.get('key')

  if (!key || key !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // 1. Wipe the spaces table - DELETE ALL ENTRIES
    const { error: spacesError } = await (supabase! as any)
      .from('spaces')
      .delete()
      .not('name', 'eq', '___NON_EXISTENT_SPACE___') 

    // 2. Wipe the analytics table - DELETE ALL ENTRIES
    const { error: revError } = await (supabase! as any)
      .from('revenue_points')
      .delete()
      .not('date', 'eq', '1970-01-01')

    if (spacesError || revError) {
      throw new Error(spacesError?.message || revError?.message)
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Database successfully wiped of all mock data. Your app is now a blank slate.' 
    })
  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 })
  }
}
