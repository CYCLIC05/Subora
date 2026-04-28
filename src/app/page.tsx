import { DiscoverPage } from '@/components/DiscoverPage'
import { getDiscoverSpaces } from '@/lib/database'

export const dynamic = 'force-dynamic';

export default async function Home() {
  try {
    const spaces = await getDiscoverSpaces()
    return <DiscoverPage spaces={spaces || []} />
  } catch (error) {
    console.error('Home Page Crash:', error)
    return <DiscoverPage spaces={[]} />
  }
}
