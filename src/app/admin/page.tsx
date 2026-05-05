import { AdminDashboard } from '@/components/AdminDashboard'
import { getAdminData } from '@/lib/database'

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const data = await getAdminData()

  return <AdminDashboard data={data} />
}
