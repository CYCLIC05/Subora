import { supabase } from '@/lib/supabase'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic';

export default async function DebugPage({ searchParams }: { searchParams: Promise<{ key?: string }> }) {
  const { key } = await searchParams

  // Gate behind admin secret — prevent raw DB exposure in production
  if (!key || key !== process.env.ADMIN_SECRET) {
    redirect('/')
  }

  const { data: spaces, error } = await (supabase! as any).from('spaces').select('*')
  
  return (
    <div className="p-10 font-mono">
      <h1 className="text-2xl font-bold mb-6">Database Debug Inspector</h1>
      
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 mb-6">
          Error: {error.message}
        </div>
      )}

      <div className="space-y-4">
        <p className="text-sm text-slate-500 uppercase tracking-widest">Live Rows in &quot;spaces&quot; table: {spaces?.length || 0}</p>
        
        {spaces && spaces.length > 0 ? (
          <pre className="bg-slate-50 p-6 rounded-3xl border border-slate-200 overflow-auto max-h-[600px] text-xs">
            {JSON.stringify(spaces, null, 2)}
          </pre>
        ) : (
          <div className="bg-emerald-50 text-emerald-700 p-8 rounded-3xl border border-emerald-100 text-center">
            Database is 100% empty. No mock data found.
          </div>
        )}
      </div>

      <div className="mt-10 p-6 bg-slate-100 rounded-3xl text-xs space-y-2">
        <p className="font-bold">Instructions:</p>
        <p>1. If you see data above, visit /api/cleanup?key=YOUR_SECRET to wipe it.</p>
        <p>2. If you see NO data above but your app still shows spaces, close the Telegram bot and restart it to clear the mobile cache.</p>
      </div>
    </div>
  )
}
