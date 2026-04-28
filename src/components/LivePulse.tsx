'use client'

import { motion } from 'framer-motion'
import { Activity, UserPlus, TrendingUp, DollarSign } from 'lucide-react'
import { useEffect, useState } from 'react'

type PulseEvent = {
  id: string
  type: 'join' | 'payment' | 'search'
  title: string
  subtitle: string
  time: string
}

export function LivePulse({ members = [] }: { members?: any[] }) {
  const [events, setEvents] = useState<PulseEvent[]>([])

  useEffect(() => {
    // Generate initial events from members
    const initialEvents: PulseEvent[] = members.slice(0, 5).map((m, i) => ({
      id: `initial-${i}`,
      type: m.amountPaid > 0 ? 'payment' : 'join',
      title: m.amountPaid > 0 ? `Payment Received` : `New Member Joined`,
      subtitle: `${m.telegram_user_id || 'User'} joined ${m.spaceName}`,
      time: new Date(m.joinDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }))

    // Add some "system" pulse events for flavor
    const systemEvents: PulseEvent[] = [
      {
        id: 'sys-1',
        type: 'search',
        title: 'High Search Volume',
        subtitle: '"Crypto Alpha" is trending today',
        time: 'Just now'
      },
      {
        id: 'sys-2',
        type: 'join',
        title: 'Network Growth',
        subtitle: '10+ members joined in the last hour',
        time: '5m ago'
      }
    ]

    setEvents([...systemEvents, ...initialEvents])
  }, [members])

  return (
    <div className="bg-white rounded-[32px] border border-slate-100 p-6 shadow-sm h-full">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Live Activity Pulse</h2>
      </div>

      <div className="space-y-6 max-h-[350px] overflow-y-auto no-scrollbar">
        {events.map((event, idx) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="group"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[13px] font-bold text-slate-950 truncate tracking-tight">{event.title}</p>
                <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest whitespace-nowrap">{event.time}</span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium truncate mt-1 leading-relaxed">{event.subtitle}</p>
            </div>
          </motion.div>
        ))}
      </div>

    </div>
  )
}
