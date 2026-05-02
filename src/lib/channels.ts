// filepath: src/lib/channels.ts
/**
 * Shared channel URL utilities
 * Eliminates duplicate buildChannelUrl logic across the codebase
 */

/**
 * Normalize a channel_link stored by creators into the chatId format
 * accepted by the Telegram Bot API (e.g. "@username" or numeric "-100...").
 */
export function normalizeChatId(channelLink: string): string {
  const s = channelLink.trim()

  // 1. If it's a full URL like https://t.me/QuantumAlpha or https://t.me/+AbCd
  if (s.startsWith('https://t.me/')) {
    const slug = s.replace('https://t.me/', '')
    if (slug.startsWith('+')) {
      // Private invite link — return as-is
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
 * Convert any channel_link / raw chatId string into a full https:// URL
 * suitable for a browser "Open Channel" button.
 *
 * - Invite links (already https://t.me/+...) are returned as-is.
 * - Usernames (@name or name) become https://t.me/name.
 * - Numeric chat IDs (-100...) cannot be directly linked publicly, so we
 *   return null — the caller should warn the creator to set a username.
 */
export function buildChannelUrl(channelLink: string): string | null {
  const s = channelLink.trim()
  if (s.startsWith('https://')) return s
  if (/^-?\d+$/.test(s)) {
    // Private channel with only a numeric ID — no public link possible without an invite link
    return null
  }
  return `https://t.me/${s.replace(/^@/, '')}`
}

/**
 * Build a public t.me URL that opens the channel or a specific invite link.
 */
export function buildPublicUrl(channelLinkOrInvite: string): string {
  const s = channelLinkOrInvite.trim()
  // Already a full https:// invite link from createChatInviteLink
  if (s.startsWith('https://')) return s
  // Username
  const username = s.replace(/^@/, '')
  return `https://t.me/${username}`
}

/**
 * Validate that a channel link is properly formatted
 */
export function isValidChannelLink(link: string): boolean {
  if (!link) return false
  const s = link.trim()
  // Valid patterns: @username, https://t.me/..., -100... (numeric)
  return /^(@|https:\/\/t\.me\/|https:\/\/t\.me\+)/.test(s) || /^-?\d+$/.test(s)
}