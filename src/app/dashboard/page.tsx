import { DashboardClient } from '@/components/DashboardClient'
import { getDashboardData } from '@/lib/mockApi'

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const data = await getDashboardData()

  return <DashboardClient spaces={data.spaces} stats={data.stats} revenueData={data.revenueData} tonPrice={data.tonPrice} />
}
