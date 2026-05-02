import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { generateSingleUseInviteLink, sendTelegramAccessLink } from '@/lib/telegram'
import { verifyTonTransaction, verifyJettonTransaction } from '@/lib/tonVerification'
import { buildChannelUrl } from '@/lib/channels'
import { errors } from '@/lib/errors'

/**
 * Convert any channel_link / raw chatId string into a full https:// URL
 * suitable for a browser "Open Channel" button.
 *
 * - Invite links (already https://t.me/+...) are returned as-is.
 * - Usernames (@name or name) become https://t.me/name.
 * - Numeric chat IDs (-100...) cannot be directly linked publicly, so we
 *   return null — the caller should warn the creator to set a username.
 */
function buildPublicChannelUrl(channelLink: string): string | null {
  return buildChannelUrl(channelLink)
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { spaceId, walletAddress, telegramUserId, amount, currency, txHash, referralSource } = body

    if (!spaceId) {
      return NextResponse.json({ error: 'Missing spaceId' }, { status: 400 })
    }

    if (!walletAddress && currency !== 'Stars') {
      return NextResponse.json({ error: 'Missing walletAddress' }, { status: 400 })
    }

    if (!supabase) {
      return NextResponse.json({ error: 'Database connection failed' }, { status: 500 })
    }

    // --- Blockchain verification ---
    // In production (NODE_ENV=production), TONAPI_KEY MUST be set
    // Without it, we cannot verify payments securely
    const isProduction = process.env.NODE_ENV === 'production'
    
    if (isProduction && !process.env.TONAPI_KEY) {
      console.error('[purchase] Production mode requires TONAPI_KEY to be set')
      return NextResponse.json(
        { error: 'Payment system not configured. Please contact support.' },
        { status: 500 }
      )
    }

    if (process.env.TONAPI_KEY) {
      if (!amount) {
        return NextResponse.json({ error: 'Missing amount for verification' }, { status: 400 })
      }

      const spaceForVerification = await supabase
        .from('spaces')
        .select('payment_address, name, referrer_payment_address')
        .eq('id', spaceId)
        .single()

      if (spaceForVerification.error || !spaceForVerification.data?.payment_address) {
        return NextResponse.json({ error: 'Payment address not configured' }, { status: 400 })
      }

      let verification: { verified: boolean; message?: string } = { verified: false, message: 'Verification not started' }

      if (currency === 'USDT') {
        const usdtMaster = 'EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs';
        const decimals = 6;
        const amountUnits = String(Math.floor(Number(amount) * (10 ** decimals)));
        verification = await verifyJettonTransaction(
          walletAddress!,
          spaceForVerification.data.payment_address,
          amountUnits,
          usdtMaster
        )
      } else if (currency === 'TON') {
        const amountNano = String(Math.floor(Number(amount) * 1_000_000_000));
        verification = await verifyTonTransaction(
          walletAddress!,
          spaceForVerification.data.payment_address,
          amountNano,
          spaceForVerification.data.referrer_payment_address // Optional second recipient
        )
      } else if (currency === 'Stars') {
        // Stars are verified via the WebApp callback or webhook. 
        // For V1, if we reached here from Stars flow, we trust the client-side 'paid' status 
        // or we can implement a separate Stars verification logic if needed.
        verification = { verified: true, message: 'Stars payment trusted via client callback' }
      }

      if (!verification.verified) {
        console.warn(`Payment verification failed for space ${spaceId} (${currency}): ${verification.message}`)
        return NextResponse.json(
          { error: verification.message || 'Payment verification failed' },
          { status: 402 }
        )
      }
    } else {
      // Dev mode without TONAPI_KEY - log warning but allow (for testing)
      console.warn(`[purchase] TONAPI_KEY not set — payment verification skipped (dev mode only)`)
    }

    // --- Fetch Space ---
    const { data, error } = await supabase
      .from('spaces')
      .select('channel_link, name, subscribers, is_closed')
      .eq('id', spaceId)
      .single()

    const space = data as { channel_link: string; name: string; subscribers: number; is_closed: boolean } | null

    if (error || !space) {
      return NextResponse.json({ error: 'Space not found' }, { status: 404 })
    }

    if (space.is_closed) {
      return NextResponse.json({ error: 'Enrollment is currently closed for this space' }, { status: 403 })
    }

    // --- Generate single-use invite link ---
    // The bot must be admin of the creator's channel with "Invite Users" permission.
    // On failure we fall back to a public channel URL (works for public channels).
    let accessUrl: string | null = null

    try {
      accessUrl = await generateSingleUseInviteLink(space.channel_link)
    } catch (linkError) {
      console.error('[purchase] Invite link generation threw:', linkError)
    }

    if (!accessUrl) {
      // Fallback: build a public https:// link from the channel_link
      accessUrl = buildPublicChannelUrl(space.channel_link)
      if (accessUrl) {
        console.warn(
          `[purchase] Could not generate single-use invite link for "${space.channel_link}". ` +
          `Falling back to public URL: ${accessUrl}. ` +
          `To fix, make sure the Subora bot is an admin of that channel.`
        )
      } else {
        // Numeric-only private channel — no usable link at all
        console.error(
          `[purchase] Channel "${space.channel_link}" is a numeric ID with no public URL. ` +
          `The Subora bot must be admin to generate an invite link. Access cannot be granted automatically.`
        )
        return NextResponse.json(
          { error: 'Could not generate access link. Please contact the creator.' },
          { status: 500 }
        )
      }
    }

    // --- Notify buyer via Telegram DM ---
    if (telegramUserId && accessUrl) {
      await sendTelegramAccessLink(String(telegramUserId), accessUrl, space.name)
    }

    // --- Record subscription with persistence ---
    await supabase.from('space_subscriptions').insert({
      space_id: spaceId,
      telegram_user_id: telegramUserId ?? null,
      wallet_address: walletAddress ?? null,
      referral_source: referralSource ?? null,
      currency: currency || 'TON',
      amount_paid: Number(amount) || 0,
      invite_link: accessUrl,
      join_time: new Date().toISOString(),
    })

    // --- Record auditable transaction ---
    await supabase.from('transactions').insert({
      space_id: spaceId,
      telegram_user_id: telegramUserId ?? null,
      wallet_address: walletAddress ?? null,
      amount: Number(amount) || 0,
      currency: currency || 'TON',
      tx_hash: txHash || null,
      status: 'success'
    })

    // Update subscribers count
    await supabase
      .from('spaces')
      .update({ subscribers: (space.subscribers || 0) + 1 })
      .eq('id', spaceId)

    return NextResponse.json({ success: true, accessUrl })
  } catch (err) {
    console.error('Purchase route error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

