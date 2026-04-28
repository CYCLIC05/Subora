import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

const mockSpaces = [
  {
    name: 'TON Alpha Signals',
    description: 'Exclusive on-chain signals and alpha for the TON ecosystem. Daily updates and deep-dives into new jettons.',
    category: 'Crypto Alpha',
    cover_image: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&q=80',
    creator_telegram_id: 12345678,
    channel_link: 'https://t.me/tonalpha',
    subscribers: 1240,
    is_trending: true,
    tiers: [
      { name: 'Monthly Alpha', price: 5, duration: 'month', currency: 'TON' },
      { name: 'Yearly Legend', price: 45, duration: 'year', currency: 'TON' }
    ]
  },
  {
    name: 'Day Trading Lab',
    description: 'Live scalp signals, technical analysis, and real-time market sentiment for active traders.',
    category: 'Trading',
    cover_image: 'https://images.unsplash.com/photo-1611974714658-058f13721300?w=800&q=80',
    creator_telegram_id: 12345678,
    channel_link: 'https://t.me/tradinglab',
    subscribers: 850,
    is_trending: false,
    tiers: [
      { name: 'Trader Access', price: 50, duration: 'month', currency: 'Stars' }
    ]
  },
  {
    name: 'Digital Nomad Club',
    description: 'Travel hacks, remote job listings, and community meetups for global citizens.',
    category: 'Lifestyle',
    cover_image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80',
    creator_telegram_id: 12345678,
    channel_link: 'https://t.me/nomadclub',
    subscribers: 2100,
    is_trending: true,
    tiers: [
      { name: 'Basic Access', price: 0, duration: 'month', currency: 'TON' }
    ]
  },
  {
    name: 'Solana Degens',
    description: 'The highest risk, highest reward plays on the Solana blockchain. Tread carefully.',
    category: 'Crypto Alpha',
    cover_image: 'https://images.unsplash.com/photo-1621416848469-9c5145dfbb08?w=800&q=80',
    creator_telegram_id: 12345678,
    channel_link: 'https://t.me/solanadegens',
    subscribers: 3400,
    is_trending: false,
    tiers: [
      { name: 'Weekly Play', price: 2, duration: 'week', currency: 'TON' }
    ]
  },
  {
    name: 'The Technical Analyst',
    description: 'Deep technical deep-dives into macro trends and micro caps. No hype, just data.',
    category: 'Technical',
    cover_image: 'https://images.unsplash.com/photo-1551288049-bbbda50a13a9?w=800&q=80',
    creator_telegram_id: 12345678,
    channel_link: 'https://t.me/techalpha',
    subscribers: 450,
    is_trending: false,
    tiers: [
      { name: 'Pro Data', price: 15, duration: 'month', currency: 'TON' }
    ]
  },
  {
    name: 'Mindful Mastery',
    description: 'Daily meditation prompts, productivity frameworks, and mental health resources.',
    category: 'Lifestyle',
    cover_image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&q=80',
    creator_telegram_id: 12345678,
    channel_link: 'https://t.me/mindfulmastery',
    subscribers: 120,
    is_trending: false,
    tiers: [
      { name: 'Zen Access', price: 100, duration: 'month', currency: 'Stars' }
    ]
  },
  {
    name: 'Web3 Dev Insights',
    description: 'Code snippets, smart contract audits, and exclusive interviews with top Web3 engineers.',
    category: 'Education',
    cover_image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&q=80',
    creator_telegram_id: 12345678,
    channel_link: 'https://t.me/web3devs',
    subscribers: 980,
    is_trending: true,
    tiers: [
      { name: 'Student Access', price: 0, duration: 'month', currency: 'TON' },
      { name: 'Mastermind', price: 25, duration: 'month', currency: 'TON' }
    ]
  },
  {
    name: 'Arbitrage Alerts',
    description: 'Automated alerts for price discrepancies across top CEXs and DEXs. Fastest execution.',
    category: 'Trading',
    cover_image: 'https://images.unsplash.com/photo-1535320903710-d993d3d77d29?w=800&q=80',
    creator_telegram_id: 12345678,
    channel_link: 'https://t.me/arbalerts',
    subscribers: 670,
    is_trending: false,
    tiers: [
      { name: 'Bot Access', price: 200, duration: 'month', currency: 'Stars' }
    ]
  },
  {
    name: 'The Yield Farmer',
    description: 'Finding the safest, highest yielding farms in DeFi. Maximize your passive income.',
    category: 'Crypto Alpha',
    cover_image: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=800&q=80',
    creator_telegram_id: 12345678,
    channel_link: 'https://t.me/yieldfarm',
    subscribers: 1560,
    is_trending: true,
    tiers: [
      { name: 'Harvest Tier', price: 10, duration: 'month', currency: 'TON' }
    ]
  },
  {
    name: 'Future of AI',
    description: 'Curated news and insights on LLMs, generative art, and the future of artificial intelligence.',
    category: 'Technical',
    cover_image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80',
    creator_telegram_id: 12345678,
    channel_link: 'https://t.me/futureai',
    subscribers: 4200,
    is_trending: true,
    tiers: [
      { name: 'AI Explorer', price: 0, duration: 'month', currency: 'TON' }
    ]
  }
]

async function seed() {
  console.log('Seeding 10 mock spaces...')
  for (const space of mockSpaces) {
    const { data, error } = await supabase
      .from('spaces')
      .insert([space])
      .select()
    
    if (error) {
      console.error(`Error seeding ${space.name}:`, error.message)
    } else {
      console.log(`Successfully seeded: ${space.name}`)
    }
  }
  console.log('Done!')
}

seed()
