import { Header } from '@/components/Header'

export default function SpaceLoading() {
  return (
    <main className="min-h-screen bg-background pb-32">
      <Header />
      <div className="relative w-full h-[360px] md:h-[450px] bg-slate-100 animate-pulse overflow-hidden">
        <div className="absolute bottom-12 left-0 right-0 px-6">
          <div className="container mx-auto max-w-5xl space-y-6">
            <div className="h-6 w-40 rounded-full bg-slate-200" />
            <div className="h-16 w-3/4 md:w-2/3 rounded-2xl bg-slate-200" />
            <div className="h-8 w-full md:w-1/2 rounded-full bg-slate-200" />
            <div className="flex gap-4 mt-4">
              <div className="h-10 w-32 rounded-xl bg-slate-200" />
              <div className="h-10 w-48 rounded-xl bg-slate-200" />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12 max-w-5xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left Column: Benefits Skeleton */}
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="h-8 w-64 rounded-full bg-slate-100 animate-pulse" />
              <div className="h-4 w-48 rounded-full bg-slate-100 animate-pulse" />
            </div>
            
            <div className="space-y-6">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="w-6 h-6 rounded-lg bg-slate-100 animate-pulse" />
                  <div className="h-6 w-3/4 rounded-full bg-slate-100 animate-pulse" />
                </div>
              ))}
            </div>

            <div className="h-32 w-full rounded-[32px] bg-slate-50 border border-slate-100 animate-pulse" />
          </div>

          {/* Right Column: Checkout Skeleton */}
          <div className="space-y-8">
            <div className="rounded-[40px] border border-slate-200 bg-white p-8 shadow-sm space-y-6">
              <div className="h-3 w-32 rounded-full bg-slate-100 animate-pulse" />
              <div className="h-24 w-48 rounded-2xl bg-slate-100 animate-pulse" />
              <div className="h-4 w-full rounded-full bg-slate-100 animate-pulse" />
              <div className="h-10 w-full rounded-full bg-slate-100 animate-pulse border-t border-slate-100 pt-4" />
            </div>

            <div className="space-y-4">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="h-24 w-full rounded-[30px] border border-slate-200 bg-white animate-pulse" />
              ))}
            </div>

            <div className="h-16 w-full rounded-[30px] bg-slate-950 animate-pulse" />
          </div>
        </div>
      </div>
    </main>
  )
}
