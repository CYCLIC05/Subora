import TelegramBot from 'node-telegram-bot-api'
import { Space } from '@/lib/supabase'

const token = process.env.TELEGRAM_BOT_TOKEN

export function createBot() {
  if (!token) {
    throw new Error('Missing TELEGRAM_BOT_TOKEN environment variable')
  }
  return new TelegramBot(token, { polling: false })
}

/**
 * Normalize a channel_link stored by creators into the chatId format
 * accepted by the Telegram Bot API (e.g. "@username" or numeric "-100...").
 */
function normalizeChatId(channelLink: string): string {
  const s = channelLink.trim()

  // 1. If it's a full URL like https://t.me/QuantumAlpha or https://t.me/+AbCd
  if (s.startsWith('https://t.me/')) {
    const slug = s.replace('https://t.me/', '')
    if (slug.startsWith('+')) {
      // Private invite link — we can't extract a Chat ID from this directly
      // Return as-is, calling generateSingleUseInviteLink will likely fail
      // but it will trigger the fallback to the raw link in the API route.
      return s
    }
    // Public username
    return `@${slug}`
  }

  // 2. Already a numeric ID like -1001234567890
  if (/^-?\d+$/.test(s)) return s

  // 3. Username with or without @
  if (s.startsWith('@')) return s
  
  return `@${s}`
}

/**
 * Build a public t.me URL that opens the channel or a specific invite link.
 * This is the URL the buyer will see in the "Open Private Channel" button.
 */
function buildPublicUrl(channelLinkOrInvite: string): string {
  const s = channelLinkOrInvite.trim()
  // Already a full https:// invite link from createChatInviteLink
  if (s.startsWith('https://')) return s
  // Username
  const username = s.replace(/^@/, '')
  return `https://t.me/${username}`
}

export async function sendTelegramMessage(chatId: string, text: string) {
  try {
    const bot = createBot()
    return bot.sendMessage(chatId, text, { parse_mode: 'Markdown' })
  } catch (error) {
    console.error('Telegram send error', error)
    return null
  }
}

export async function notifySpaceCreated(space: Space) {
  const targetChatId = space.creator_telegram_id ? String(space.creator_telegram_id) : null
  if (!targetChatId) {
    console.warn('No Telegram chat id available for notifications. Set creator_telegram_id on the space.')
    return null
  }

  const message =
    `✅ *New space created*\n` +
    `*${space.name}*\n` +
    `${space.description}\n\n` +
    `• [View space](https://subora-spaces.vercel.app/spaces/${encodeURIComponent(space.id)})\n` +
    `• Creator ID: \`${space.creator_telegram_id ?? 'unknown'}\``

  return sendTelegramMessage(targetChatId, message)
}

export async function handleTelegramWebhookUpdate(update: any) {
  console.log('--- Incoming Telegram Update ---');
  console.log(JSON.stringify(update, null, 2));
  
  const message = update.message
  if (!message || !message.text) return { received: true }

  const chatId = message.chat.id
  const text = message.text

  // Handle /start command
  if (text.startsWith('/start')) {
    const parts = text.split(' ')
    const param = parts.length > 1 ? parts[1] : null

    // Pattern: /start space_{id}
    if (param && param.startsWith('space_')) {
      const spaceId = param.replace('space_', '')
      
      // We'll send a welcoming message with a button back to the space
      const bot = createBot()
      return bot.sendMessage(
        chatId,
        `👋 *Welcome to Subora!*\n\nYou've been invited to explore a premium community. Tap the button below to view the details and join.`,
        {
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: [[
              { text: 'view Space', url: `https://t.me/SuboraBot/app?startapp=space_${spaceId}` }
            ]]
          }
        }
      )
    }

    // Default /start
    const bot = createBot()
    return bot.sendMessage(
      chatId,
      `🚀 *Subora: The Premium Space Discovery*\n\nWelcome to the ecosystem! Here you can:\n• Discover elite private communities\n• Launch your own gated space\n• Manage your digital access\n\nTap the button below to start exploring.`,
      {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [[
            { text: '🌐 Open Discovery', url: `https://t.me/SuboraBot/app` }
          ]]
        }
      }
    )
  }

  return { received: true }
}

/**
 * Send the buyer a DM (via the bot) with a button linking to their access URL.
 * chatId here is the *buyer's* Telegram user ID.
 */
export async function sendTelegramAccessLink(chatId: string, accessUrl: string, spaceName: string) {
  try {
    const bot = createBot()
    const options = {
      parse_mode: 'Markdown' as 'Markdown',
      reply_markup: {
        inline_keyboard: [[
          { text: `🔓 Enter ${spaceName}`, url: accessUrl },
        ]],
      },
    }
    return bot.sendMessage(
      chatId,
      `✅ Payment confirmed! Your private access to *${spaceName}* is ready.\n\nTap the button below to join the channel now.`,
      options
    )
  } catch (error) {
    console.error('Error sending Telegram access link', error)
    return null
  }
}

/**
 * Ask the bot to create a single-use invite link for the creator's private channel.
 * The bot MUST be an administrator of that channel with "Invite users via link" permission.
 *
 * Returns the full https://t.me/joinchat/... URL on success, or null on failure.
 */
export async function generateSingleUseInviteLink(channelLink: string): Promise<string | null> {
  const chatId = normalizeChatId(channelLink)
  
  if (chatId.startsWith('https://')) {
    console.warn(`[generateSingleUseInviteLink] Cannot manage channel via static URL "${chatId}". Bot requires a numeric ID or username.`)
    return null
  }

  try {
    const bot = createBot()
    // expires_date: 10 minutes from now, member_limit: 1 — truly single-use
    const expiresAt = Math.floor(Date.now() / 1000) + 10 * 60
    const result = await bot.createChatInviteLink(chatId, {
      member_limit: 1,
      expire_date: expiresAt,
    })
    const link: string | undefined = result?.invite_link
    if (!link) {
      console.warn(`createChatInviteLink returned no link for chatId "${chatId}"`)
      return null
    }
    console.log(`Single-use invite link generated for ${chatId}: ${link}`)
    return link
  } catch (error: any) {
    const desc: string = error?.response?.body?.description ?? String(error)
    console.error(
      `[generateSingleUseInviteLink] Failed for chatId "${chatId}". ` +
      `Ensure the Subora bot is an admin with "Invite Users" permission in that channel. ` +
      `Telegram error: ${desc}`
    )
    return null
  }
}