'use client';

import Link from 'next/link';
import { Header } from "@/components/Header";
import { useCallback, useEffect, useState } from "react";
import confetti from 'canvas-confetti';
import { Input } from "@/components/ui/input";
import { CelebrationModal } from "@/components/CelebrationModal";
import { Space } from "@/lib/supabase";
import { X, ChevronRight, Wallet, ShieldCheck, Rocket, Globe, Zap, Plus } from "lucide-react";

export default function CreateSpace() {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Form, 2: Payment, 3: Success

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    cover_image: '',
    channel_link: '',
    creator_name: '',
    category: 'Crypto Alpha',
    payment_address: '',
    referrer_payment_address: '',
  });

  const [createdSpace, setCreatedSpace] = useState<Partial<Space> | null>(null);
  const [isCelebrationOpen, setIsCelebrationOpen] = useState(false);

  const [isVerified, setIsVerified] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [verifySuccess, setVerifySuccess] = useState<string | null>(null);

  const [telegramUser, setTelegramUser] = useState<any>(null);
  const [ownedChannels, setOwnedChannels] = useState<{chat_id: string, chat_title: string}[]>([]);
  const [loadingChannels, setLoadingChannels] = useState(false);
  const [showManualInput, setShowManualInput] = useState(false);

  useEffect(() => {
    const initTg = async () => {
      try {
        const WebApp = (await import('@twa-dev/sdk')).default;
        const user = WebApp.initDataUnsafe?.user;
        if (user) {
          setTelegramUser(user);
          setLoadingChannels(true);
          try {
            const res = await fetch(`/api/creator/channels?telegram_id=${user.id}`);
            const data = await res.json();
            if (data.channels && data.channels.length > 0) {
              setOwnedChannels(data.channels);
              setFormData(prev => ({ ...prev, channel_link: data.channels[0].chat_id }));
              // We'll auto-verify if it's already in our creator_channels table
              handleVerifyConnection(data.channels[0].chat_id);
            } else {
              setShowManualInput(true);
            }
          } catch (e) {
            setShowManualInput(true);
          } finally {
            setLoadingChannels(false);
          }
        } else {
          setShowManualInput(true);
        }
      } catch (e) {}
    };
    initTg();
  }, []);

  const [tiers, setTiers] = useState([
    { name: 'Standard Access', price: 99, duration: 'week', currency: 'TON' },
  ]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleVerifyConnection = async (specificId?: string) => {
    const linkToVerify = specificId || formData.channel_link;
    if (!linkToVerify) return;
    
    setVerifying(true);
    setVerifyError(null);
    setVerifySuccess(null);
    try {
      const res = await fetch('/api/telegram/verify-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channelLink: linkToVerify })
      });
      const data = await res.json();
      if (data.success) {
        setIsVerified(true);
        setVerifySuccess(data.message);
        setFormData(prev => ({
          ...prev,
          channel_link: linkToVerify,
          name: data.chatTitle || prev.name,
          description: data.chatDescription || prev.description,
          cover_image: data.chatPhoto || prev.cover_image,
          creator_name: prev.creator_name || `by ${telegramUser?.first_name || 'Admin'}`
        }));
      } else {
        setIsVerified(false);
        setVerifyError(data.error);
      }
    } catch (err) {
      setVerifyError('Verification failed.');
    } finally {
      setVerifying(false);
    }
  };

  const handleHaptic = async () => {
    try {
      const WebApp = (await import('@twa-dev/sdk')).default
      WebApp.HapticFeedback.impactOccurred('light')
    } catch (error) {
      console.warn('Haptic feedback unavailable', error)
    }
  };

  const handleTierChange = (index: number, field: 'name' | 'price' | 'duration' | 'currency', value: string) => {
    setTiers((current) =>
      current.map((tier, tierIndex) =>
        tierIndex === index
          ? { ...tier, [field]: field === 'price' ? Number(value) : value }
          : tier
      )
    );
  };

  const handlePayListingFee = useCallback(async () => {
    setLoading(true);
    try {
      const telegramId = window.Telegram?.WebApp?.initDataUnsafe?.user?.id ?? 0
      const creatorReferrer = localStorage.getItem('creator_referrer') || undefined;

      const payload = {
        ...formData,
        tiers,
        creator_telegram_id: telegramId,
        referrer_payment_address: creatorReferrer || formData.referrer_payment_address,
      }

      const response = await fetch('/api/spaces', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        setStep(3)
        confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } })
        setCreatedSpace({ id: 'pending', ...formData })
        setIsCelebrationOpen(true)
      } else {
        const result = await response.json();
        alert(result.error || 'Failed to create space.');
      }
    } catch (error) {
      console.error('Error saving space:', error)
    } finally {
      setLoading(false)
    }
  }, [formData, tiers]);

  useEffect(() => {
    let cleanup = () => {}
    const initMainButton = async () => {
      try {
        const WebApp = (await import('@twa-dev/sdk')).default
        if (step === 1 && isVerified && formData.payment_address) {
          WebApp.MainButton.setText('Launch Space')
          WebApp.MainButton.show()
          WebApp.MainButton.onClick(handlePayListingFee)
          cleanup = () => {
            WebApp.MainButton.offClick?.(handlePayListingFee)
            WebApp.MainButton.hide?.()
          }
        } else {
          WebApp.MainButton.hide?.()
        }
      } catch (e) {}
    }
    initMainButton()
    return () => cleanup()
  }, [step, isVerified, formData.payment_address, handlePayListingFee])

  return (
    <main className="min-h-screen bg-white">
      <Header />
      
      <CelebrationModal 
        isOpen={isCelebrationOpen} 
        onClose={() => setIsCelebrationOpen(false)} 
        space={createdSpace || { name: formData.name }} 
      />

      <div className="max-w-md mx-auto px-6 py-8">
        {step === 1 && (
          <div className="space-y-10">
            <header className="space-y-1">
              <h1 className="text-3xl font-heading font-bold text-slate-950 tracking-tight">Launch Space</h1>
              <p className="text-sm text-slate-500 font-medium">Monetize your Telegram in seconds.</p>
            </header>

            <div className="space-y-8">
              {/* Step 1: Connect */}
              <section className="space-y-4">
                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">1</div>
                  <span>Select Channel</span>
                </div>

                <div className={`p-5 rounded-3xl border-2 transition-all duration-300 ${isVerified ? 'border-emerald-500 bg-emerald-50/30' : 'border-slate-100 bg-slate-50/50'}`}>
                  {loadingChannels ? (
                    <div className="flex items-center gap-3 animate-pulse">
                      <div className="w-10 h-10 rounded-full bg-slate-200" />
                      <div className="h-4 w-32 bg-slate-200 rounded" />
                    </div>
                  ) : ownedChannels.length > 0 && !showManualInput ? (
                    <select 
                      name="channel_link"
                      value={formData.channel_link}
                      onChange={(e) => {
                        handleChange(e);
                        handleVerifyConnection(e.target.value);
                      }}
                      className="w-full bg-transparent text-sm font-bold focus:outline-none appearance-none cursor-pointer"
                    >
                      {ownedChannels.map(ch => (
                        <option key={ch.chat_id} value={ch.chat_id}>{ch.chat_title}</option>
                      ))}
                    </select>
                  ) : (
                    <div className="space-y-3">
                      <Input
                        name="channel_link"
                        value={formData.channel_link}
                        onChange={handleChange}
                        onBlur={() => handleVerifyConnection()}
                        placeholder="@channel_username"
                        className="h-10 bg-white rounded-xl border-slate-200 shadow-none text-sm font-bold"
                      />
                      <button 
                        onClick={() => handleVerifyConnection()}
                        className="w-full h-10 rounded-xl bg-slate-950 text-white text-xs font-bold transition-all active:scale-95"
                      >
                        {verifying ? 'Syncing...' : 'Sync Metadata'}
                      </button>
                    </div>
                  )}

                  {isVerified && (
                    <div className="mt-4 pt-4 border-t border-emerald-100 flex items-center gap-3">
                      {formData.cover_image && (
                        <img src={formData.cover_image} className="w-10 h-10 rounded-full object-cover" alt="" />
                      )}
                      <div>
                        <p className="text-xs font-bold text-slate-900">{formData.name}</p>
                        <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">Live & Synced</p>
                      </div>
                    </div>
                  )}
                </div>
                
                {verifyError && (
                  <div className="mt-3 p-4 rounded-2xl bg-rose-50 border border-rose-100 space-y-3 animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-start gap-2">
                      <X className="w-3 h-3 text-rose-500 mt-0.5" />
                      <p className="text-[10px] font-bold text-rose-600 leading-tight">
                        {verifyError}
                      </p>
                    </div>
                    
                    <div className="space-y-2 pt-2 border-t border-rose-100">
                      <p className="text-[9px] font-bold text-slate-500 uppercase tracking-tight">Quick Solution:</p>
                      <ul className="text-[10px] text-slate-600 font-medium space-y-1.5 ml-1">
                        <li className="flex items-center gap-2">
                          <div className="w-1 h-1 rounded-full bg-rose-400" />
                          <span>Add <span className="font-bold text-slate-900">@SuboraBot</span> as an Admin</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-1 h-1 rounded-full bg-rose-400" />
                          <span>Enable <span className="font-bold text-slate-900">"Invite Users"</span> permission</span>
                        </li>
                      </ul>
                      
                      <a 
                        href="https://t.me/SuboraBot?startchannel=true"
                        target="_blank"
                        onClick={handleHaptic}
                        className="flex items-center justify-center gap-2 w-full h-10 mt-2 rounded-xl bg-slate-900 text-white text-[10px] font-bold transition-all hover:bg-black active:scale-95"
                      >
                        <Plus className="w-3 h-3" />
                        Add Bot to Channel
                      </a>
                    </div>
                  </div>
                )}
              </section>

              {/* Step 2: Economics */}
              <section className={`space-y-4 transition-opacity duration-500 ${isVerified ? 'opacity-100' : 'opacity-30 pointer-events-none'}`}>
                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">2</div>
                  <span>Economics</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">Price (Weekly)</label>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900">TON</span>
                      <input 
                        type="number"
                        value={tiers[0].price}
                        onChange={(e) => handleTierChange(0, 'price', e.target.value)}
                        className="w-full bg-transparent text-lg font-bold text-slate-950 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">Market Category</label>
                    <select 
                      name="category"
                      value={formData.category}
                      onChange={handleChange as any}
                      className="w-full bg-transparent text-sm font-bold text-slate-950 focus:outline-none cursor-pointer"
                    >
                      <option>Crypto Alpha</option>
                      <option>Trading</option>
                      <option>Technical</option>
                      <option>Lifestyle</option>
                    </select>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                  <div className="flex justify-between">
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">Your Payout Wallet</label>
                    <span className="text-[9px] font-bold text-primary animate-pulse">Required</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Wallet className="w-4 h-4 text-slate-400" />
                    <input 
                      required
                      name="payment_address"
                      value={formData.payment_address}
                      onChange={handleChange}
                      placeholder="UQ... or EQ..."
                      className="w-full bg-transparent text-xs font-mono font-bold text-slate-950 focus:outline-none"
                    />
                  </div>
                </div>
              </section>

              {/* Step 3: Launch */}
              {isVerified && formData.payment_address && (
                <section className="pt-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <button 
                    onClick={handlePayListingFee}
                    disabled={loading}
                    className="w-full h-14 rounded-2xl bg-slate-950 text-white font-bold text-sm shadow-xl shadow-slate-200 flex items-center justify-center gap-2 hover:bg-slate-900 transition-all active:scale-95"
                  >
                    {loading ? (
                      <Zap className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <Rocket className="w-5 h-5" />
                        <span>Launch & Monetize</span>
                      </>
                    )}
                  </button>
                  <p className="mt-4 text-[10px] text-center text-slate-400 font-medium px-6 leading-relaxed">
                    By launching, you agree to Subora's 7% ecosystem fee. Your metadata will be synced 24/7 from Telegram.
                  </p>
                </section>
              )}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="text-center py-20 space-y-10">
            <div className="flex justify-center">
              <div className="w-20 h-20 rounded-full bg-emerald-500 flex items-center justify-center shadow-xl shadow-emerald-100 animate-bounce">
                <ShieldCheck className="w-10 h-10 text-white" />
              </div>
            </div>
            
            <div className="space-y-3">
              <h2 className="text-4xl font-heading font-bold text-slate-950 tracking-tight">Space Live.</h2>
              <p className="text-slate-500 font-medium px-4">Your community is now indexed in the Global Discovery Mall.</p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-6">
              <Link
                href="/"
                className="h-12 rounded-xl border border-slate-200 flex items-center justify-center gap-2 text-xs font-bold text-slate-900 hover:bg-slate-50 transition-all"
              >
                <Globe className="w-4 h-4" />
                Discovery
              </Link>
              <Link
                href="/dashboard"
                className="h-12 rounded-xl bg-slate-950 flex items-center justify-center gap-2 text-xs font-bold text-white hover:bg-slate-900 transition-all shadow-lg shadow-slate-200"
              >
                <Zap className="w-4 h-4" />
                Dashboard
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
