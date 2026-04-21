import { DashboardClient } from '@/components/DashboardClient'
import { getDashboardData } from '@/lib/database'

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const data = await getDashboardData()

  return (
    <DashboardClient 
      spaces={data.spaces} 
      stats={data.stats} 
      revenueData={data.revenueData} 
      revenueBySpace={data.revenueBySpace} 
      allMembers={data.allMembers}
      tonPrice={data.tonPrice} 
    />
  )
}
