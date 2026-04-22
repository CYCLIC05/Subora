/**
 * Minimalist TON blockchain fetcher using the public TonCenter API.
 * This ensures we have real-time balance data for any connected wallet.
 */
export async function getTonBalance(address: string): Promise<number> {
  if (!address) return 0;
  
  try {
    // Using public TonCenter API (mainnet)
    // For production, you should use an API key or your own node.
    const response = await fetch(`https://toncenter.com/api/v2/getAddressBalance?address=${encodeURIComponent(address)}`);
    const data = await response.json();
    
    if (data.ok && data.result) {
      // Balance is returned in nanotons (1 TON = 10^9 nanoton)
      return parseInt(data.result, 10) / 1000000000;
    }
    return 0;
  } catch (error) {
    console.error('Failed to fetch TON balance:', error);
    return 0;
  }
}

/**
 * Basic transaction lookup (optional enrichment)
 */
export async function getRecentOnChainTransactions(address: string, limit = 5) {
  try {
    const response = await fetch(`https://toncenter.com/api/v2/getTransactions?address=${encodeURIComponent(address)}&limit=${limit}`);
    const data = await response.json();
    return data.ok ? data.result : [];
  } catch (error) {
    console.error('Failed to fetch on-chain transactions:', error);
    return [];
  }
}
