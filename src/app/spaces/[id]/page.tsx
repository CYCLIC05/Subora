'use client';

import { Header } from "@/components/Header";
import { Space } from "@/lib/supabase";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import { Check, ChevronLeft, Users, ShieldCheck, ArrowRight, Lock, BadgeCheck, Zap } from "lucide-react";
import { motion } from "framer-motion";
import WebApp from "@twa-dev/sdk";

// Mock data fetching for now
const getSpace = (id: string): Space | null => {
  const MOCK_SPACES = [
    {
      id: '1',
      creator_telegram_id: 123,
      name: 'Alpha Trading Signals',
      description: 'Handcrafted market analysis and real-time trade setups for high-performing traders. Learn directly from professional analysts and grow your portfolio with vetted strategies.',
      cover_image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&q=80',
      channel_link: '@alphatrading',
      tiers: {
        tier1: { name: 'Standard Alpha', price: 99, duration: 'week' },
        tier2: { name: 'Premium Full Access', price: 299, duration: 'month' },
      },
      created_at: new Date().toISOString(),
    },
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
          WebApp.MainButton.setText(`Secure Enrollment`);
          WebApp.MainButton.show();
          const handleMainButtonClick = () => {
            WebApp.HapticFeedback.notificationOccurred('success');
            alert(`Proceeding to encrypted payment for ${fetchedSpace.name}`);
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

  if (!space) return <div className="p-8 text-center text-zinc-400 font-medium">Authenticating secure connection...</div>;

  const benefits = [
    "Instant private channel access",
    "Encrypted high-signal updates",
    "Verified creator communication",
    "Member networking & indexing",
    "24/7 Priority ecosystem support"
  ];

  return (
    <main className="min-h-screen bg-white pb-32">
      <Header />
      
      {/* Premium Hero Section */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="relative w-full h-[360px] md:h-[450px] bg-zinc-950 overflow-hidden"
      >
        <Image
          src={space.cover_image}
          alt={space.name}
          fill
          className="object-cover opacity-60 scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-white/20 to-transparent" />
        
        <button 
          onClick={() => router.back()}
          className="absolute top-6 left-6 bg-white shadow-xl p-2.5 rounded-2xl text-zinc-900 hover:bg-zinc-50 transition-all active:scale-95 border border-zinc-100 z-10"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="absolute bottom-12 left-0 right-0 px-6">
          <div className="container mx-auto max-w-5xl">
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest mb-6 border border-primary/20 shadow-sm shadow-primary/5"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Verified Community
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-4xl md:text-7xl font-heading font-semibold text-zinc-950 mb-6 tracking-tighter leading-[0.9]"
            >
              {space.name}
            </motion.h1>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex flex-wrap items-center gap-8 text-zinc-500 text-sm font-medium"
            >
              <span className="flex items-center gap-2.5">
                <Users className="w-4 h-4 opacity-40" /> 1,248 Active Members
              </span>
              <span className="flex items-center gap-2.5">
                <BadgeCheck className="w-4 h-4 text-emerald-500" /> Secure Ecosystem
              </span>
            </motion.div>
          </div>
        </div>
      </motion.div>

      <div className="container mx-auto px-6 py-20 max-w-5xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-24">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-20">
            <section className="space-y-8">
              <h2 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest border-b border-zinc-50 pb-6">Executive Abstract</h2>
              <p className="text-zinc-700 text-2xl leading-relaxed font-medium tracking-tight">
                {space.description}
              </p>
            </section>

            <section className="space-y-10">
              <h2 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest border-b border-zinc-50 pb-6">Member Deliverables</h2>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {benefits.map((benefit, i) => (
                  <li key={i} className="flex items-center gap-5 p-6 rounded-[32px] bg-zinc-50/50 border border-zinc-100 group hover:border-primary/20 hover:bg-white hover:shadow-xl hover:shadow-primary/5 transition-all">
                    <div className="flex-shrink-0 w-8 h-8 bg-zinc-900 rounded-2xl flex items-center justify-center group-hover:bg-primary transition-all group-hover:rotate-12">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-zinc-900 text-base font-semibold tracking-tight">{benefit}</span>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          {/* Sidebar / Tiers */}
          <div className="lg:col-span-1">
            <div className="sticky top-28 space-y-8">
              <h2 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-6">Service Plans</h2>
              
              {/* Tier 1 - Pricing Punch */}
              <motion.div 
                whileHover={{ y: -4 }}
                className="p-10 rounded-[48px] border-2 border-primary bg-primary/[0.02] text-zinc-950 relative overflow-hidden shadow-2xl shadow-primary/10"
              >
                <div className="flex justify-between items-start mb-12">
                  <div className="space-y-1">
                    <h3 className="font-heading text-xl font-bold tracking-tight">{space.tiers.tier1.name}</h3>
                    <p className="text-[10px] text-primary font-bold uppercase tracking-widest">Recommended Plan</p>
                  </div>
                  <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
                    <Zap className="w-6 h-6 text-primary" />
                  </div>
                </div>
                
                <div className="space-y-2 mb-12">
                  <div className="flex items-baseline gap-3">
                    <span className="text-6xl font-mono font-bold tracking-tighter text-zinc-950">{space.tiers.tier1.price}</span>
                    <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Stars</span>
                  </div>
                  <p className="text-base font-semibold text-zinc-400 tracking-tight">Access for one {space.tiers.tier1.duration}</p>
                </div>

                <div className="space-y-5">
                  <div className="flex items-center gap-3 text-xs font-bold text-primary bg-white shadow-pro p-5 rounded-2xl border border-primary/10">
                    <Lock className="w-4 h-4" />
                    Secure Telegram stars escrow
                  </div>
                  <p className="text-[10px] text-zinc-400 font-bold uppercase text-center tracking-[0.2em] animate-pulse">
                    Enroll using Main Button
                  </p>
                </div>
              </motion.div>

              {/* Tier 2 */}
              {space.tiers.tier2 && (
                <div className="p-8 rounded-[40px] border border-zinc-100 bg-white hover:border-zinc-300 transition-all cursor-pointer group shadow-sm hover:shadow-xl hover:shadow-zinc-950/5">
                  <div className="flex justify-between items-center mb-8">
                    <h3 className="font-heading text-lg font-bold text-zinc-900 tracking-tight">{space.tiers.tier2.name}</h3>
                    <div className="w-10 h-10 rounded-2xl bg-zinc-50 flex items-center justify-center group-hover:bg-primary/5 transition-colors">
                      <ArrowRight className="w-5 h-5 text-zinc-300 group-hover:text-primary transition-transform group-hover:translate-x-0.5" />
                    </div>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-mono font-bold text-zinc-950 tracking-tighter">{space.tiers.tier2.price}</span>
                    <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Stars / {space.tiers.tier2.duration}</span>
                  </div>
                </div>
              )}

              <footer className="text-center space-y-6 px-10 pt-6">
                <div className="flex items-center justify-center gap-3 opacity-60 grayscale hover:grayscale-0 transition-all">
                   <div className="w-5 h-5 bg-zinc-900 rounded-md flex items-center justify-center">
                    <Lock className="w-3 h-3 text-white" />
                   </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-950">Powered by Telegram Stars</span>
                </div>
                <p className="text-[10px] text-zinc-400 font-bold leading-relaxed tracking-wider">
                  ENCRYPTED PAYMENT PROTOCOL <br />
                  FUNDS RELEASED AFTER 24H ESCROW.
                </p>
              </footer>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
