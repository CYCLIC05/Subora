import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials (SERVICE_ROLE_KEY required)')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function run() {
  const myId = process.argv.find(arg => arg.startsWith('--telegram_id='))?.split('=')[1]
  
  if (!myId) {
    console.error('Please provide your telegram id: --telegram_id=YOUR_ID')
    process.exit(1)
  }

  const telegramId = parseInt(myId, 10)
  console.log(`Reassigning all mock spaces to Telegram ID: ${telegramId}...`)

  const { data, error } = await supabase
    .from('spaces')
    .update({ creator_telegram_id: telegramId })
    .eq('creator_telegram_id', 12345678) // The ID used in the seed script

  if (error) {
    console.error('Error reassigning spaces:', error.message)
  } else {
    console.log(`Success! All mock spaces are now owned by you.`)
    console.log(`You can now edit or delete them from your dashboard.`)
  }
}

run()
