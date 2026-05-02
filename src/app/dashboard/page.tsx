import { DashboardClient } from '@/components/DashboardClient'
import { getDashboardData } from '@/lib/database'

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const data = await getDashboardData()

  return (
    <DashboardClient 
      spaces={data.spaces} 
      revenueData={data.revenueData} 
      allMembers={data.allMembers}
      transactions={data.transactions}
      payoutData={data.payoutData}
      tonPrice={data.tonPrice}
    />
  )
}
