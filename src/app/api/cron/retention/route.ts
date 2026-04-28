import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// This endpoint is triggered by Vercel Cron (e.g., every day at 00:00)
// It scans for subscriptions expiring in the next 24 hours and sends a Telegram DM.
export async function GET(request: Request) {
  // Optional: Secure the cron endpoint so only Vercel can trigger it
  const authHeader = request.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!supabase) {
    return NextResponse.json({ error: 'Database unavailable' }, { status: 500 });
  }

  try {
    // 1. Calculate the time window (Now to 24 hours from now)
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const nowISO = now.toISOString();
    const tomorrowISO = tomorrow.toISOString();

    // 2. Query for expiring subscriptions
    const { data: expiringSubs, error } = await supabase
      .from('space_subscriptions')
      .select('*, space:spaces(name)')
      .eq('status', 'active')
      .gte('expires_at', nowISO)
      .lte('expires_at', tomorrowISO);

    if (error) throw error;

    if (!expiringSubs || expiringSubs.length === 0) {
      return NextResponse.json({ message: 'No subscriptions expiring in the next 24 hours.' });
    }

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken) {
      throw new Error('Missing TELEGRAM_BOT_TOKEN');
    }

    let notifiedCount = 0;

    // 3. Send Telegram DMs to each user
    for (const sub of expiringSubs) {
      if (!sub.telegram_user_id) continue;

      const spaceName = (sub.space as any)?.name || 'a premium space';
      const renewLink = `https://t.me/SuboraBot/app?startapp=space_${sub.space_id}`;
      
      const message = `⚠️ *Action Required: Expiring Access*\n\nYour subscription to *${spaceName}* expires in less than 24 hours.\n\nRenew your access now to maintain uninterrupted access to the community and alpha.`;

      try {
        const tgRes = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: sub.telegram_user_id,
            text: message,
            parse_mode: 'Markdown',
            reply_markup: {
              inline_keyboard: [[
                { text: 'Renew Access ⚡', url: renewLink }
              ]]
            }
          })
        });

        if (tgRes.ok) {
          notifiedCount++;
        } else {
          console.error(`Failed to notify user ${sub.telegram_user_id}`, await tgRes.text());
        }
      } catch (tgErr) {
        console.error(`Network error notifying user ${sub.telegram_user_id}`, tgErr);
      }
    }

    return NextResponse.json({ 
      success: true, 
      found: expiringSubs.length,
      notified: notifiedCount 
    });

  } catch (error: any) {
    console.error('Retention Cron Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
