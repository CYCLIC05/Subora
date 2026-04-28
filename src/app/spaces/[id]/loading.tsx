export default function SpaceLoading() {
  return (
    <main className="min-h-screen bg-background pb-32">
      <div className="relative w-full h-[360px] md:h-[450px] bg-slate-200/80 animate-pulse overflow-hidden">
        <div className="absolute bottom-12 left-0 right-0 px-6">
          <div className="container mx-auto max-w-5xl space-y-4">
            <div className="h-6 w-32 rounded-full bg-slate-300/50" />
            <div className="h-12 w-3/4 md:w-1/2 rounded-2xl bg-slate-300/50" />
            <div className="h-6 w-full md:w-2/3 rounded-full bg-slate-300/50" />
            <div className="flex gap-4 mt-6">
              <div className="h-8 w-32 rounded-full bg-slate-300/50" />
              <div className="h-8 w-40 rounded-full bg-slate-300/50" />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12 max-w-xl">
        <div className="rounded-[40px] border border-slate-200 bg-white p-8 shadow-sm space-y-6">
          <div className="h-4 w-32 rounded-full bg-slate-200/80 animate-pulse" />
          <div className="h-16 w-48 rounded-2xl bg-slate-200/80 animate-pulse" />
          <div className="h-4 w-full rounded-full bg-slate-200/80 animate-pulse" />
          
          <div className="mt-8 space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 w-full rounded-[30px] border border-slate-200 bg-slate-50 animate-pulse" />
            ))}
          </div>
          
          <div className="mt-6 h-16 w-full rounded-[30px] bg-slate-200/80 animate-pulse" />
        </div>
      </div>
    </main>
  )
}
