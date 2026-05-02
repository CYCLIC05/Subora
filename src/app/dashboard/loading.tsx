import { Header } from '@/components/Header'

export default function DashboardLoading() {
  return (
    <main className="min-h-screen bg-background pb-32">
      <Header />

      <div className="container mx-auto px-6 py-12 max-w-5xl space-y-12">
        <header className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="space-y-1">
            <div className="h-10 w-64 rounded-full bg-slate-100 animate-pulse" />
          </div>
          <div className="h-12 w-48 rounded-2xl bg-slate-100 animate-pulse" />
        </header>

        {/* Stats Section Skeleton */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-[32px] border border-slate-100 p-8 shadow-sm">
              <div className="h-3 w-24 rounded-full bg-slate-100 animate-pulse mb-4" />
              <div className="h-10 w-32 rounded-full bg-slate-100 animate-pulse" />
              <div className="h-3 w-16 rounded-full bg-slate-100 animate-pulse mt-4" />
            </div>
          ))}
        </section>

        <section className="space-y-8">
          <div className="flex items-center justify-between">
            <div className="h-4 w-32 rounded-full bg-slate-100 animate-pulse" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
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
        </section>
      </div>
    </main>
  )
}
