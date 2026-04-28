export default function LoadingPage() {
  return (
    <main className="min-h-screen bg-white pb-32">
      <div className="max-w-xl mx-auto px-0 sm:px-4 py-6">
        <div className="space-y-8">
          <header className="px-4 sm:px-0">
            <div className="h-8 w-2/5 rounded-full bg-slate-50 animate-pulse" />
          </header>

          <div className="space-y-8 pb-10">
            {[...Array(2)].map((_, i) => (
              <section key={i}>
                <div className="bg-white sm:rounded-2xl sm:border border-slate-100 overflow-hidden border-y">
                  <div className="p-4 bg-slate-50 border-b border-slate-100">
                    <div className="h-3 w-1/4 rounded-full bg-slate-100 animate-pulse" />
                  </div>
                  <div className="p-4 space-y-6">
                    {[...Array(3)].map((_, j) => (
                      <div key={j} className="space-y-2">
                        <div className="h-3 w-1/5 rounded-full bg-slate-50 animate-pulse" />
                        <div className="h-11 w-full rounded-2xl bg-slate-50 animate-pulse" />
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
