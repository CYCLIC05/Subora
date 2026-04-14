export default function LoadingPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-20 space-y-10">
        <div className="h-12 w-2/3 rounded-full bg-slate-200/80 animate-pulse" />
        <div className="grid gap-6 lg:grid-cols-3">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="space-y-4 rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="h-8 w-3/4 rounded-full bg-slate-200/80 animate-pulse" />
              <div className="space-y-3">
                <div className="h-4 rounded-full bg-slate-200/80 animate-pulse" />
                <div className="h-4 w-5/6 rounded-full bg-slate-200/80 animate-pulse" />
                <div className="h-4 w-2/3 rounded-full bg-slate-200/80 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
