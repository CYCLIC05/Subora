import { DiscoverPage } from '@/components/DiscoverPage'
import { getDiscoverSpaces } from '@/lib/database'

export const dynamic = 'force-dynamic';

export default async function Home() {
  const spaces = await getDiscoverSpaces()

  return <DiscoverPage spaces={spaces} />
}
