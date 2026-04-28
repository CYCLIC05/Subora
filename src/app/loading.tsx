export default function LoadingPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="w-full space-y-6 pt-4 pb-20">
        <div className="px-4 py-3 border-b border-slate-100">
          <div className="h-10 w-full rounded-2xl bg-slate-50 animate-pulse" />
        </div>
        
        <div className="flex flex-col border-t border-slate-100">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="flex items-center gap-4 p-4 border-b border-slate-100 bg-white">
              <div className="w-14 h-14 rounded-2xl bg-slate-50 animate-pulse shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3.5 w-1/2 rounded-full bg-slate-50 animate-pulse" />
                <div className="h-2.5 w-1/3 rounded-full bg-slate-50 animate-pulse" />
              </div>
              <div className="shrink-0 flex flex-col items-end gap-1.5">
                <div className="h-3.5 w-10 rounded-full bg-slate-50 animate-pulse" />
                <div className="h-3.5 w-8 rounded-full bg-slate-50 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
