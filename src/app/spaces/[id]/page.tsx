import Link from 'next/link'
import Image from 'next/image'
import { Check, ChevronLeft, Users, ShieldCheck, Lock, BadgeCheck } from 'lucide-react'
import { Header } from '@/components/Header'
import { SpacePurchasePanel } from '@/components/SpacePurchasePanel'
import { getSpaceById } from '@/lib/mockApi'

export default async function SpaceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const space = await getSpaceById(id)
  const benefits = [
    'Instant private channel access',
    'Encrypted high-signal updates',
    'Verified creator communication',
    'Member networking & indexing',
    '24/7 Priority ecosystem support',
  ]

  if (!space) {
    return (
      <main className="min-h-screen bg-background pb-32">
        <Header />
        <div className="container mx-auto px-6 py-20 max-w-3xl text-center">
          <div className="inline-flex items-center justify-center rounded-full bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 border border-red-100 mb-8">
            Space not found
          </div>
          <h1 className="text-3xl font-heading font-semibold text-slate-950 mb-4">We couldn’t find that space.</h1>
          <p className="text-base text-slate-600 mb-8">The link may be outdated or the space id is invalid. Return to discovery to choose another community.</p>
          <Link href="/" className="inline-flex items-center justify-center rounded-3xl bg-primary px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/15 hover:bg-primary/90 transition-all">
            Return to Discovery
          </Link>
        </div>
      </main>
    )
  }

  return (
      <main className="min-h-screen bg-background pb-32">
      <Header />

      <div className="relative w-full h-[360px] md:h-[450px] bg-slate-950 overflow-hidden">
        <Image
          src={space.cover_image}
          alt={space.name}
          fill
          className="object-cover opacity-60 scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent" />

        <Link
          href="/"
          className="absolute top-6 left-6 bg-white shadow-xl p-2.5 rounded-2xl text-zinc-900 hover:bg-zinc-50 transition-all active:scale-95 border border-zinc-100 z-10"
        >
          <ChevronLeft className="w-5 h-5" />
        </Link>

        <div className="absolute bottom-12 left-0 right-0 px-6">
          <div className="container mx-auto max-w-5xl">
            <div className="inline-flex items-center gap-2 bg-white/90 text-slate-900 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest mb-4 border border-white/90 shadow-sm shadow-slate-900/10">
              <ShieldCheck className="w-3.5 h-3.5" />
              Verified Community
            </div>
            <h1 className="text-4xl md:text-6xl font-heading font-semibold text-white mb-4 tracking-tighter leading-[0.95]">
              {space.name}
            </h1>
            <p className="max-w-3xl text-base md:text-xl text-white/90 font-medium leading-relaxed mb-4">
              {space.description}
            </p>
            <p className="max-w-3xl text-sm md:text-base text-slate-200 font-medium leading-relaxed mb-6">
              Get daily alpha, private discussions, and exclusive drops.
            </p>
            <div className="flex flex-wrap items-center gap-4 text-white/80 text-sm font-medium">
              <span className="flex items-center gap-2.5">
                <Users className="w-4 h-4 opacity-70" /> by {space.channel_link}
              </span>
              <span className="flex items-center gap-2.5">
                <BadgeCheck className="w-4 h-4 text-emerald-300" /> {space.subscribers.toLocaleString()} members already inside
              </span>
              <span className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-primary" /> Powered by Telegram Stars
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-20 max-w-5xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-24">
          <div className="lg:col-span-2 space-y-20">
            <section className="space-y-8">
            <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
              <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-slate-400">Why join</p>
              <p className="mt-4 text-3xl md:text-4xl font-heading font-semibold text-slate-950 leading-tight tracking-tight">
                Real-time market alpha, private creator threads, and member-only drops.
              </p>
              <div className="mt-6 grid gap-4">
                {['Daily alpha alerts', 'Private creator discussions', 'Exclusive access to drops'].map((benefit) => (
                  <div key={benefit} className="flex items-start gap-3">
                    <span className="mt-1 text-primary text-xl">•</span>
                    <p className="text-sm md:text-base font-semibold text-slate-700">{benefit}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

            <section className="space-y-8 relative overflow-hidden rounded-[32px] border border-zinc-100 bg-zinc-50/50 p-8 shadow-sm">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/80 to-white z-10" />
              <div className="absolute bottom-10 left-0 right-0 z-20 flex flex-col items-center justify-center text-center px-6">
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-xl shadow-zinc-900/5 mb-5 border border-zinc-100">
                  <Lock className="w-6 h-6 text-zinc-900" />
                </div>
                <h3 className="text-xl font-bold text-zinc-900 mb-2 tracking-tight">Exclusive Content Locked</h3>
                <p className="text-sm text-zinc-500 font-medium max-w-[280px]">Select a service plan to unlock real-time updates and premium insights.</p>
              </div>
              <h2 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest border-b border-zinc-100 pb-6 mb-6">Latest from Vault</h2>

              <div className="space-y-4 filter blur-[8px] opacity-40 pointer-events-none select-none">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="bg-white p-5 rounded-2xl border border-zinc-100 shadow-sm flex gap-4">
                    <div className="w-12 h-12 bg-zinc-200 rounded-xl" />
                    <div className="space-y-3 flex-1 py-1">
                      <div className="h-3 bg-zinc-200 rounded w-1/3" />
                      <div className="h-2 bg-zinc-100 rounded w-3/4" />
                      <div className="h-2 bg-zinc-100 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="space-y-10">
              <h2 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest border-b border-zinc-50 pb-6">What you get</h2>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {benefits.map((benefit, index) => (
                  <li key={index} className="flex items-center gap-5 p-6 rounded-[32px] bg-zinc-50/50 border border-zinc-100 group hover:border-primary/20 hover:bg-white hover:shadow-xl hover:shadow-primary/5 transition-all cursor-default relative overflow-hidden">
                    <div className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-2xl flex items-center justify-center group-hover:scale-110 z-10">
                      <Check className="w-4 h-4" />
                    </div>
                    <span className="text-zinc-900 text-sm md:text-base font-semibold tracking-tight z-10">{benefit}</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/[0.03] to-primary/0 translate-x-[-100%] group-hover:animate-[shimmer_1.5s_infinite]" />
                  </li>
                ))}
              </ul>
            </section>
          </div>

          <div className="lg:col-span-1">
            <SpacePurchasePanel space={space} />
          </div>
        </div>
      </div>
    </main>
  )
}
