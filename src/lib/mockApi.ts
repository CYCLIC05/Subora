import { Space, supabase } from '@/lib/supabase'

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const MOCK_SPACES: Space[] = [
  {
    id: '1',
    creator_telegram_id: 123,
    name: 'Alpha Trading Signals',
    description: 'Real-time market analysis and trade setups for high-performing traders.',
    cover_image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&q=80',
    channel_link: '@alphatrading',
    payment_address: 'EQD8mQ_z1fJnQzFb_ZKM1FjUHjJHjsjxJi9Td5WPUs47I7qb',
    tiers: [
      { name: 'Weekly Access', price: 99, duration: 'week' },
      { name: 'Monthly Access', price: 299, duration: 'month' },
    ],
    subscribers: 420,
    is_trending: true,
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(), // 2 hours ago
  },
  {
    id: '2',
    creator_telegram_id: 456,
    name: 'TON Builders Labs',
    description: 'Technical deep-dives and early access to the next generation of TON apps.',
    cover_image: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=1200&q=80',
    channel_link: '@tonbuilders',
    payment_address: 'EQCjgd0Vj-7weymWTaa7dnmzlM9RkE8fOqWOGow8JJEg4zaDS',
    tiers: [
      { name: 'Monthly Access', price: 49, duration: 'month' },
      { name: 'Yearly Access', price: 499, duration: 'year' },
    ],
    subscribers: 1280,
    is_trending: true,
    created_at: new Date(Date.now() - 3600000 * 24).toISOString(), // 1 day ago
  },
  {
    id: '3',
    creator_telegram_id: 789,
    name: 'Macro Insights',
    description: 'Global economic trends and strategic asset allocation for long-term growth.',
    cover_image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1200&q=80',
    channel_link: '@macroinsights',
    payment_address: 'EQDW1zJZcKLlfISW0eXnY5GpQpSldVV1A7l8C7oH1P8dQiTxa',
    tiers: [
      { name: 'Monthly Access', price: 150, duration: 'month' },
    ],
    subscribers: 720,
    created_at: new Date(Date.now() - 3600000 * 4).toISOString(), // 4 hours ago
  },
  {
    id: '4',
    creator_telegram_id: 101,
    name: 'DeFi Alpha Elite',
    description: 'The definitive source for decentralized finance yields, protocols, and security.',
    cover_image: 'https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=1200&q=80',
    channel_link: '@defielite',
    payment_address: 'EQA_0N8iK6-v4R2-z-z-z-z-z-z-z-z-z-z-z-z-z-z-z-z',
    tiers: [
      { name: 'Quarterly Pass', price: 599, duration: 'quarter' },
      { name: 'Annual Pass', price: 1999, duration: 'year' },
    ],
    subscribers: 85,
    is_trending: true,
    created_at: new Date(Date.now() - 3600000 * 1).toISOString(), // 1 hour ago
  },
  {
    id: '5',
    creator_telegram_id: 202,
    name: 'NFT Insider Circle',
    description: 'Direct mint access, floor price analysis, and exclusive whitelist opportunities.',
    cover_image: 'https://images.unsplash.com/photo-1644363212450-9377ca536338?w=1200&q=80',
    channel_link: '@nftinsider',
    payment_address: 'EQA-z-z-z-z-z-z-z-z-z-z-z-z-z-z-z-z-z-z-z-z-z-z',
    tiers: [
      { name: 'Season Pass', price: 199, duration: 'month' },
    ],
    subscribers: 590,
    created_at: new Date(Date.now() - 3600000 * 48).toISOString(), // 2 days ago
  },
]

export type DashboardStat = {
  name: string
  value: string
  delta: string
}

export type RevenuePoint = {
  date: string
  revenue: number
  members: number
}

export type DashboardData = {
  stats: DashboardStat[]
  spaces: Space[]
  revenueData: RevenuePoint[]
}

const DASHBOARD_STATS: DashboardStat[] = [
  { name: 'Active Spaces', value: '3', delta: '+12%' },
  { name: 'Total Members', value: '2,420', delta: '+8%' },
  { name: 'Average Subscription LTV', value: '450', delta: '+2%' },
]

const REVENUE_DATA: RevenuePoint[] = [
  { date: '2024-03-01', revenue: 450, members: 12 },
  { date: '2024-03-02', revenue: 580, members: 15 },
  { date: '2024-03-03', revenue: 520, members: 18 },
  { date: '2024-03-04', revenue: 690, members: 22 },
  { date: '2024-03-05', revenue: 840, members: 26 },
  { date: '2024-03-06', revenue: 1100, members: 32 },
  { date: '2024-03-07', revenue: 1050, members: 35 },
  { date: '2024-03-08', revenue: 1300, members: 42 },
  { date: '2024-03-09', revenue: 1550, members: 48 },
  { date: '2024-03-10', revenue: 1800, members: 55 },
  { date: '2024-03-11', revenue: 2100, members: 62 },
  { date: '2024-03-12', revenue: 2450, members: 70 },
]

const isSupabaseReady = Boolean(supabase)

const spaceSelect = `id, creator_telegram_id, name, description, cover_image, channel_link, tiers, subscribers, is_trending, created_at`

export const getDiscoverSpaces = async (): Promise<Space[]> => {
  if (isSupabaseReady) {
    const response = await (supabase! as any)
      .from('spaces')
      .select(spaceSelect)
      .order('created_at', { ascending: false })

    const data = response.data as Space[] | null
    if (data?.length) {
      return data
    }
  }

  await delay(150)
  return [...MOCK_SPACES]
}

export const getSpaceById = async (id: string): Promise<Space | null> => {
  if (isSupabaseReady) {
    const response = await (supabase! as any)
      .from('spaces')
      .select(spaceSelect)
      .eq('id', id)
      .single()

    const data = response.data as Space | null
    if (data) {
      return data
    }
  }

  await delay(150)
  return MOCK_SPACES.find((space) => space.id === id) ?? null
}

export const getDashboardData = async (): Promise<DashboardData> => {
  let spaces: Space[] = MOCK_SPACES

  if (isSupabaseReady) {
    const response = await (supabase! as any)
      .from('spaces')
      .select(spaceSelect)
      .order('created_at', { ascending: false })

    const data = response.data as Space[] | null
    if (data) {
      spaces = data
    }
  }

  const totalMembers = spaces.reduce((sum, space) => sum + (space.subscribers ?? 0), 0)
  const totalTierValue = spaces.reduce(
    (sum, space) => sum + (space.tiers?.reduce((tierSum, tier) => tierSum + (tier.price ?? 0), 0) ?? 0),
    0
  )

  const stats: DashboardStat[] = [
    { name: 'Active Spaces', value: spaces.length.toLocaleString(), delta: '+12%' },
    { name: 'Total Members', value: totalMembers.toLocaleString(), delta: '+8%' },
    { name: 'Estimated Revenue', value: `$${totalTierValue.toLocaleString()}`, delta: '+6%' },
  ]

  return {
    stats,
    spaces,
    revenueData: REVENUE_DATA,
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

    const data = response.data as Space | null
    if (data) {
      return data
    }
  }

  await delay(250)
  MOCK_SPACES.push(newSpace)
  return newSpace
}
