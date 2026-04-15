/**
 * Lightweight real-time TON price fetcher
 */
export async function getTonPriceInUSD(): Promise<number> {
  try {
    const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=the-open-network&vs_currencies=usd', {
      next: { revalidate: 3600 } // Cache for 1 hour
    });
    const data = await response.json();
    return data['the-open-network']?.usd || 5.0; // Fallback to 5.0 if API fails
  } catch (error) {
    console.error('Failed to fetch TON price:', error);
    return 5.0; // Stable fallback
  }
}

/**
 * 1 Star is roughly 0.018 USD based on current Telegram rates
 * Note: Creators receive a slightly lower amount after commissions.
 */
export const STAR_TO_USD = 0.015;
