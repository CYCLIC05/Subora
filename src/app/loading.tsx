export default function LoadingPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="w-full space-y-12 pt-4 pb-20">
        {/* Search Bar Skeleton */}
        <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md px-4 py-4 border-b border-slate-100 rounded-b-3xl">
          <div className="h-14 w-full rounded-[32px] bg-slate-100 animate-pulse" />
          <div className="flex gap-3 mt-4 overflow-hidden">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-10 w-24 rounded-2xl bg-slate-100 animate-pulse shrink-0" />
            ))}
          </div>
        </div>
        
        {/* Featured Hero Skeleton */}
        <div className="px-4">
          <div className="aspect-[16/8] w-full rounded-[40px] bg-slate-100 animate-pulse" />
        </div>

        {/* Section Title Skeleton */}
        <div className="px-4 space-y-4">
          <div className="h-3 w-24 rounded-full bg-slate-100 animate-pulse" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, index) => (
              <div key={index} className="flex flex-col h-[180px] justify-between bg-white rounded-3xl border border-slate-100 p-5 shadow-sm">
                <div className="flex justify-between items-start">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 animate-pulse" />
                  <div className="w-16 h-7 rounded-full bg-slate-100 animate-pulse" />
                </div>
                <div className="space-y-3 mt-4">
                  <div className="h-4 w-3/4 rounded-full bg-slate-100 animate-pulse" />
                  <div className="h-2 w-1/2 rounded-full bg-slate-100 animate-pulse" />
                  <div className="h-3 w-full rounded-full bg-slate-100 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
