'use client';

import { Header } from "@/components/Header";
import { SpaceCard } from "@/components/SpaceCard";
import { Space } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { Plus, BarChart3, Users, Star, ArrowUpRight, Rocket } from "lucide-react";
import Link from "next/link";
import WebApp from "@twa-dev/sdk";

export default function Dashboard() {
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [loading, setLoading] = useState(true);

  const handleHaptic = () => {
    try {
      WebApp.HapticFeedback.impactOccurred('light');
    } catch (e) {}
  };

  useEffect(() => {
    // Simulate fetching user's spaces
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
    { name: 'Total Spaces', value: '1', icon: Star, color: 'bg-miro-blue' },
    { name: 'Total Revenue', value: '4.2k Stars', icon: BarChart3, color: 'bg-miro-success' },
    { name: 'Active Members', value: '1,248', icon: Users, color: 'bg-miro-yellow' },
  ];

  return (
    <main className="min-h-screen bg-[#f9f9fb] pb-20">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-3xl font-display font-bold text-miro-black mb-1 tracking-tight">Creator Dashboard</h1>
            <p className="text-miro-slate">Manage your spaces and track your subscription revenue.</p>
          </div>
          
          <Link 
            href="/create"
            onClick={handleHaptic}
            className="miro-button-primary flex items-center justify-center gap-2 shadow-lg shadow-miro-blue/20 px-8"
          >
            <Plus className="w-5 h-5" />
            Create New Space
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {stats.map((stat, i) => (
            <div key={i} className="miro-card flex items-center gap-4">
              <div className={`p-3 rounded-miro-md ${stat.color} text-white`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-miro-slate uppercase tracking-wider">{stat.name}</p>
                <p className="text-2xl font-display font-bold text-miro-black">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* My Spaces List */}
        <section>
          <div className="flex items-center justify-between mb-6 border-b border-miro-ring pb-4">
            <h2 className="font-display text-xl font-bold text-miro-black">Your Spaces</h2>
          </div>
          
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
              {[1].map(i => <div key={i} className="h-[300px] bg-miro-border/10 rounded-miro-md" />)}
            </div>
          ) : spaces.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {spaces.map((space) => (
                <div key={space.id} className="relative group">
                  <SpaceCard space={space} />
                  <div className="absolute top-4 right-10 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="bg-white/80 backdrop-blur shadow-sm p-2 rounded-lg hover:bg-white text-miro-blue">
                      <ArrowUpRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="miro-card text-center py-20 bg-white shadow-none border-dashed border-2 border-miro-ring">
              <div className="w-16 h-16 bg-miro-slate/5 rounded-full flex items-center justify-center mx-auto mb-4">
                <Rocket className="w-8 h-8 text-miro-slate opacity-20" />
              </div>
              <h3 className="text-lg font-display font-bold text-miro-black mb-2">No Spaces yet</h3>
              <p className="text-miro-slate mb-8">Ready to start earning with your community?</p>
              <Link 
                href="/create"
                className="miro-button-outline inline-flex items-center gap-2 hover:bg-miro-blue hover:text-white"
              >
                Create your first Space
              </Link>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
