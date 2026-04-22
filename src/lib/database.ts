import { Space, supabase, RevenuePoint, SubscriptionTier, Transaction } from '@/lib/supabase'
import { getTonPriceInUSD, STAR_TO_USD } from '@/lib/tonPrice'

export type DashboardStat = {
  name: string
  value: string
  delta: string
}

export type SpaceRevenue = {
  spaceId: string
  name: string
  revenue: number
}

export type DashboardMember = {
  id: string
  telegram_user_id: number | null
  spaceName: string
  joinDate: string
  amountPaid: number
  currency: string
  status: 'Active' | 'Paused'
}

export type DashboardData = {
  stats: DashboardStat[]
  spaces: Space[]
  revenueData: RevenuePoint[]
  revenueBySpace: SpaceRevenue[]
  allMembers: DashboardMember[]
  tonPrice: number
}

const FALLBACK_REVENUE: RevenuePoint[] = []

const isSupabaseReady = Boolean(supabase)

const spaceSelect = `id, creator_telegram_id, name, description, cover_image, channel_link, creator_name, category, is_closed, tiers, subscribers, is_trending, is_active_today, created_at, payment_address, referrer_payment_address`

export const getDiscoverSpaces = async (): Promise<Space[]> => {
  if (!isSupabaseReady) {
    console.warn('Supabase not configured. Please check your .env.local')
    return []
  }

  try {
    const { data, error } = await supabase!
      .from('spaces')
      .select(spaceSelect)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Supabase query error:', error)
      return []
    }

    return data as Space[] || []
  } catch (error) {
    console.error('Failed to fetch spaces from Supabase:', error)
    return []
  }
}

export const getSpaceById = async (id: string): Promise<Space | null> => {
  if (!isSupabaseReady) return null

  try {
    const { data, error } = await supabase!
      .from('spaces')
      .select(spaceSelect)
      .eq('id', id)
      .single()

    if (error) {
      console.warn(`Space ${id} not found in DB`)
      return null
    }

    return data as Space | null
  } catch (error) {
    console.error(`Error fetching space ${id}:`, error)
    return null
  }
}

export const getDashboardData = async (): Promise<DashboardData> => {
  let spaces: Space[] = []
  let chartData: RevenuePoint[] = []
  let allMembers: DashboardMember[] = []
  let revenueBySpace: SpaceRevenue[] = []
  const tonPrice = await getTonPriceInUSD()
  const today = new Date().toISOString().split('T')[0]

  let totalUSD = 0
  if (isSupabaseReady) {
    try {
      // 1. Fetch current spaces
      const { data: spacesData } = await supabase!
        .from('spaces')
        .select(spaceSelect)
        .order('created_at', { ascending: false })
      
      if (spacesData) {
        spaces = spacesData as Space[]
      }

      // 2. Fetch all successful transactions for precise revenue
      const { data: txData } = await supabase!
        .from('transactions')
        .select('amount, currency, space_id')
        .eq('status', 'success')

      const revenueMap = new Map<string, number>()

      if (txData) {
        txData.forEach(tx => {
          let usdVal = 0
          if (tx.currency === 'Stars') {
            usdVal = (Number(tx.amount) * STAR_TO_USD)
          } else if (tx.currency === 'TON') {
            usdVal = (Number(tx.amount) * tonPrice)
          } else if (tx.currency === 'USDT') {
            usdVal = Number(tx.amount)
          }
          totalUSD += usdVal
          
          if (tx.space_id) {
            revenueMap.set(tx.space_id, (revenueMap.get(tx.space_id) || 0) + usdVal)
          }
        })
      }

      // Populate revenueBySpace
      revenueBySpace = spaces.map(s => ({
        spaceId: s.id,
        name: s.name,
        revenue: Math.round(revenueMap.get(s.id) || 0)
      })).filter(r => r.revenue > 0)

      // 3. Fetch all members across all spaces
      const { data: subsData } = await supabase!
        .from('space_subscriptions')
        .select(`*, space:spaces(name)`)
        .order('join_time', { ascending: false })

      if (subsData) {
        allMembers = subsData.map((s: any) => ({
          id: s.id,
          telegram_user_id: s.telegram_user_id,
          spaceName: s.space?.name || 'Unknown Space',
          joinDate: s.join_time,
          amountPaid: s.amount_paid || 0,
          currency: s.currency || 'TON',
          status: 'Active'
        }))
      }

      // 4. Dynamic Historical Reconstruction
      // Calculate cumulative trends for the last 14 days
      const days = 14
      const points: RevenuePoint[] = []
      const now = new Date()
      
      // Fetch data for trend reconstruction
      const { data: allTx } = await supabase!
        .from('transactions')
        .select('amount, currency, created_at')
        .eq('status', 'success')
        .order('created_at', { ascending: true })

      const { data: allSubs } = await supabase!
        .from('space_subscriptions')
        .select('join_time')
        .order('join_time', { ascending: true })

      for (let i = days; i >= 0; i--) {
        const d = new Date(now)
        d.setDate(d.getDate() - i)
        const dateStr = d.toISOString().split('T')[0]
        const cutoff = new Date(d.setHours(23, 59, 59, 999)).getTime()

        // Calculate cumulative revenue up to this day's end
        let rollingUSD = 0
        allTx?.forEach(tx => {
          if (new Date(tx.created_at!).getTime() <= cutoff) {
            let val = 0
            if (tx.currency === 'Stars') val = (Number(tx.amount) * STAR_TO_USD)
            else if (tx.currency === 'TON') val = (Number(tx.amount) * tonPrice)
            else if (tx.currency === 'USDT') val = Number(tx.amount)
            rollingUSD += val
          }
        })

        // Calculate cumulative members up to this day's end
        let rollingMembersCount = allSubs?.filter(s => new Date(s.join_time).getTime() <= cutoff).length || 0

        points.push({
          date: dateStr,
          revenue: Math.floor(rollingUSD / STAR_TO_USD),
          members: rollingMembersCount
        })
      }

      chartData = points

    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    }
  }

  const totalMembers = spaces.reduce((sum, space) => sum + (space.subscribers ?? 0), 0)
  const totalTON = totalUSD / tonPrice

  const stats: DashboardStat[] = [
    { name: 'Active Spaces', value: spaces.length.toLocaleString(), delta: '+12%' },
    { name: 'Total members', value: totalMembers.toLocaleString(), delta: '+8%' },
    { name: 'Total Revenue', value: `~${totalTON.toFixed(1)} TON`, delta: `$${totalUSD.toLocaleString()}` },
  ]

  return {
    stats,
    spaces,
    revenueData: chartData.length > 0 ? chartData : FALLBACK_REVENUE,
    revenueBySpace,
    allMembers,
    tonPrice
  }
}

export type CreateSpacePayload = Omit<Space, 'id' | 'created_at' | 'subscribers' | 'is_trending'> & Partial<Pick<Space, 'subscribers' | 'is_trending' | 'category'>>

export const createSpace = async (payload: CreateSpacePayload): Promise<Space> => {
  if (!isSupabaseReady) {
    throw new Error('Database not configured')
  }

  const { data, error } = await supabase!
    .from('spaces')
    .insert({
      ...payload,
      subscribers: 0,
      is_trending: false,
    })
    .select(spaceSelect)
    .single()

  if (error) {
    console.error('Supabase insert error details:', error)
    throw new Error(`Database Error: ${error.message || 'Failed to insert space'}`)
  }

  return data as Space
}

export type SubscriptionWithSpace = Space & {
  invite_link?: string;
  amount_paid?: number;
  currency_paid?: string;
}

export const getUserSubscriptions = async (telegramUserId: number | string): Promise<SubscriptionWithSpace[]> => {
  if (!isSupabaseReady) return []

  try {
    const { data: subs, error: subError } = await supabase!
      .from('space_subscriptions')
      .select(`*, space:spaces(${spaceSelect})`)
      .eq('telegram_user_id', typeof telegramUserId === 'string' ? parseInt(telegramUserId, 10) : telegramUserId)
      .order('join_time', { ascending: false })

    if (subError || !subs) return []

    return subs.map((s: any) => ({
      ...s.space,
      invite_link: s.invite_link,
      amount_paid: s.amount_paid,
      currency_paid: s.currency
    })) as SubscriptionWithSpace[]
  } catch (error) {
    console.error('Error fetching user subscriptions:', error)
    return []
  }
}

export type SpaceMember = {
  telegram_user_id: number | null;
  join_time: string;
  wallet_address?: string | null;
}

export const getSpaceMembers = async (spaceId: string): Promise<SpaceMember[]> => {
  if (!isSupabaseReady) return []

  try {
    const { data, error } = await supabase!
      .from('space_subscriptions')
      .select('telegram_user_id, join_time, wallet_address')
      .eq('space_id', spaceId)
      .order('join_time', { ascending: false })

    if (error) return []
    return data as SpaceMember[]
  } catch (error) {
    console.error('Error fetching space members:', error)
    return []
  }
}

/**
 * Fetch all Subora-internal transactions for a specific wallet address.
 */
export const getUserTransactions = async (walletAddress: string): Promise<Transaction[]> => {
  if (!isSupabaseReady || !walletAddress) return []

  try {
    const { data, error } = await supabase!
      .from('transactions')
      .select('*')
      .eq('wallet_address', walletAddress)
      .order('created_at', { ascending: false })

    if (error) return []
    return data as Transaction[]
  } catch (error) {
    console.error('Error fetching user transactions:', error)
    return []
  }
}
