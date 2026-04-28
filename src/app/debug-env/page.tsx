'use client'

import { useEffect, useState } from 'react'

export default function DebugEnvPage() {
  const [envVars, setEnvVars] = useState<Record<string, string>>({})

  useEffect(() => {
    const vars: Record<string, string> = {}
    const keys = ['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY', 'NEXT_PUBLIC_TONCONNECT_MANIFEST_URL']
    
    keys.forEach(key => {
      // In Next.js, we MUST access them by name for them to be inlined
      let val = ''
      if (key === 'NEXT_PUBLIC_SUPABASE_URL') val = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
      if (key === 'NEXT_PUBLIC_SUPABASE_ANON_KEY') val = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
      if (key === 'NEXT_PUBLIC_TONCONNECT_MANIFEST_URL') val = process.env.NEXT_PUBLIC_TONCONNECT_MANIFEST_URL || ''
      
      if (val) {
        vars[key] = val.length > 5 ? `${val.substring(0, 5)}...${val.substring(val.length - 3)}` : 'SET BUT SHORT'
      }
    })
    setEnvVars(vars)
  }, [])

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-8 font-mono">
      <h1 className="text-xl font-bold mb-6 text-emerald-400">Vercel Environment Inspector</h1>
      
      <div className="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-900 border-b border-slate-800">
            <tr>
              <th className="p-4 text-slate-400">Variable Name</th>
              <th className="p-4 text-slate-400">Status</th>
              <th className="p-4 text-slate-400">Value (Masked)</th>
            </tr>
          </thead>
          <tbody>
            {['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY', 'NEXT_PUBLIC_TONCONNECT_MANIFEST_URL'].map(name => (
              <tr key={name} className="border-b border-slate-900/50">
                <td className="p-4 font-bold">{name}</td>
                <td className="p-4">
                  {envVars[name] ? (
                    <span className="px-2 py-1 bg-emerald-500/10 text-emerald-500 rounded text-[10px] font-bold">DETECTED</span>
                  ) : (
                    <span className="px-2 py-1 bg-rose-500/10 text-rose-500 rounded text-[10px] font-bold">NOT FOUND</span>
                  )}
                </td>
                <td className="p-4 text-slate-500">{envVars[name] || '---'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-8 p-6 bg-slate-950 rounded-xl border border-slate-800 space-y-4">
        <h2 className="text-sm font-bold text-slate-300">If "NOT FOUND" is showing:</h2>
        <ol className="list-decimal list-inside text-xs text-slate-500 space-y-2">
          <li>Check that the variable is added to the <strong>Production</strong> environment in Vercel.</li>
          <li>Check for typos (no extra spaces, no quotes).</li>
          <li><strong>IMPORTANT:</strong> You must trigger a NEW build (I am doing that now with this push).</li>
        </ol>
      </div>
    </div>
  )
}
