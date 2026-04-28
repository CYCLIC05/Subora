'use client'

import { useEffect, useState } from 'react'

export default function SeedPage() {
  const [status, setStatus] = useState('Initializing...')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const runSeed = async () => {
      try {
        setStatus('Wiping old data and inserting 80 curated mockups...')
        const res = await fetch('/api/seed')
        const data = await res.json()
        
        if (data.success) {
          setStatus(`✅ Success! ${data.inserted} spaces added. Total in DB: ${data.total_in_db}`)
        } else {
          setError(data.error || 'Unknown error occurred')
          setStatus('❌ Failed')
        }
      } catch (err: any) {
        setError(err.message)
        setStatus('❌ Crash')
      }
    }
    runSeed()
  }, [])

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6 font-mono">
      <div className="max-w-md w-full space-y-6">
        <h1 className="text-xl font-bold border-b border-white/20 pb-4">Subora Discovery Seeder</h1>
        <div className="space-y-2">
          <p className="text-sm text-slate-400">Status:</p>
          <p className="text-lg text-primary">{status}</p>
        </div>
        {error && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl">
            <p className="text-xs text-rose-400 font-bold uppercase mb-1">Error Details:</p>
            <p className="text-sm text-rose-200">{error}</p>
            <p className="text-[10px] text-rose-400 mt-2 italic">Note: Make sure your Supabase environment variables are set in Vercel!</p>
          </div>
        )}
        <div className="pt-6">
          <a href="/" className="text-xs underline hover:text-primary transition-colors">← Back to Home</a>
        </div>
      </div>
    </div>
  )
}
