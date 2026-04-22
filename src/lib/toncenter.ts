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

/**
 * Fetch Jetton balance (e.g., USDT)
 */
export async function getJettonBalance(address: string, jettonMaster: string): Promise<number> {
  if (!address || !jettonMaster) return 0;
  
  try {
    // 1. Get the jetton wallet address for the user
    const response = await fetch(`https://toncenter.com/api/v2/runGetMethod`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        address: jettonMaster,
        method: 'get_wallet_address',
        stack: [
          ["tvm.Slice", address]
        ]
      })
    });
    const data = await response.json();
    
    if (data.ok && data.result?.stack?.[0]?.[1]) {
      const jettonWalletAddress = data.result.stack[0][1];
      
      // 2. Get the balance of that jetton wallet
      const balResponse = await fetch(`https://toncenter.com/api/v2/runGetMethod`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address: jettonWalletAddress,
          method: 'get_wallet_data',
          stack: []
        })
      });
      const balData = await balResponse.json();
      
      if (balData.ok && balData.result?.stack?.[0]?.[1]) {
        // Most jettons return balance as the first item in stack, as hex
        const balanceHex = balData.result.stack[0][1];
        const balanceRaw = parseInt(balanceHex, 16);
        
        // USDT has 6 decimals on TON. For other jettons, you'd need to fetch decimals from metadata.
        return balanceRaw / 1000000;
      }
    }
    return 0;
  } catch (error) {
    console.error('Failed to fetch Jetton balance:', error);
    return 0;
  }
}
