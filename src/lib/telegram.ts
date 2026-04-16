import TelegramBot from 'node-telegram-bot-api'
import { Space } from '@/lib/supabase'

const token = process.env.BOT_TOKEN
const adminChatId = process.env.TELEGRAM_CHAT_ID

function createBot() {
  if (!token) {
    throw new Error('Missing BOT_TOKEN environment variable')
  }

  return new TelegramBot(token, { polling: false })
}

function getTargetChatId(creatorTelegramId?: number) {
  if (creatorTelegramId && creatorTelegramId > 0) {
    return String(creatorTelegramId)
  }

  if (adminChatId) {
    return adminChatId
  }

  return undefined
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
  const targetChatId = getTargetChatId(space.creator_telegram_id)
  if (!targetChatId) {
    console.warn('No Telegram chat id available for notifications. Set TELEGRAM_CHAT_ID or pass a creator Telegram id.')
    return null
  }

  const message = `✅ *New space created*\n` +
    `*${space.name}*\n` +
    `${space.description}\n\n` +
    `• [View space](https://subora-spaces.vercel.app/spaces/${encodeURIComponent(space.id)})\n` +
    `• Creator ID: \`${space.creator_telegram_id || 'unknown'}\``

  return sendTelegramMessage(targetChatId, message)
}

export async function handleTelegramWebhookUpdate(update: unknown) {
  console.log('Received Telegram webhook update', JSON.stringify(update))
  return { received: true }
}

export async function generateSingleUseInviteLink(chatId: string): Promise<string | null> {
  try {
    const bot = createBot()
    // generates a link that expires after 1 use
    const inviteLink = await (bot as any).createChatInviteLink(chatId, {
      member_limit: 1,
    })
    return inviteLink.invite_link
  } catch (error) {
    console.error('Error generating single-use invite link', error)
    return null
  }
}
