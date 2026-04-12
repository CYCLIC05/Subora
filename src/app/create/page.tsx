'use client';

import { Header } from "@/components/Header";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Image as ImageIcon, 
  Link as LinkIcon, 
  Type, 
  AlignLeft, 
  DollarSign, 
  Calendar,
  CheckCircle2,
  Lock,
  ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import confetti from 'canvas-confetti';
import WebApp from "@twa-dev/sdk";
import { useEffect } from "react";
import { Input } from "@/components/ui/input";

export default function CreateSpace() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Form, 2: Payment, 3: Success

  useEffect(() => {
    if (step === 1) {
      try {
        WebApp.MainButton.setText("Review & Continue");
        WebApp.MainButton.show();
        const handleFormSubmit = () => {
          document.getElementById('create-space-form')?.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
        };
        WebApp.MainButton.onClick(handleFormSubmit);
        return () => {
          WebApp.MainButton.hide();
          WebApp.MainButton.offClick(handleFormSubmit);
        };
      } catch (e) {}
    } else if (step === 2) {
      try {
        WebApp.MainButton.setText("Pay 99 Stars");
        WebApp.MainButton.show();
        const handlePayment = () => {
          handlePayListingFee();
        };
        WebApp.MainButton.onClick(handlePayment);
        return () => {
          WebApp.MainButton.hide();
          WebApp.MainButton.offClick(handlePayment);
        };
      } catch (e) {}
    } else {
      try {
        WebApp.MainButton.hide();
      } catch (e) {}
    }
  }, [step]);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    cover_image: '',
    channel_link: '',
    tier1_name: 'Standard Access',
    tier1_price: 99,
    tier1_duration: 'week',
    tier2_name: 'Premium Access',
    tier2_price: 299,
    tier2_duration: 'month',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2);
  };

  const handlePayListingFee = async () => {
    setLoading(true);
    setTimeout(async () => {
      let error = null;
      if (supabase) {
        const { error: supabaseError } = await supabase
          .from('spaces')
          .insert([{
            name: formData.name,
            description: formData.description,
            cover_image: formData.cover_image,
            channel_link: formData.channel_link,
            tiers: {
              tier1: { name: formData.tier1_name, price: Number(formData.tier1_price), duration: formData.tier1_duration },
              tier2: { name: formData.tier2_name, price: Number(formData.tier2_price), duration: formData.tier2_duration }
            },
            creator_telegram_id: (window as any).Telegram?.WebApp?.initDataUnsafe?.user?.id || 0,
          }]);
        error = supabaseError;
      }

      if (error) {
        console.error("Error saving space:", error);
      } else {
        setStep(3);
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#000000', '#71717a', '#a1a1aa']
        });
      }
      setLoading(false);
    }, 1500);
  };

  return (
    <main className="min-h-screen bg-white pb-32">
      <Header />
      
      <div className="container mx-auto px-4 py-8 max-w-xl">
        {step === 1 && (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <header className="space-y-2">
              <h1 className="text-3xl font-heading font-semibold text-zinc-950 tracking-tight">Deployment</h1>
              <p className="text-sm text-zinc-500 font-medium leading-relaxed">Configuring your community for the Subora ecosystem.</p>
            </header>

            <form id="create-space-form" onSubmit={handleCreateRequest} className="space-y-10">
              <section className="space-y-6">
                <h2 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest border-b border-zinc-50 pb-2">Space Definition</h2>
                
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-900 ml-1">Identity</label>
                    <Input
                      required
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="e.g. Quantitative Insights"
                      className="h-11 rounded-xl border-zinc-100 bg-zinc-50/50 focus-visible:ring-zinc-200"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-900 ml-1">Abstract</label>
                    <textarea
                      required
                      maxLength={120}
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Define the primary value of your space..."
                      className="w-full h-24 rounded-xl border border-zinc-100 bg-zinc-50/50 p-3 text-sm focus:border-zinc-200 focus:outline-none transition-all placeholder:text-zinc-400"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-zinc-900 ml-1">Visual Asset URL</label>
                      <Input
                        required
                        name="cover_image"
                        value={formData.cover_image}
                        onChange={handleChange}
                        placeholder="https://..."
                        className="h-11 rounded-xl border-zinc-100 bg-zinc-50/50"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-zinc-900 ml-1">Terminal Link</label>
                      <Input
                        required
                        name="channel_link"
                        value={formData.channel_link}
                        onChange={handleChange}
                        placeholder="@channel"
                        className="h-11 rounded-xl border-zinc-100 bg-zinc-50/50"
                      />
                    </div>
                  </div>
                </div>
              </section>

              <section className="space-y-6">
                <h2 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest border-b border-zinc-50 pb-2">Subscription Logic</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-5 rounded-2xl bg-zinc-50/50 border border-zinc-100 space-y-4">
                    <p className="text-[10px] font-bold text-zinc-900 uppercase tracking-widest leading-none">Standard Tier</p>
                    <div className="space-y-3">
                      <Input 
                        name="tier1_name" value={formData.tier1_name} onChange={handleChange}
                        className="h-9 rounded-lg bg-white border-zinc-100 text-xs font-semibold" 
                        placeholder="Label" 
                      />
                      <div className="flex gap-2">
                        <Input 
                          type="number" name="tier1_price" value={formData.tier1_price} onChange={handleChange}
                          className="h-9 rounded-lg bg-white border-zinc-100 text-xs font-bold" 
                          placeholder="Price" 
                        />
                        <select 
                          name="tier1_duration" value={formData.tier1_duration} onChange={handleChange}
                          className="h-9 px-2 rounded-lg bg-white border border-zinc-100 text-[10px] font-bold uppercase"
                        >
                          <option value="week">Weekly</option>
                          <option value="month">Monthly</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl border border-zinc-100 space-y-4">
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest leading-none">Premium Extension</p>
                    <div className="space-y-3 opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all">
                      <Input 
                        name="tier2_name" value={formData.tier2_name} onChange={handleChange}
                        className="h-9 rounded-lg bg-white border-zinc-100 text-xs font-semibold" 
                        placeholder="Label" 
                      />
                      <div className="flex gap-2">
                        <Input 
                          type="number" name="tier2_price" value={formData.tier2_price} onChange={handleChange}
                          className="h-9 rounded-lg bg-white border-zinc-100 text-xs font-bold" 
                          placeholder="Price" 
                        />
                        <select 
                          name="tier2_duration" value={formData.tier2_duration} onChange={handleChange}
                          className="h-9 px-2 rounded-lg bg-white border border-zinc-100 text-[10px] font-bold uppercase"
                        >
                          <option value="week">Weekly</option>
                          <option value="month">Monthly</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <footer className="pt-6 text-center">
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em] animate-pulse">
                  System configuration in progress
                </p>
              </footer>
            </form>
          </div>
        )}

        {step === 2 && (
          <div className="animate-in zoom-in-95 fade-in duration-500 py-12 space-y-10">
            <header className="text-center space-y-2">
              <h2 className="text-3xl font-heading font-semibold text-zinc-950 tracking-tight">Security Deposit</h2>
              <p className="text-sm text-zinc-500 font-medium">Anti-spam verification fee for the Subora ecosystem.</p>
            </header>

            <div className="p-8 rounded-[32px] bg-zinc-900 text-white shadow-2xl shadow-zinc-950/20 max-w-sm mx-auto space-y-8">
              <div className="flex justify-between items-center border-b border-white/10 pb-6">
                <span className="text-xs font-bold uppercase tracking-widest opacity-60">Verification Fee</span>
                <span className="text-3xl font-heading font-bold tracking-tight">99 Stars</span>
              </div>
              
              <ul className="space-y-4">
                {[
                  "Verified placement on Discover",
                  "Creator indexing",
                  "Revenue management terminal access"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-xs font-medium opacity-80">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    {item}
                  </li>
                ))}
              </ul>

              <div className="pt-4 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest opacity-40">
                <Lock className="w-3 h-3" />
                Encrypted via Telegram
              </div>
            </div>

            <div className="text-center">
               <button 
                onClick={() => setStep(1)}
                className="text-xs font-bold text-zinc-400 hover:text-zinc-900 transition-colors uppercase tracking-widest"
              >
                Modify configuration
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="animate-in zoom-in-95 fade-in duration-500 text-center py-20 space-y-10">
            <div className="flex justify-center">
              <div className="w-20 h-20 rounded-full bg-zinc-900 flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10 text-white" />
              </div>
            </div>
            
            <header className="space-y-2">
              <h2 className="text-4xl font-heading font-semibold text-zinc-950 tracking-tight">Authorized.</h2>
              <p className="text-zinc-500 font-medium max-w-xs mx-auto">Your community is now successfully indexed within the ecosystem.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-xs mx-auto">
              <button
                onClick={() => router.push('/')}
                className="h-11 px-6 rounded-xl border border-zinc-100 text-xs font-bold text-zinc-900 hover:bg-zinc-50 transition-all"
              >
                Discovery
              </button>
              <button
                onClick={() => router.push('/dashboard')}
                className="h-11 px-6 rounded-xl bg-zinc-900 text-white text-xs font-bold hover:bg-zinc-800 transition-all shadow-lg shadow-zinc-950/20"
              >
                Management
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
