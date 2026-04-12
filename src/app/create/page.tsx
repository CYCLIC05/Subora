'use client';

import { Header } from "@/components/Header";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Rocket, 
  Image as ImageIcon, 
  Link as LinkIcon, 
  Type, 
  AlignLeft, 
  DollarSign, 
  Calendar,
  Zap,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import confetti from 'canvas-confetti';
import WebApp from "@twa-dev/sdk";
import { useEffect } from "react";

export default function CreateSpace() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Form, 2: Payment, 3: Success

  useEffect(() => {
    // Configure Main Button for Form submission
    if (step === 1) {
      try {
        WebApp.MainButton.setText("Review and List Space");
        WebApp.MainButton.show();
        const handleFormSubmit = () => {
          // Manual trigger for form validation check or just proceed if simple
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
        WebApp.MainButton.setText("Pay 99 Stars Now");
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
    tier1_name: 'Weekly Access',
    tier1_price: 99,
    tier1_duration: 'week',
    tier2_name: 'Monthly Access',
    tier2_price: 299,
    tier2_duration: 'month',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // In a real app, we would call an API to create a Telegram Invoice here.
    // For MVP/Demo, we simulate the transition to the payment step.
    setTimeout(() => {
      setStep(2);
      setLoading(false);
    }, 1000);
  };

  const handlePayListingFee = async () => {
    setLoading(true);
    
    // Simulate Telegram Stars Payment Flow
    // 1. WebApp.openInvoice(url) -> callback
    
    setTimeout(async () => {
      // On success: Save to Supabase (if configured)
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
        alert("Payment successful but we couldn't save your space. Please contact support.");
      } else {
        setStep(3);
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#5b76fe', '#f8db02', '#00b473']
        });
      }
      setLoading(false);
    }, 2000);
  };

  return (
    <main className="min-h-screen bg-[#f9f9fb] pb-20">
      <Header />
      
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {step === 1 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-8">
              <h1 className="text-3xl font-display font-bold text-miro-black mb-2">Create your Space</h1>
              <p className="text-miro-slate">Fill in the details below to list your private community.</p>
            </div>

            <form id="create-space-form" onSubmit={handleCreateRequest} className="space-y-6">
              {/* Basic Info Container */}
              <div className="miro-card space-y-4">
                <h2 className="font-display font-bold text-miro-black border-b border-miro-ring pb-3 mb-4">Basic Information</h2>
                
                <div>
                  <label className="text-xs font-bold text-miro-slate uppercase tracking-wider mb-1 block">Space Name</label>
                  <div className="relative">
                    <Type className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-miro-slate" />
                    <input
                      required
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="e.g. Alpha Trading Group"
                      className="w-full bg-white border border-miro-ring rounded-miro-sm py-3 pl-11 pr-4 focus:border-miro-blue outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-miro-slate uppercase tracking-wider mb-1 block">Description (Max 120 chars)</label>
                  <div className="relative">
                    <AlignLeft className="absolute left-4 top-3 w-4 h-4 text-miro-slate" />
                    <textarea
                      required
                      maxLength={120}
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="What makes your group special?"
                      className="w-full bg-white border border-miro-ring rounded-miro-sm py-3 pl-11 pr-4 focus:border-miro-blue outline-none transition-all min-h-[100px] resize-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-miro-slate uppercase tracking-wider mb-1 block">Cover Image URL</label>
                  <div className="relative">
                    <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-miro-slate" />
                    <input
                      required
                      name="cover_image"
                      value={formData.cover_image}
                      onChange={handleChange}
                      placeholder="https://example.com/image.jpg"
                      className="w-full bg-white border border-miro-ring rounded-miro-sm py-3 pl-11 pr-4 focus:border-miro-blue outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-miro-slate uppercase tracking-wider mb-1 block">Channel/Group Link</label>
                  <div className="relative">
                    <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-miro-slate" />
                    <input
                      required
                      name="channel_link"
                      value={formData.channel_link}
                      onChange={handleChange}
                      placeholder="@yourgroup"
                      className="w-full bg-white border border-miro-ring rounded-miro-sm py-3 pl-11 pr-4 focus:border-miro-blue outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Tiers Container */}
              <div className="miro-card space-y-4">
                <h2 className="font-display font-bold text-miro-black border-b border-miro-ring pb-3 mb-4">Subscription Tiers</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-[#f9f9fb] p-4 rounded-miro-md border border-miro-ring">
                    <span className="text-[10px] font-bold text-miro-blue mb-2 block uppercase">Tier 1 (Required)</span>
                    <input 
                      name="tier1_name" value={formData.tier1_name} onChange={handleChange}
                      className="w-full bg-white border border-miro-ring rounded-miro-sm px-3 py-2 text-sm mb-2" 
                      placeholder="Name" 
                    />
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <input 
                          type="number" name="tier1_price" value={formData.tier1_price} onChange={handleChange}
                          className="w-full bg-white border border-miro-ring rounded-miro-sm px-3 py-2 text-sm pl-7" 
                          placeholder="Stars" 
                        />
                        <DollarSign className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-miro-slate" />
                      </div>
                      <select 
                        name="tier1_duration" value={formData.tier1_duration} onChange={handleChange}
                        className="bg-white border border-miro-ring rounded-miro-sm px-2 py-2 text-xs"
                      >
                        <option value="week">/week</option>
                        <option value="month">/month</option>
                      </select>
                    </div>
                  </div>

                  <div className="bg-[#f9f9fb] p-4 rounded-miro-md border border-miro-ring">
                    <span className="text-[10px] font-bold text-miro-slate mb-2 block uppercase">Tier 2 (Optional)</span>
                    <input 
                      name="tier2_name" value={formData.tier2_name} onChange={handleChange}
                      className="w-full bg-white border border-miro-ring rounded-miro-sm px-3 py-2 text-sm mb-2" 
                      placeholder="Name" 
                    />
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <input 
                          type="number" name="tier2_price" value={formData.tier2_price} onChange={handleChange}
                          className="w-full bg-white border border-miro-ring rounded-miro-sm px-3 py-2 text-sm pl-7" 
                          placeholder="Stars" 
                        />
                        <DollarSign className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-miro-slate" />
                      </div>
                      <select 
                        name="tier2_duration" value={formData.tier2_duration} onChange={handleChange}
                        className="bg-white border border-miro-ring rounded-miro-sm px-2 py-2 text-xs"
                      >
                        <option value="week">/week</option>
                        <option value="month">/month</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 text-center">
                <p className="text-miro-slate text-xs font-bold uppercase tracking-wider">
                  Continue using the Telegram Button below
                </p>
              </div>
            </form>
          </div>
        )}

        {step === 2 && (
          <div className="animate-in zoom-in-95 fade-in duration-500 text-center py-12">
            <div className="w-20 h-20 bg-miro-yellow rounded-[24px] flex items-center justify-center mx-auto mb-6 transform rotate-6 border-4 border-white shadow-xl">
              <Zap className="w-10 h-10 text-miro-black fill-miro-black" />
            </div>
            <h2 className="text-3xl font-display font-bold text-miro-black mb-2">Final Step: Listing Fee</h2>
            <p className="text-miro-slate mb-8 px-4">
              To keep Subora premium and spam-free, we charge a one-time listing fee of <b>99 Stars</b>.
            </p>

            <div className="miro-card max-w-sm mx-auto mb-8 bg-miro-blue/5 border-2 border-miro-blue">
              <div className="flex justify-between items-center mb-4">
                <span className="text-miro-slate font-semibold">Listing Fee</span>
                <span className="text-2xl font-display font-bold text-miro-black">99 Stars</span>
              </div>
              <div className="text-left space-y-2 text-sm text-miro-slate">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-miro-success" /> Verified placement
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-miro-success" /> Lifetime listing
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-miro-success" /> Dashboard access
                </div>
              </div>
            </div>

            <div className="text-miro-slate text-sm font-bold uppercase tracking-wider mb-4">
              Click the button below to pay
            </div>
            
            <button 
              onClick={() => setStep(1)}
              className="mt-4 text-miro-slate text-sm font-semibold hover:text-miro-black"
            >
              Cancel and change details
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="animate-in zoom-in-95 fade-in duration-500 text-center py-12">
            <div className="w-24 h-24 bg-miro-success rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl shadow-miro-success/20">
              <CheckCircle2 className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-4xl font-display font-bold text-miro-black mb-4 tracking-tight">Payment Successful!</h2>
            <p className="text-miro-slate text-lg mb-10 max-w-md mx-auto">
              Welcome to the Subora ecosystem! Your space has been created and is now live on the Discover page.
            </p>

            <div className="space-y-4 max-w-xs mx-auto">
              <button
                onClick={() => router.push('/')}
                className="miro-button-primary w-full"
              >
                Back to Discover
              </button>
              <button
                onClick={() => router.push('/dashboard')}
                className="miro-button-outline w-full"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
