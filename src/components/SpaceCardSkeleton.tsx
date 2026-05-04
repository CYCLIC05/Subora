'use client'

export function SpaceCardSkeleton() {
  return (
    <div className="flex flex-col h-full justify-between bg-white rounded-3xl border border-slate-100 p-5 space-y-4 animate-pulse">
      <div className="flex items-start justify-between w-full">
        <div className="w-12 h-12 rounded-xl bg-slate-100" />
        <div className="w-16 h-7 rounded-full bg-slate-100" />
      </div>
      
      <div className="flex-1 space-y-3">
        <div className="h-5 w-3/4 bg-slate-100 rounded-lg" />
        <div className="flex items-center gap-2">
          <div className="h-3 w-16 bg-slate-100 rounded-md" />
          <div className="w-1 h-1 rounded-full bg-slate-200" />
          <div className="h-3 w-20 bg-slate-100 rounded-md" />
        </div>
        <div className="h-3 w-full bg-slate-50 rounded-md" />
      </div>
    </div>
  )
}

export function SpaceListSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="h-24 w-full rounded-[24px] bg-white border border-slate-100 p-4 flex items-center gap-4 animate-pulse">
           <div className="w-12 h-12 rounded-xl bg-slate-100 flex-shrink-0" />
           <div className="flex-1 space-y-2">
              <div className="h-4 w-1/3 bg-slate-100 rounded" />
              <div className="h-3 w-1/2 bg-slate-50 rounded" />
           </div>
           <div className="w-20 h-8 rounded-full bg-slate-100" />
        </div>
      ))}
    </div>
  )
}
