import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: Request) {
  try {
    const bodyText = await request.text()
    if (!bodyText) {
      return NextResponse.json({ success: false, message: 'Empty request body' }, { status: 400 })
    }
    
    const { query } = JSON.parse(bodyText)

    if (!query || query.trim().length < 2) {
      return NextResponse.json({ success: false, message: 'Query too short' })
    }

    if (!supabase) {
      return NextResponse.json({ success: false, error: 'Database unavailable' }, { status: 500 })
    }

    const cleanQuery = query.trim().toLowerCase()

    // TODO: Implement search_queries table in Supabase for analytics
    // Tracking disabled in V1 - will be re-enabled after database schema update
    /*
    // Upsert the search query
    // This will increment the count if it exists, but Supabase JS doesn't have a direct "increment" upsert
    // so we use a RPC or a manual check. For simplicity and to avoid creating too many RPCs,
    // we'll try a basic upsert with logic or just multiple steps.
    
    // Better way: use a simple RPC to handle the increment logic atomically
    const { error } = await (supabase as any).rpc('track_search_query', {
      search_term: cleanQuery
    })

    if (error) {
      console.error('Search tracking RPC error:', error)
      // Fallback to manual if RPC isn't available
      const { data: existing } = await supabase
        .from('search_queries')
        .select('*')
        .eq('query', cleanQuery)
        .single()

      if (existing) {
        await supabase
          .from('search_queries')
          .update({ 
            count: (existing.count || 0) + 1,
            last_searched: new Date().toISOString()
          })
          .eq('id', existing.id)
      } else {
        await supabase
          .from('search_queries')
          .insert({ query: cleanQuery, count: 1 })
      }
    }
    */

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Search tracking error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
