export default function CreateLoading() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-20 max-w-3xl space-y-8">
        <div className="h-12 w-2/5 rounded-full bg-slate-200/80 animate-pulse" />
        <div className="space-y-6 rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="space-y-4">
              <div className="h-4 w-3/4 rounded-full bg-slate-200/80 animate-pulse" />
              <div className="h-12 rounded-[24px] bg-slate-200/80 animate-pulse" />
            </div>
          ))}
          <div className="mt-4 h-14 w-full rounded-[28px] bg-slate-200/80 animate-pulse" />
        </div>
      </div>
    </main>
  )
}
