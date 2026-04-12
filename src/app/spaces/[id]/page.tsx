'use client';

import { Header } from "@/components/Header";
import { Space } from "@/lib/supabase";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import { Check, ChevronLeft, Star, Users, ShieldCheck, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import WebApp from "@twa-dev/sdk";

// Mock data fetching for now
// ... (rest of the mock data code)
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
      
      // Configure Main Button
      if (fetchedSpace) {
        try {
          WebApp.MainButton.setText(`Subscribe for ${fetchedSpace.tiers.tier1.price} Stars`);
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
    
    // Set Telegram back button
    try {
      WebApp.BackButton.show();
      WebApp.BackButton.onClick(() => {
        router.back();
      });
      return () => WebApp.BackButton.hide();
    } catch (e) {}
  }, [params.id, router]);

  if (!space) return <div className="p-8 text-center text-miro-slate">Loading...</div>;

  const benefits = [
    "Full access to private channel",
    "Real-time exclusive updates",
    "Member-only discussions",
    "Priority support from creator",
    "Direct networking opportunities"
  ];

  return (
    <main className="min-h-screen bg-white">
      <Header />
      
      {/* Hero Section */}
      <div className="relative w-full h-[240px] md:h-[320px]">
        <Image
          src={space.cover_image}
          alt={space.name}
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <button 
          onClick={() => router.back()}
          className="absolute top-4 left-4 bg-white/20 backdrop-blur-md p-2 rounded-full text-white hover:bg-white/40 transition-colors"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div className="absolute bottom-6 left-0 right-0 px-4">
          <div className="container mx-auto">
            <h1 className="text-3xl md:text-4xl font-display font-bold text-white mb-2">
              {space.name}
            </h1>
            <div className="flex items-center gap-4 text-white/90 text-sm">
              <span className="flex items-center gap-1">
                <Users className="w-4 h-4" /> 1.2k members
              </span>
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-4 h-4" /> Verified Space
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <h2 className="font-display text-2xl font-bold text-miro-black mb-4">About this Space</h2>
            <p className="text-miro-slate text-lg mb-8 leading-relaxed">
              {space.description}
            </p>

            <h2 className="font-display text-2xl font-bold text-miro-black mb-6">What you'll get</h2>
            <ul className="space-y-4 mb-12">
              {benefits.map((benefit, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className="mt-1 flex-shrink-0 w-5 h-5 bg-miro-success/10 rounded-full flex items-center justify-center">
                    <Check className="w-3 h-3 text-miro-success" />
                  </div>
                  <span className="text-miro-black font-body">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Sidebar / Tiers */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              <h2 className="font-display text-xl font-bold text-miro-black mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-miro-yellow fill-miro-yellow" />
                Select a Tier
              </h2>
              
              {/* Tier 1 */}
              <div className="miro-card border-2 border-miro-blue bg-miro-blue/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-miro-blue text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg uppercase tracking-wider">
                  Most Popular
                </div>
                <h3 className="font-display text-lg font-bold text-miro-black mb-1">{space.tiers.tier1.name}</h3>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-3xl font-display font-bold text-miro-black">{space.tiers.tier1.price}</span>
                  <span className="text-miro-slate text-sm">Stars / {space.tiers.tier1.duration}</span>
                </div>
                <div className="text-miro-blue text-xs font-bold uppercase tracking-wider mb-2">
                  Use the Button below to subscribe
                </div>
              </div>

              {/* Tier 2 (if exists) */}
              {space.tiers.tier2 && (
                <div className="miro-card group hover:border-miro-blue transition-all">
                  <h3 className="font-display text-lg font-bold text-miro-black mb-1">{space.tiers.tier2.name}</h3>
                  <div className="flex items-baseline gap-1 mb-4">
                    <span className="text-2xl font-display font-bold text-miro-black">{space.tiers.tier2.price}</span>
                    <span className="text-miro-slate text-sm">Stars / {space.tiers.tier2.duration}</span>
                  </div>
                  <button className="miro-button-outline w-full hover:bg-miro-blue hover:text-white hover:border-miro-blue">
                    Select Plan
                  </button>
                </div>
              )}

              <p className="text-center text-xs text-miro-slate mt-4">
                Payments secured via Telegram Stars. <br />
                Cancel anytime within the app.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
