import { DiscoverPage } from '@/components/DiscoverPage'
import { getDiscoverSpaces } from '@/lib/database'

export const revalidate = 60;

export default async function Home() {
  const spaces = await getDiscoverSpaces()

  return <DiscoverPage spaces={spaces} />
}
