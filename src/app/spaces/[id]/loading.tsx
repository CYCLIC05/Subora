export default function SpaceLoading() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-20 space-y-10">
        <div className="h-12 w-2/5 rounded-full bg-slate-200/80 animate-pulse" />
        <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm space-y-6">
          <div className="h-72 rounded-[32px] bg-slate-200/80 animate-pulse" />
          <div className="space-y-4">
            <div className="h-5 w-2/3 rounded-full bg-slate-200/80 animate-pulse" />
            <div className="h-4 w-full rounded-full bg-slate-200/80 animate-pulse" />
            <div className="h-4 w-5/6 rounded-full bg-slate-200/80 animate-pulse" />
          </div>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="h-4 w-3/4 rounded-full bg-slate-200/80 animate-pulse" />
              <div className="mt-4 h-5 rounded-full bg-slate-200/80 animate-pulse" />
              <div className="mt-3 h-4 w-5/6 rounded-full bg-slate-200/80 animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
