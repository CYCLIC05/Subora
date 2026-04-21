'use client';

import { useEffect, useState } from 'react';
import { Space, supabase } from '@/lib/supabase';
import { getUserSubscriptions } from '@/lib/mockApi';
import { Header } from '@/components/Header';
import { SpaceCard } from '@/components/SpaceCard';
import { Compass, Ghost, Loader2, Lock } from 'lucide-react';
import Link from 'next/link';

export default function SubscriptionsPage() {
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<number | null>(null);

  useEffect(() => {
    const initPage = async () => {
      try {
        const WebApp = (await import('@twa-dev/sdk')).default;
        const id = WebApp.initDataUnsafe.user?.id;
        if (id) {
          setUserId(id);
          const data = await getUserSubscriptions(id);
          setSpaces(data);
        }
      } catch (err) {
        console.error('Failed to init subscriptions page', err);
      } finally {
        setLoading(false);
      }
    };
    initPage();
  }, []);

  return (
    <main className="min-h-screen bg-background pb-32">
      <Header />
      
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <header className="mb-10 space-y-2">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Your Hub</p>
          <div className="flex items-center gap-3">
            <h1 className="text-4xl font-heading font-semibold text-slate-950 tracking-tight">My Subscriptions</h1>
            <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-primary/20">
              {spaces.length} Access Keys
            </div>
          </div>
          <p className="text-sm text-slate-500 max-w-xl leading-relaxed font-medium">
            Manage your access to premium Telegram communities and rejoin any private channel you've unlocked.
          </p>
        </header>

        {loading ? (
          <div className="h-[40vh] flex flex-col items-center justify-center space-y-4">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Verifying Access...</p>
          </div>
        ) : spaces.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {spaces.map((space) => (
              <div key={space.id} className="relative group">
                <SpaceCard space={space} />
                <div className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="bg-emerald-500 text-white p-2 rounded-full shadow-xl">
                    <Lock className="w-4 h-4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-20 text-center border-2 border-dashed border-slate-200 rounded-[40px] bg-white/50 space-y-6">
            <div className="mx-auto w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center">
              <Ghost className="w-8 h-8 text-slate-300" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-slate-950">No subscriptions found</h3>
              <p className="text-sm text-slate-500 max-w-xs mx-auto">
                You haven't joined any premium communities yet. Explore the discovery page to find your first space.
              </p>
            </div>
            <Link 
              href="/"
              className="inline-flex items-center gap-2 bg-slate-950 text-white px-6 py-3 rounded-2xl text-xs font-bold hover:bg-slate-900 transition-all active:scale-95 shadow-xl shadow-slate-950/10"
            >
              <Compass className="w-4 h-4" />
              Explore Discover
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
