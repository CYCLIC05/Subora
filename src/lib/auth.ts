import { createHmac } from 'crypto';

/**
 * Verifies Telegram Mini App initData to ensure requests are authentic.
 * @param initData The raw initData string from the Telegram WebApp.
 * @param botToken The Telegram Bot Token.
 * @returns boolean
 */
export function verifyTelegramWebAppData(initData: string, botToken: string): boolean {
  if (!initData || !botToken) return false;

  try {
    const urlParams = new URLSearchParams(initData);
    const hash = urlParams.get('hash');
    urlParams.delete('hash');

    // Sort parameters alphabetically
    const dataCheckString = Array.from(urlParams.entries())
      .map(([key, value]) => `${key}=${value}`)
      .sort()
      .join('\n');

    // Generate secret key
    const secretKey = createHmac('sha256', 'WebAppData')
      .update(botToken)
      .digest();

    // Calculate hash
    const calculatedHash = createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');

    return calculatedHash === hash;
  } catch (error) {
    console.error('Telegram Auth Verification Error:', error);
    return false;
  }
}

/**
 * Extracts the user ID from initData without full verification (useful for internal lookups).
 */
export function getTelegramUserFromInitData(initData: string): number | null {
  try {
    const urlParams = new URLSearchParams(initData);
    const userStr = urlParams.get('user');
    if (!userStr) return null;
    const user = JSON.parse(userStr);
    return user.id || null;
  } catch {
    return null;
  }
}
