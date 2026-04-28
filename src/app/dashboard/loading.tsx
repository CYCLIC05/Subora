import { Header } from '@/components/Header'

export default function DashboardLoading() {
  return (
    <main className="min-h-screen bg-background pb-32">
      <Header />

      <div className="container mx-auto px-6 py-12 max-w-4xl space-y-12">
        <header className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between border-b border-slate-100 pb-8">
          <div className="space-y-1">
            <div className="h-9 w-48 rounded-full bg-slate-200/80 animate-pulse" />
          </div>
          <div className="h-12 w-40 rounded-2xl bg-slate-200/80 animate-pulse" />
        </header>

        <section className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="flex items-center gap-4 p-4 border-b border-slate-100 bg-white rounded-2xl shadow-sm border">
                {/* Left: Avatar Skeleton */}
                <div className="w-14 h-14 rounded-2xl bg-slate-50 animate-pulse shrink-0" />
                
                {/* Middle: Content Skeleton */}
                <div className="flex-1 space-y-2">
                  <div className="h-3.5 w-1/2 rounded-full bg-slate-50 animate-pulse" />
                  <div className="h-2.5 w-1/3 rounded-full bg-slate-50 animate-pulse" />
                </div>

                {/* Right: Price & CTA Skeleton */}
                <div className="shrink-0 flex flex-col items-end gap-1.5">
                  <div className="h-3.5 w-12 rounded-full bg-slate-50 animate-pulse" />
                  <div className="h-4 w-8 rounded-lg bg-slate-50 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}
