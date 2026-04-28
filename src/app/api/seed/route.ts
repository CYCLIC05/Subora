import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

const CATEGORIES = ['Crypto Alpha', 'Trading', 'AI Bots', 'Infrastructure', 'Lifestyle']

const MOCK_NAMES = [
  // Crypto Alpha
  { name: 'The Whale Room', cat: 'Crypto Alpha', img: '1621416894569-0f39ed31d247' },
  { name: 'DeFi Degens', cat: 'Crypto Alpha', img: '1639762681485-074b7f938ba0' },
  { name: 'Solana Gems', cat: 'Crypto Alpha', img: '1639322537228-f710d846310a' },
  { name: 'Alpha Signals HQ', cat: 'Crypto Alpha', img: '1518546305927-5a555bb7020d' },
  
  // Trading
  { name: 'Macro Insights', cat: 'Trading', img: '1611974717482-4828c3fc35c6' },
  { name: 'Elliott Wave Pros', cat: 'Trading', img: '1590283603385-17ffb3a7f29f' },
  { name: 'Day Trading Live', cat: 'Trading', img: '1518186239717-2e9b1367444d' },
  { name: 'Forex Mastery', cat: 'Trading', img: '1535320903710-d993d3d77d29' },

  // AI & Bots
  { name: 'Price Alert Bot', cat: 'AI Bots', img: '1677442136019-21780ecad995' },
  { name: 'GPT-4 Web3 Assistant', cat: 'AI Bots', img: '1550751827-4bd374c3f58b' },
  { name: 'MEV Protection Bot', cat: 'AI Bots', img: '1558494949-ef010c7191ae' },
  { name: 'Sentiment Analysis AI', cat: 'AI Bots', img: '1620712943543-bcc462824100' },

  // Infrastructure & Tools
  { name: 'Gas Monitor Pro', cat: 'Infrastructure', img: '1551288049-bb1c004517ad' },
  { name: 'Wallet Tracker Elite', cat: 'Infrastructure', img: '1642104704842-83b21b774443' },
  { name: 'Contract Auditor Lab', cat: 'Infrastructure', img: '1516116216624-53e697fedbea' },
  { name: 'RPC Node Access', cat: 'Infrastructure', img: '1451187580459-43490279c0fa' },

  // Lifestyle & Social
  { name: 'Digital Nomad Hub', cat: 'Lifestyle', img: '1488190211105-8b0e65b80b4e' },
  { name: 'Luxury Travel Club', cat: 'Lifestyle', img: '1507525428034-b723cf961d3e' },
  { name: 'Fitness Motivation', cat: 'Lifestyle', img: '1517836357463-d25dfeac3438' },
  { name: 'Mindfulness Lab', cat: 'Lifestyle', img: '1506126613408-eca07ce68773' }
]

const ADJECTIVES = ['Elite', 'Verified', 'Global', 'Advanced', 'Secure', 'Pro', 'Next-Gen', 'Premium']
const SUFFIXES = ['Engine', 'Terminal', 'Portal', 'Nexus', 'Protocol', 'Vault', 'Core', 'Link']

export async function GET() {
  if (!supabase) return NextResponse.json({ error: 'Supabase not ready' }, { status: 500 })

  try {
    const spacesToInsert = []

    for (let i = 0; i < 80; i++) {
      const template = MOCK_NAMES[i % MOCK_NAMES.length]
      const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)]
      const suffix = SUFFIXES[Math.floor(Math.random() * SUFFIXES.length)]
      
      const name = i < MOCK_NAMES.length ? template.name : `${adj} ${template.name.split(' ')[0]} ${suffix}`
      
      spacesToInsert.push({
        name,
        description: `Experience the future of ${template.cat.toLowerCase()} on Telegram. ${name} is a curated ${template.cat === 'AI Bots' ? 'automated tool' : 'exclusive community'} designed for performance and reliability. Join over ${Math.floor(Math.random() * 10)}k users who trust Subora for discovery.`,
        cover_image: `https://images.unsplash.com/photo-${template.img}?auto=format&fit=crop&q=80&w=800`,
        channel_link: template.cat === 'AI Bots' ? 'https://t.me/SuboraBot' : '@suborabot',
        creator_name: `Subora ${template.cat.split(' ')[0]}`,
        category: template.cat,
        is_closed: false,
        subscribers: Math.floor(Math.random() * 1500) + 50,
        is_trending: Math.random() > 0.7,
        payment_address: 'UQDE7p5q0fS7u8...DISCOVERY',
        tiers: [
          { 
            name: template.cat === 'Infrastructure' ? 'Monthly API' : 'Weekly Access', 
            price: Math.floor(Math.random() * 40) + 2, 
            duration: template.cat === 'Infrastructure' ? 'month' : 'week', 
            currency: 'TON' 
          }
        ],
        created_at: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString()
      })
    }

    // Insert in batches
    const { data, error } = await supabase
      .from('spaces')
      .insert(spacesToInsert)
      .select('id')

    if (error) {
      console.error('Seeding error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      count: data.length, 
      message: 'Database populated with 60 mock spaces. Marketplace should now be full.' 
    })
  } catch (err) {
    console.error('Seed catch error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
