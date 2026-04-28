import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

const CATEGORIES = ['Crypto Alpha', 'Trading', 'Lifestyle', 'Technical']

const MOCK_NAMES = [
  { name: 'The Whale Room', cat: 'Crypto Alpha', img: 'https://images.unsplash.com/photo-1621416894569-0f39ed31d247?auto=format&fit=crop&q=80&w=800' },
  { name: 'DeFi Degens', cat: 'Crypto Alpha', img: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&q=80&w=800' },
  { name: 'Solana Gems', cat: 'Crypto Alpha', img: 'https://images.unsplash.com/photo-1639322537228-f710d846310a?auto=format&fit=crop&q=80&w=800' },
  { name: 'Macro Insights', cat: 'Trading', img: 'https://images.unsplash.com/photo-1611974717482-4828c3fc35c6?auto=format&fit=crop&q=80&w=800' },
  { name: 'Elliott Wave Pros', cat: 'Trading', img: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&q=80&w=800' },
  { name: 'Day Trading Live', cat: 'Trading', img: 'https://images.unsplash.com/photo-1518186239717-2e9b1367444d?auto=format&fit=crop&q=80&w=800' },
  { name: 'Digital Nomad Hub', cat: 'Lifestyle', img: 'https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?auto=format&fit=crop&q=80&w=800' },
  { name: 'Luxury Travel Club', cat: 'Lifestyle', img: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=800' },
  { name: 'Fitness Motivation', cat: 'Lifestyle', img: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&q=80&w=800' },
  { name: 'Next.js Masters', cat: 'Technical', img: 'https://images.unsplash.com/photo-1587620962725-abab7fe55159?auto=format&fit=crop&q=80&w=800' },
  { name: 'Rust Devs', cat: 'Technical', img: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?auto=format&fit=crop&q=80&w=800' },
  { name: 'AI & LLM Builders', cat: 'Technical', img: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=800' },
  { name: 'Alpha Signals', cat: 'Crypto Alpha', img: 'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?auto=format&fit=crop&q=80&w=800' },
  { name: 'Forex Mastery', cat: 'Trading', img: 'https://images.unsplash.com/photo-1535320903710-d993d3d77d29?auto=format&fit=crop&q=80&w=800' },
  { name: 'Creative UI/UX', cat: 'Technical', img: 'https://images.unsplash.com/photo-1586717791821-3f44a563eb4c?auto=format&fit=crop&q=80&w=800' },
  { name: 'Biohacking Lab', cat: 'Lifestyle', img: 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?auto=format&fit=crop&q=80&w=800' },
  { name: 'Ethereum Builders', cat: 'Technical', img: 'https://images.unsplash.com/photo-1622790698141-94e30457ef12?auto=format&fit=crop&q=80&w=800' },
  { name: 'NFT Alpha', cat: 'Crypto Alpha', img: 'https://images.unsplash.com/photo-1620321023374-d1a68fbc720d?auto=format&fit=crop&q=80&w=800' },
  { name: 'Scalping Kings', cat: 'Trading', img: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800' },
  { name: 'Mindfulness Hub', cat: 'Lifestyle', img: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=800' }
]

const ADJECTIVES = ['Elite', 'Private', 'Advanced', 'Inside', 'Direct', 'Exclusive', 'Global', 'Secret']
const SUFFIXES = ['HQ', 'Network', 'Circle', 'Alliance', 'Lab', 'Station', 'Hub', 'Guild']

export async function GET() {
  if (!supabase) return NextResponse.json({ error: 'Supabase not ready' }, { status: 500 })

  try {
    const spacesToInsert = []

    // Generate 60 spaces
    for (let i = 0; i < 60; i++) {
      const template = MOCK_NAMES[i % MOCK_NAMES.length]
      const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)]
      const suffix = SUFFIXES[Math.floor(Math.random() * SUFFIXES.length)]
      
      const name = i < MOCK_NAMES.length ? template.name : `${adj} ${template.name.split(' ')[0]} ${suffix}`
      
      spacesToInsert.push({
        name,
        description: `Join our exclusive ${template.cat.toLowerCase()} community. We provide high-signal ${name.toLowerCase()} updates, shared by experts and industry veterans. Get access to gated content, private discussions, and real-time alerts.`,
        cover_image: template.img,
        channel_link: '@suborabot', // Mock link
        creator_name: `Expert ${i + 1}`,
        category: template.cat,
        is_closed: false,
        subscribers: Math.floor(Math.random() * 500) + 10,
        is_trending: Math.random() > 0.8,
        payment_address: 'UQDE7p5q0fS7u8...MOCK_ADDR', // Mock addr
        tiers: [
          { name: 'Standard Access', price: Math.floor(Math.random() * 30) + 5, duration: 'week', currency: 'TON' }
        ],
        created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
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
