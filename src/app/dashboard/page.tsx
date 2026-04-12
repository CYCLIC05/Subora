'use client';

import { Header } from "@/components/Header";
import { SpaceCard } from "@/components/SpaceCard";
import { Space } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { ArrowUpRight, Plus, ExternalLink } from "lucide-react";
import Link from "next/link";
import WebApp from "@twa-dev/sdk";
import { RevenueAnalytics } from "@/components/RevenueAnalytics";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Dashboard() {
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [loading, setLoading] = useState(true);

  const handleHaptic = () => {
    try {
      WebApp.HapticFeedback.impactOccurred('light');
    } catch (e) {}
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setSpaces([
        {
          id: '1',
          creator_telegram_id: 123,
          name: 'Growth Alpha Group',
          description: 'Exclusive signals and growth strategies for upcoming projects.',
          cover_image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80',
          channel_link: '@growthalpha',
          tiers: {
            tier1: { name: 'Weekly Access', price: 99, duration: 'week' },
            tier2: { name: 'Monthly Access', price: 299, duration: 'month' },
          },
          created_at: new Date().toISOString(),
        }
      ]);
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const stats = [
    { name: 'Active Subscriptions', value: '1,248', delta: '+12%' },
    { name: 'Current Cycle Revenue', value: '12.4k Stars', delta: '+8%' },
    { name: 'Average Subscription LTV', value: '450 Stars', delta: '+2%' },
  ];

  return (
    <main className="min-h-screen bg-white pb-32">
      <Header />
      
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="space-y-1">
            <h1 className="text-3xl font-heading font-semibold text-zinc-950 tracking-tight">Management</h1>
            <p className="text-sm text-zinc-500 font-medium">Overview of your community ecosystems and financial performance.</p>
          </div>
          
          <Link 
            href="/create"
            onClick={handleHaptic}
            className="inline-flex items-center justify-center gap-2 h-11 px-6 rounded-xl bg-zinc-900 text-white text-sm font-semibold hover:bg-zinc-800 transition-all active:scale-95 shadow-lg shadow-zinc-950/10"
          >
            <Plus className="w-4 h-4" />
            New Space
          </Link>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {stats.map((stat, i) => (
            <div key={i} className="p-6 rounded-2xl border border-zinc-100 bg-white shadow-sm space-y-2">
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest leading-none">{stat.name}</p>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-heading font-bold text-zinc-950">{stat.value}</p>
                <span className="text-xs font-bold text-emerald-600">{stat.delta}</span>
              </div>
            </div>
          ))}
        </div>

        <Tabs defaultValue="overview" className="space-y-8">
          <TabsList className="bg-zinc-100/50 p-1 h-11 rounded-xl">
            <TabsTrigger value="overview" className="rounded-lg px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm">Overview</TabsTrigger>
            <TabsTrigger value="analytics" className="rounded-lg px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm">Analytics</TabsTrigger>
            <TabsTrigger value="members" className="rounded-lg px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm">Members</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-8 mt-0 focus-visible:outline-none">
            <RevenueAnalytics />
            
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-zinc-900 uppercase tracking-widest">Active Spaces</h2>
              </div>
              
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[1].map(i => <div key={i} className="h-64 bg-zinc-50 animate-pulse rounded-2xl" />)}
                </div>
              ) : spaces.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {spaces.map((space) => (
                    <div key={space.id} className="group relative">
                      <SpaceCard space={space} />
                      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link href={space.channel_link} className="bg-white shadow-md p-2 rounded-full text-zinc-900 hover:text-zinc-600">
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-20 text-center border-2 border-dashed border-zinc-100 rounded-3xl">
                  <p className="text-sm text-zinc-400 font-medium font-heading">No active spaces found</p>
                </div>
              )}
            </section>
          </TabsContent>

          <TabsContent value="analytics" className="mt-0">
             <div className="p-12 text-center border border-zinc-100 rounded-3xl bg-zinc-50/50">
               <p className="text-sm text-zinc-500 font-medium">Detailed demographic and retention reports are processing.</p>
             </div>
          </TabsContent>
          
          <TabsContent value="members" className="mt-0">
             <div className="p-12 text-center border border-zinc-100 rounded-3xl bg-zinc-50/50">
               <p className="text-sm text-zinc-500 font-medium">Subscriber index loading...</p>
             </div>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
