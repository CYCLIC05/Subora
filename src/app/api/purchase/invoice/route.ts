import { NextResponse } from 'next/server'
import { createBot } from '@/lib/telegram'

export async function POST(request: Request) {
  try {
    const { spaceId, tierName, amount, currency } = await request.json()

    if (currency !== 'Stars') {
      return NextResponse.json({ error: 'Invalid currency for invoice' }, { status: 400 })
    }

    const bot = createBot()
    
    // Telegram Stars invoicing
    const title = `Access to Space`
    const description = `Subscription to ${tierName} for the selected duration.`
    const payload = JSON.stringify({ spaceId, tierName, type: 'subscription' })
    const providerToken = '' // Stars don't need a provider token for digital goods in Telegram usually
    const startParameter = `space_${spaceId}`
    const prices = [{ label: 'Access Fee', amount: Math.floor(amount) }] // For Stars, amount is calculated differently? No, 1 Star = 100 in price usually?
    // Actually, for Stars, the amount in prices is the actual number of Stars.
    
    try {
      const invoiceLink = await (bot as any).createInvoiceLink(
        title,
        description,
        payload,
        providerToken,
        'XTR', // Stars currency code
        prices
      )

      return NextResponse.json({ success: true, invoiceLink })
    } catch (botError: any) {
      console.error('Invoice link error:', botError)
      return NextResponse.json({ 
        success: false, 
        error: `Telegram Error: ${botError?.response?.body?.description || String(botError)}` 
      })
    }

  } catch (err) {
    console.error('Invoice creation error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
