import { DiscoverPage } from '@/components/DiscoverPage'
import { getDiscoverSpaces } from '@/lib/database'

export const dynamic = 'force-dynamic';

export default async function Home() {
  try {
    const spaces = await getDiscoverSpaces()
    
    if (!spaces) {
      console.warn('getDiscoverSpaces returned null/undefined')
      return <DiscoverPage spaces={[]} />
    }

    return <DiscoverPage spaces={spaces} />
  } catch (error) {
    console.error('CRITICAL: Home Page Crash:', error)
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-10 text-center">
        <div className="space-y-4">
          <p className="text-slate-400 font-medium">System Maintenance</p>
          <h1 className="text-xl font-bold text-slate-900">Subora is updating...</h1>
          <p className="text-sm text-slate-500">Please refresh in 30 seconds.</p>
        </div>
      </div>
    )
  }
}
