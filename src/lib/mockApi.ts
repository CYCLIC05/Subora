import { Space, supabase, RevenuePoint } from '@/lib/supabase'
import { getTonPriceInUSD, STAR_TO_USD } from '@/lib/tonPrice'

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// ALL MOCK DATA REMOVED - TRANSITIONED TO SUPABASE PRIMARY SOURCE


export type DashboardStat = {
  name: string
  value: string
  delta: string
}

// Removed unused RevenuePoint type as it is now shared from @/lib/supabase

export type DashboardData = {
  stats: DashboardStat[]
  spaces: Space[]
  revenueData: RevenuePoint[]
  tonPrice: number
}

const FALLBACK_REVENUE: RevenuePoint[] = []

const isSupabaseReady = Boolean(supabase)

const spaceSelect = `id, creator_telegram_id, name, description, cover_image, channel_link, tiers, subscribers, is_trending, is_active_today, created_at`

export const getDiscoverSpaces = async (): Promise<Space[]> => {
  if (isSupabaseReady) {
    try {
      const response = await (supabase! as any)
        .from('spaces')
        .select(spaceSelect)
        .order('created_at', { ascending: false })

      if (response.error) {
        console.error('Supabase query error:', response.error)
        return []
      }

      const data = response.data as Space[] | null
      console.log(`Connected to Subora DB: Found ${data?.length || 0} spaces.`)
      return data || []
    } catch (error) {
      console.error('Failed to fetch spaces from Supabase:', error)
      return []
    }
  }

  console.warn('Supabase not configured. Please check your .env.local')
  return []
}

export const getSpaceById = async (id: string): Promise<Space | null> => {
  if (isSupabaseReady) {
    try {
      const response = await (supabase! as any)
        .from('spaces')
        .select(spaceSelect)
        .eq('id', id)
        .single()

      if (response.error) {
        console.warn(`Space ${id} not found in DB`)
        return null
      }

      return response.data as Space | null
    } catch (error) {
      console.error(`Error fetching space ${id}:`, error)
      return null
    }
  }

  return null
}

export const getDashboardData = async (): Promise<DashboardData> => {
  let spaces: Space[] = []
  let chartData: RevenuePoint[] = []
  const tonPrice = await getTonPriceInUSD()
  const today = new Date().toISOString().split('T')[0]

  if (isSupabaseReady) {
    try {
      // 1. Fetch current spaces
      const spacesResponse = await (supabase! as any)
        .from('spaces')
        .select(spaceSelect)
        .order('created_at', { ascending: false })
      
      if (spacesResponse.data) {
        spaces = spacesResponse.data
      }

      // 2. Fetch daily analytics (revenue points)
      const pointsResponse = await (supabase! as any)
        .from('revenue_points')
        .select('*')
        .order('date', { ascending: true })

      if (pointsResponse.data) {
        chartData = pointsResponse.data
      }

      // 3. Lazy Snapshot Logic: If no entry for today, create one
      const hasToday = chartData.some(p => p.date === today)
      if (!hasToday && spaces.length > 0) {
        const currentRevenue = spaces.reduce((sum, space) => {
          const price = space.tiers?.[0]?.price || 0
          return sum + (space.subscribers * price)
        }, 0)
        const currentMembers = spaces.reduce((sum, space) => sum + (space.subscribers || 0), 0)

        const newPoint = { date: today, revenue: currentRevenue, members: currentMembers }
        
        // Background insert so we don't slow down the load
        ;(supabase! as any).from('revenue_points').insert(newPoint).then(() => {
          console.log(`Auto-snapshot created for ${today}`)
        })

        chartData.push(newPoint)
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    }
  }

  const totalMembers = spaces.reduce((sum, space) => sum + (space.subscribers ?? 0), 0)
  const totalStars = spaces.reduce((sum, space) => {
    const price = space.tiers?.[0]?.price || 0
    return sum + (space.subscribers * price)
  }, 0)
  
  const totalUSD = totalStars * STAR_TO_USD
  const totalTON = totalUSD / tonPrice

  const stats: DashboardStat[] = [
    { name: 'Active Spaces', value: spaces.length.toLocaleString(), delta: '+12%' },
    { name: 'Total members', value: totalMembers.toLocaleString(), delta: '+8%' },
    { name: 'Est. Valuation', value: `~${totalTON.toFixed(1)} TON`, delta: `$${totalUSD.toLocaleString()}` },
  ]

  return {
    stats,
    spaces,
    revenueData: chartData.length > 0 ? chartData : FALLBACK_REVENUE,
    tonPrice
  }
}

export type CreateSpacePayload = Omit<Space, 'id' | 'created_at' | 'subscribers' | 'is_trending'> & Partial<Pick<Space, 'subscribers' | 'is_trending'>>

export const createSpace = async (payload: CreateSpacePayload): Promise<Space> => {
  const newSpace: Space = {
    id: crypto.randomUUID?.() ?? `${Date.now()}`,
    created_at: new Date().toISOString(),
    subscribers: 0,
    is_trending: false,
    ...payload,
  }

  if (isSupabaseReady) {
    const response = await (supabase! as any)
      .from('spaces')
      .insert(newSpace)
      .select(spaceSelect)
      .single()

    if (response.error) {
      console.error('Supabase insert error details:', response.error)
      throw new Error(`Database Error: ${response.error.message || 'Failed to insert space'}`)
    }

    const data = response.data as Space | null
    if (data) {
      return data
    }
  }

  return newSpace
}
