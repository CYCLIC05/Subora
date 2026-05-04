'use client';

import Link from 'next/link';
import { Header } from "@/components/Header";
import { useCallback, useEffect, useState } from "react";
import confetti from 'canvas-confetti';
import { Input } from "@/components/ui/input";
import { CelebrationModal } from "@/components/CelebrationModal";
import { Space } from "@/lib/supabase";
import { X, ChevronRight, Wallet, ShieldCheck, Rocket, Globe, Zap, Plus, Wand2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useWallet } from "@/components/WalletProvider";
import { TonConnectButton } from '@tonconnect/ui-react';

export default function CreateSpace() {
  const { walletAddress } = useWallet();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Form, 3: Success

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    cover_image: '',
    channel_link: '',
    creator_name: '',
    category: 'Crypto Alpha',
    referrer_payment_address: '',
  });

  const [createdSpace, setCreatedSpace] = useState<Partial<Space> | null>(null);
  const [isCelebrationOpen, setIsCelebrationOpen] = useState(false);

  const [isVerified, setIsVerified] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);

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

  const spaceTemplates = [
    { id: 'alpha', label: 'Crypto Alpha', category: 'Crypto Alpha', price: 50, currency: 'TON', duration: 'month' },
    { id: 'trading', label: 'Pro Trading', category: 'Trading', price: 150, currency: 'TON', duration: 'month' },
    { id: 'free', label: 'Free Community', category: 'Technical', price: 0, currency: 'TON', duration: 'forever' }
  ];

  const applyTemplate = (t: typeof spaceTemplates[0]) => {
    setFormData(prev => ({ ...prev, category: t.category }));
    setTiers([{ name: 'Standard Access', price: t.price, duration: t.duration, currency: t.currency }]);
    toast.success(`Applied ${t.label} template!`);
    handleHaptic();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleVerifyConnection = async (specificId?: string) => {
    const linkToVerify = specificId || formData.channel_link;
    if (!linkToVerify) return;
    
    setVerifying(true);
    setVerifyError(null);
    try {
      const res = await fetch('/api/telegram/verify-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channelLink: linkToVerify })
      });
      const data = await res.json();
      if (data.success) {
        setIsVerified(true);
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
    } catch (error) {}
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
    if (!walletAddress) {
      toast.error('Please connect your wallet first.');
      return;
    }

    setLoading(true);
    try {
      const telegramId = window.Telegram?.WebApp?.initDataUnsafe?.user?.id ?? 0
      const creatorReferrer = localStorage.getItem('creator_referrer') || undefined;

      const payload = {
        ...formData,
        payment_address: walletAddress,
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
        toast.error(result.error || 'Failed to create space.');
      }
    } catch (error) {
      console.error('Error saving space:', error)
      toast.error('Something went wrong.');
    } finally {
      setLoading(false)
    }
  }, [formData, tiers, walletAddress]);

  useEffect(() => {
    let cleanup = () => {}
    const initMainButton = async () => {
      try {
        const WebApp = (await import('@twa-dev/sdk')).default
        if (step === 1 && isVerified && walletAddress) {
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
  }, [step, isVerified, walletAddress, handlePayListingFee])

  const getDurationLabel = (duration: string) => {
    switch (duration) {
      case 'week': return 'Weekly';
      case 'month': return 'Monthly';
      case 'forever': return 'Lifetime';
      default: return 'Custom';
    }
  };

  const currentDurationLabel = getDurationLabel(tiers[0].duration);

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
      <Header />
      
      <CelebrationModal 
        isOpen={isCelebrationOpen} 
        onClose={() => setIsCelebrationOpen(false)} 
        space={createdSpace || { name: formData.name }} 
      />

      <div className="max-w-md mx-auto px-4 py-6">
        {step === 1 && (
          <div className="space-y-6">
            <header className="space-y-1.5 px-2">
              <h1 className="text-3xl font-heading font-bold text-slate-950 dark:text-white tracking-tight">Launch Space</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Monetize your Telegram instantly.</p>
            </header>

            <div className="space-y-5">
              {/* Channel Selection Card */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
                <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4">Target Channel</h3>
                
                {loadingChannels ? (
                  <div className="flex items-center gap-3 animate-pulse">
                    <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800" />
                    <div className="h-4 w-32 bg-slate-200 dark:bg-slate-800 rounded" />
                  </div>
                ) : ownedChannels.length > 0 && !showManualInput ? (
                  <div className="relative">
                    <select 
                      name="channel_link"
                      value={formData.channel_link}
                      onChange={(e) => {
                        handleChange(e);
                        handleVerifyConnection(e.target.value);
                      }}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl h-12 px-4 text-sm font-bold focus:outline-none appearance-none cursor-pointer"
                    >
                      {ownedChannels.map(ch => (
                        <option key={ch.chat_id} value={ch.chat_id}>{ch.chat_title}</option>
                      ))}
                    </select>
                    <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 rotate-90" />
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Input
                      name="channel_link"
                      value={formData.channel_link}
                      onChange={handleChange}
                      onBlur={() => handleVerifyConnection()}
                      placeholder="@channel_username"
                      className="h-12 bg-slate-50 dark:bg-slate-950 rounded-xl border-slate-200 dark:border-slate-800 shadow-none text-sm font-bold"
                    />
                    <button 
                      onClick={() => handleVerifyConnection()}
                      className="w-full h-10 rounded-xl bg-slate-950 dark:bg-white text-white dark:text-slate-900 text-xs font-bold transition-all active:scale-95"
                    >
                      {verifying ? 'Syncing...' : 'Sync Metadata'}
                    </button>
                  </div>
                )}

                {isVerified && (
                  <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-3">
                    {formData.cover_image && (
                      <img src={formData.cover_image} className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700" alt="" />
                    )}
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight">{formData.name}</p>
                      <p className="text-[10px] text-emerald-600 dark:text-emerald-500 font-bold uppercase tracking-wider flex items-center gap-1 mt-0.5">
                        <CheckCircle2 className="w-3 h-3" /> Live & Synced
                      </p>
                    </div>
                  </div>
                )}

                {verifyError && (
                  <div className="mt-4 p-4 rounded-2xl bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 space-y-3 animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-start gap-2">
                      <X className="w-4 h-4 text-rose-500 mt-0.5 shrink-0" />
                      <p className="text-[11px] font-bold text-rose-600 dark:text-rose-400 leading-tight">
                        {verifyError}
                      </p>
                    </div>
                    
                    <div className="space-y-3 pt-3 border-t border-rose-100 dark:border-rose-500/20">
                      <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-tight">Action Required:</p>
                      <ul className="text-[11px] text-slate-600 dark:text-slate-300 font-medium space-y-2 ml-1">
                        <li className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0" />
                          <span>Add <span className="font-bold text-slate-900 dark:text-white">@SuboraBot</span> as an Admin</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0" />
                          <span>Enable <span className="font-bold text-slate-900 dark:text-white">"Invite Users"</span> permission</span>
                        </li>
                      </ul>
                      
                      <a 
                        href="https://t.me/SuboraBot?startchannel=true"
                        target="_blank"
                        onClick={handleHaptic}
                        className="flex items-center justify-center gap-2 w-full h-11 mt-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold transition-all hover:bg-black active:scale-95 shadow-sm"
                      >
                        <Plus className="w-4 h-4" />
                        Add Bot to Channel
                      </a>
                    </div>
                  </div>
                )}
              </div>

              {/* Economics Card */}
              <div className={`bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm transition-opacity duration-500 ${isVerified ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
                <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4">Economics</h3>

                <div className="mb-5 space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                    <Wand2 className="w-3 h-3" /> Templates
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    {spaceTemplates.map(t => (
                      <button
                        key={t.id}
                        onClick={() => applyTemplate(t)}
                        className={`px-2 py-3 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all active:scale-95 ${formData.category === t.category && tiers[0].price === t.price ? 'bg-slate-950 dark:bg-white border-slate-950 dark:border-white text-white dark:text-slate-900' : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'}`}
                      >
                        <span className="text-[10px] font-bold leading-tight text-center">{t.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-tight block mb-1">
                      Price ({currentDurationLabel})
                    </label>
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-bold text-slate-900 dark:text-white">TON</span>
                      <input 
                        type="number"
                        value={tiers[0].price}
                        onChange={(e) => handleTierChange(0, 'price', e.target.value)}
                        className="w-full bg-transparent text-lg font-bold text-slate-950 dark:text-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-tight block mb-1">Category</label>
                    <select 
                      name="category"
                      value={formData.category}
                      onChange={handleChange as any}
                      className="w-full h-7 bg-transparent text-sm font-bold text-slate-950 dark:text-white focus:outline-none cursor-pointer"
                    >
                      <option>Crypto Alpha</option>
                      <option>Trading</option>
                      <option>Technical</option>
                      <option>Lifestyle</option>
                    </select>
                  </div>
                </div>

                {/* Connected Wallet Section */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">Payout Wallet</label>
                    {!walletAddress && <span className="text-[9px] font-bold text-rose-500 animate-pulse">Required</span>}
                  </div>
                  
                  {walletAddress ? (
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center shrink-0">
                        <Wallet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {walletAddress.slice(0, 8)}...{walletAddress.slice(-6)}
                        </p>
                        <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider">Connected</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center p-4 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 gap-3">
                      <p className="text-xs font-medium text-slate-500 dark:text-slate-400 text-center">Connect a wallet to receive your subscription payouts.</p>
                      <TonConnectButton />
                    </div>
                  )}
                </div>
              </div>

              {/* Launch Step */}
              {isVerified && walletAddress && (
                <div className="pt-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <button 
                    onClick={handlePayListingFee}
                    disabled={loading}
                    className="w-full h-14 rounded-2xl bg-slate-950 dark:bg-white text-white dark:text-slate-900 font-bold text-sm shadow-xl shadow-slate-200/50 dark:shadow-none flex items-center justify-center gap-2 hover:scale-[0.98] transition-all"
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
                </div>
              )}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="text-center py-24 space-y-10 animate-in zoom-in-95 duration-500">
            <div className="flex justify-center">
              <div className="w-24 h-24 rounded-full bg-emerald-500 flex items-center justify-center shadow-2xl shadow-emerald-500/20 animate-bounce">
                <ShieldCheck className="w-12 h-12 text-white" />
              </div>
            </div>
            
            <div className="space-y-3">
              <h2 className="text-4xl font-heading font-bold text-slate-950 dark:text-white tracking-tight">Space Live.</h2>
              <p className="text-slate-500 dark:text-slate-400 font-medium px-4 text-sm leading-relaxed">Your community is now securely indexed and actively monetizing in the Subora Mall.</p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-8">
              <Link
                href="/"
                className="h-14 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center gap-2 text-sm font-bold text-slate-900 dark:text-white hover:bg-slate-50 transition-all active:scale-95"
              >
                <Globe className="w-4 h-4" />
                Discovery
              </Link>
              <Link
                href="/dashboard"
                className="h-14 rounded-2xl bg-slate-950 dark:bg-white flex items-center justify-center gap-2 text-sm font-bold text-white dark:text-slate-900 transition-all shadow-xl hover:scale-[0.98] active:scale-95"
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
