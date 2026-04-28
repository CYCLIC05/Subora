import Link from 'next/link'
import Image from 'next/image'
import { Check, ChevronLeft, Users, Lock, Share2 } from 'lucide-react'
import { Metadata } from 'next'
import { Header } from '@/components/Header'
import { SpacePurchasePanel } from '@/components/SpacePurchasePanel'
import { getSpaceById } from '@/lib/database'
import { ShareButton } from '@/components/ShareButton'
import { SpaceCoverImage } from '@/components/SpaceCoverImage'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const space = await getSpaceById(id)
  
  if (!space) return { title: 'Space Not Found | Subora' }

  const ogUrl = new URL('/api/og', 'https://subora-spaces.vercel.app') // Fallback base
  ogUrl.searchParams.set('name', space.name)
  ogUrl.searchParams.set('subscribers', String(space.subscribers))
  if (space.cover_image) ogUrl.searchParams.set('image', space.cover_image)

  const finalOgImage = ogUrl.toString()

  return {
    title: `${space.name} | Subora`,
    description: space.description,
    openGraph: {
      title: `Join ${space.name} on Subora`,
      description: space.description,
      images: [finalOgImage],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `Join ${space.name} on Subora`,
      description: space.description,
      images: [finalOgImage],
    },
  }
}

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
        <SpaceCoverImage
          src={space.cover_image}
          alt={space.name}
          className="w-full h-full object-cover opacity-60 scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent" />

        <Link
          href="/"
          className="absolute top-6 left-6 bg-white shadow-xl p-2.5 rounded-2xl text-zinc-900 hover:bg-zinc-50 transition-all active:scale-95 border border-zinc-100 z-10"
        >
          <ChevronLeft className="w-5 h-5" />
        </Link>
        
        <div className="absolute top-6 right-6 z-10">
          <ShareButton space={space} />
        </div>

        <div className="absolute bottom-12 left-0 right-0 px-6">
          <div className="container mx-auto max-w-5xl">
            <div className="inline-flex items-center gap-2 bg-white/90 text-slate-900 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.1em] mb-4 border border-white/90 shadow-sm shadow-slate-900/10">
              Verified Marketplace
            </div>
            <h1 className="text-4xl md:text-6xl font-heading font-semibold text-white mb-4 tracking-tighter leading-[0.95]">
              {space.name}
            </h1>
            <p className="max-w-3xl text-base md:text-xl text-white/90 font-medium leading-relaxed mb-8">
              {space.description}
            </p>
            <div className="flex flex-wrap items-center gap-4 text-white/80 text-sm font-medium">
              <span className="flex items-center gap-2.5 bg-white/10 px-3 py-1.5 rounded-xl backdrop-blur-sm">
                <span>by <span className="text-white font-bold">{space.creator_name || 'Verified Creator'}</span></span>
              </span>
              <span className="flex items-center gap-2.5">
                <span className="text-emerald-300 font-bold">{space.subscribers.toLocaleString()} members</span> already inside
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12 max-w-xl">
        <SpacePurchasePanel space={space} />
      </div>
    </main>
  )
}
