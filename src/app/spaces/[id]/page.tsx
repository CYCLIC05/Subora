'use client';

import { Header } from "@/components/Header";
import { Space } from "@/lib/supabase";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import { Check, ChevronLeft, Users, ShieldCheck, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import WebApp from "@twa-dev/sdk";

// Mock data fetching for now
const getSpace = (id: string): Space | null => {
  const MOCK_SPACES = [
    {
      id: '1',
      creator_telegram_id: 123,
      name: 'Growth Alpha Group',
      description: 'Exclusive signals and growth strategies for upcoming projects. Learn from the best in the space. Our members get daily updates, project deep-dives, and early access to partnership opportunities.',
      cover_image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&q=80',
      channel_link: '@growthalpha',
      tiers: {
        tier1: { name: 'Weekly Access', price: 99, duration: 'week' },
        tier2: { name: 'Monthly Access', price: 299, duration: 'month' },
      },
      created_at: new Date().toISOString(),
    },
    // ... add more if needed
  ];
  return MOCK_SPACES.find(s => s.id === id) || MOCK_SPACES[0];
};

export default function SpaceDetail() {
  const params = useParams();
  const router = useRouter();
  const [space, setSpace] = useState<Space | null>(null);

  useEffect(() => {
    if (params.id) {
      const fetchedSpace = getSpace(params.id as string);
      setSpace(fetchedSpace);
      
      if (fetchedSpace) {
        try {
          WebApp.MainButton.setText(`Complete Subscription`);
          WebApp.MainButton.show();
          const handleMainButtonClick = () => {
            WebApp.HapticFeedback.notificationOccurred('success');
            alert(`Simulating subscription to ${fetchedSpace.name}`);
          };
          WebApp.MainButton.onClick(handleMainButtonClick);
          return () => {
            WebApp.MainButton.hide();
            WebApp.MainButton.offClick(handleMainButtonClick);
          };
        } catch (e) {}
      }
    }
    
    try {
      WebApp.BackButton.show();
      WebApp.BackButton.onClick(() => {
        router.back();
      });
      return () => WebApp.BackButton.hide();
    } catch (e) {}
  }, [params.id, router]);

  if (!space) return <div className="p-8 text-center text-zinc-400">Loading ecosystem details...</div>;

  const benefits = [
    "Direct secure channel access",
    "High-fidelity updates",
    "Member indexing & networking",
    "Verified creator communication",
    "Priority infrastructure support"
  ];

  return (
    <main className="min-h-screen bg-white pb-32">
      <Header />
      
      {/* Hero Section */}
      <div className="relative w-full h-[280px] md:h-[360px] bg-zinc-900">
        <Image
          src={space.cover_image}
          alt={space.name}
          fill
          className="object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent" />
        
        <button 
          onClick={() => router.back()}
          className="absolute top-4 left-4 bg-white/10 backdrop-blur-md p-2 rounded-xl text-white hover:bg-white/20 transition-all active:scale-95"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="absolute bottom-8 left-0 right-0 px-4">
          <div className="container mx-auto max-w-5xl">
            <h1 className="text-4xl md:text-5xl font-heading font-semibold text-white mb-3 tracking-tight">
              {space.name}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-white/70 text-[13px] font-medium">
              <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-sm">
                <Users className="w-3.5 h-3.5" /> 1,248 members
              </span>
              <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-sm">
                <ShieldCheck className="w-3.5 h-3.5" /> Verified Tier
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-5xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-12">
            <section>
              <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4">Description</h2>
              <p className="text-zinc-600 text-lg leading-relaxed font-medium">
                {space.description}
              </p>
            </section>

            <section>
              <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-6">Deliverables</h2>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {benefits.map((benefit, i) => (
                  <li key={i} className="flex items-center gap-3 p-4 rounded-2xl bg-zinc-50 border border-zinc-100">
                    <div className="flex-shrink-0 w-5 h-5 bg-zinc-900 rounded-full flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-zinc-900 text-sm font-semibold">{benefit}</span>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          {/* Sidebar / Tiers */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-4">
              <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-6">Service Plans</h2>
              
              {/* Tier 1 */}
              <div className="p-6 rounded-3xl border-2 border-zinc-900 bg-zinc-900 text-white relative overflow-hidden shadow-2xl shadow-zinc-950/20 transition-all hover:translate-y-[-2px]">
                <div className="flex justify-between items-start mb-6">
                  <h3 className="font-heading text-lg font-semibold">{space.tiers.tier1.name}</h3>
                  <span className="bg-white/10 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider">Active</span>
                </div>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-heading font-bold">{space.tiers.tier1.price}</span>
                  <span className="opacity-60 text-sm font-medium">Stars / {space.tiers.tier1.duration}</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-medium opacity-80 bg-white/5 p-3 rounded-xl border border-white/10">
                  <ArrowRight className="w-4 h-4" />
                  Subscription managed via Telegram
                </div>
              </div>

              {/* Tier 2 (if exists) */}
              {space.tiers.tier2 && (
                <div className="p-6 rounded-3xl border border-zinc-100 bg-white hover:border-zinc-300 transition-all cursor-pointer group">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-heading text-lg font-semibold text-zinc-900">{space.tiers.tier2.name}</h3>
                  </div>
                  <div className="flex items-baseline gap-1 mb-2">
                    <span className="text-3xl font-heading font-bold text-zinc-950">{space.tiers.tier2.price}</span>
                    <span className="text-zinc-400 text-sm font-medium">Stars / {space.tiers.tier2.duration}</span>
                  </div>
                  <div className="pt-4 border-t border-zinc-50 flex items-center justify-between text-xs font-bold text-zinc-400 group-hover:text-zinc-900 transition-colors">
                    Switch to this plan <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              )}

              <footer className="text-center px-4">
                <p className="text-[10px] text-zinc-400 font-medium leading-relaxed">
                  Service levels are defined by the creator. <br />
                  Stars are refundable via Telegram support within 24h.
                </p>
              </footer>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
