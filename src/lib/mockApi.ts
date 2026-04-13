import { Space } from '@/lib/supabase'

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const MOCK_SPACES: Space[] = [
  {
    id: '1',
    creator_telegram_id: 123,
    name: 'Alpha Trading Signals',
    description: 'Real-time market analysis and trade setups for high-performing traders.',
    cover_image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&q=80',
    channel_link: '@alphatrading',
    tiers: {
      tier1: { name: 'Weekly Access', price: 99, duration: 'week' },
      tier2: { name: 'Monthly Access', price: 299, duration: 'month' },
    },
    created_at: new Date().toISOString(),
  },
  {
    id: '2',
    creator_telegram_id: 456,
    name: 'TON Builders Labs',
    description: 'Technical deep-dives and early access to the next generation of TON apps.',
    cover_image: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=1200&q=80',
    channel_link: '@tonbuilders',
    tiers: {
      tier1: { name: 'Monthly Access', price: 49, duration: 'month' },
      tier2: { name: 'Yearly Access', price: 499, duration: 'year' },
    },
    created_at: new Date().toISOString(),
  },
  {
    id: '3',
    creator_telegram_id: 789,
    name: 'Macro Insights',
    description: 'Global economic trends and strategic asset allocation for long-term growth.',
    cover_image: 'https://images.unsplash.com/photo-1611974714405-08e13768b726?w=1200&q=80',
    channel_link: '@macroinsights',
    tiers: {
      tier1: { name: 'Monthly Access', price: 150, duration: 'month' },
    },
    created_at: new Date().toISOString(),
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
  { name: 'Active Subscriptions', value: '1,248', delta: '+12%' },
  { name: 'Current Cycle Revenue', value: '12.4k Stars', delta: '+8%' },
  { name: 'Average Subscription LTV', value: '450 Stars', delta: '+2%' },
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

export const getDiscoverSpaces = async () => {
  await delay(150)
  return [...MOCK_SPACES]
}

export const getSpaceById = async (id: string) => {
  await delay(150)
  return MOCK_SPACES.find((space) => space.id === id) ?? null
}

export const getDashboardData = async (): Promise<DashboardData> => {
  await delay(120)
  return {
    stats: DASHBOARD_STATS,
    spaces: [...MOCK_SPACES],
    revenueData: REVENUE_DATA,
  }
}

export type CreateSpacePayload = Omit<Space, 'id' | 'created_at'>

export const createSpace = async (payload: CreateSpacePayload): Promise<Space> => {
  await delay(250)
  const newSpace: Space = {
    id: crypto.randomUUID?.() ?? `${Date.now()}`,
    created_at: new Date().toISOString(),
    ...payload,
  }
  MOCK_SPACES.push(newSpace)
  return newSpace
}
