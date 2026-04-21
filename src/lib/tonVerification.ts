/**
 * Verify TON blockchain transactions for payment
 */

export interface TransactionVerification {
  verified: boolean
  message?: string
  transactionHash?: string
}

/**
 * Check whether on-chain verification should be enforced.
 * Returns true when a TONAPI_KEY is configured.
 */
export function isVerificationRequired(): boolean {
  return Boolean(process.env.TONAPI_KEY)
}

/**
 * Verify that a TON transaction occurred from user wallet to payment address
 */
export async function verifyTonTransaction(
  userAddress: string,
  paymentAddress: string,
  expectedAmount: string
): Promise<TransactionVerification> {
  try {
    if (!userAddress || !paymentAddress) {
      return { verified: false, message: 'Invalid wallet addresses' }
    }

    if (!process.env.TONAPI_KEY) {
      if (process.env.NODE_ENV !== 'production') {
        return { verified: true, message: 'Development mode: verification skipped' }
      }
      return { verified: false, message: 'Verification service not configured' }
    }

    const tonApiUrl = 'https://tonapi.io/v2'
    const expectedAmountNano = BigInt(expectedAmount)
    const now = Math.floor(Date.now() / 1000)
    const timeWindow = 600

    const response = await fetch(
      `${tonApiUrl}/accounts/${encodeURIComponent(userAddress)}/transactions?limit=50`,
      { headers: { 'Authorization': `Bearer ${process.env.TONAPI_KEY}` } }
    )

    if (!response.ok) {
      return { verified: false, message: 'Unable to verify payment' }
    }

    const data = await response.json()
    const transactions = data.transactions || []

    for (const tx of transactions) {
      const txTime = tx.utime || 0
      if (now - txTime > timeWindow) break

      if (tx.out_msgs && Array.isArray(tx.out_msgs)) {
        for (const outMsg of tx.out_msgs) {
          const msgDestination = outMsg.destination?.address
          const msgAmount = outMsg.value ? BigInt(outMsg.value) : BigInt(0)

          if (
            msgDestination &&
            msgDestination.toLowerCase() === paymentAddress.toLowerCase() &&
            msgAmount >= expectedAmountNano
          ) {
            return { verified: true, message: 'Payment verified', transactionHash: tx.hash }
          }
        }
      }
    }

    return { verified: false, message: 'No matching payment found' }
  } catch (error) {
    console.error('TON verification error:', error)
    return { verified: false, message: 'Verification failed' }
  }
}
/**
 * Verify that a Jetton (e.g. USDT) transaction occurred from user wallet to payment address
 */
export async function verifyJettonTransaction(
  userAddress: string,
  paymentAddress: string,
  expectedAmount: string,
  jettonMaster: string
): Promise<TransactionVerification> {
  try {
    if (!userAddress || !paymentAddress) {
      return { verified: false, message: 'Invalid wallet addresses' }
    }

    if (!process.env.TONAPI_KEY) {
      if (process.env.NODE_ENV !== 'production') {
        return { verified: true, message: 'Development mode: verification skipped' }
      }
      return { verified: false, message: 'Verification service not configured' }
    }

    const tonApiUrl = 'https://tonapi.io/v2'
    const expectedAmountUnits = BigInt(expectedAmount)
    const now = Math.floor(Date.now() / 1000)
    const timeWindow = 600

    // Fetch jetton transfers for the user
    const response = await fetch(
      `${tonApiUrl}/accounts/${encodeURIComponent(userAddress)}/jettons/${encodeURIComponent(jettonMaster)}/history?limit=20`,
      { headers: { 'Authorization': `Bearer ${process.env.TONAPI_KEY}` } }
    )

    if (!response.ok) {
      return { verified: false, message: 'Unable to verify jetton payment' }
    }

    const data = await response.json()
    const events = data.events || []

    for (const event of events) {
      const eventTime = event.timestamp || 0
      if (now - eventTime > timeWindow) break

      const actions = event.actions || []
      for (const action of actions) {
        if (action.type === 'JettonTransfer') {
          const transfer = action.jetton_transfer
          const destination = transfer.recipient?.address
          const amount = transfer.amount ? BigInt(transfer.amount) : BigInt(0)

          if (
            destination &&
            destination.toLowerCase() === paymentAddress.toLowerCase() &&
            amount >= expectedAmountUnits
          ) {
            return { verified: true, message: 'Jetton payment verified', transactionHash: event.event_id }
          }
        }
      }
    }

    return { verified: false, message: 'No matching jetton payment found' }
  } catch (error) {
    console.error('Jetton verification error:', error)
    return { verified: false, message: 'Jetton verification failed' }
  }
}
