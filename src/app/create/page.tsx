'use client';

import Link from 'next/link';
import { Header } from "@/components/Header";
import { useCallback, useEffect, useState } from "react";
import confetti from 'canvas-confetti';
import { Input } from "@/components/ui/input";
import { CelebrationModal } from "@/components/CelebrationModal";
import { Space } from "@/lib/supabase";
import { X } from "lucide-react";

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
  });

  const [createdSpace, setCreatedSpace] = useState<Partial<Space> | null>(null);
  const [isCelebrationOpen, setIsCelebrationOpen] = useState(false);

  const [isVerified, setIsVerified] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [verifySuccess, setVerifySuccess] = useState<string | null>(null);

  const [tiers, setTiers] = useState([
    { name: 'Standard Access', price: 99, duration: 'week', currency: 'TON' },
    { name: 'Premium Access', price: 299, duration: 'month', currency: 'TON' },
  ]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 800;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          // Compress to tiny WebP/JPEG for quick database storage
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.6);
          setFormData(prev => ({ ...prev, cover_image: compressedBase64 }));
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
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

  const handleAddTier = () => {
    setTiers((current) => [...current, { name: 'New Tier', price: 149, duration: 'month', currency: 'TON' }]);
  };

  const handleVerifyConnection = async () => {
    if (!formData.channel_link) {
      setVerifyError('Please enter a channel link first.');
      return;
    }
    setVerifying(true);
    setVerifyError(null);
    setVerifySuccess(null);
    try {
      const res = await fetch('/api/telegram/verify-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channelLink: formData.channel_link })
      });
      const data = await res.json();
      if (data.success) {
        setIsVerified(true);
        setVerifySuccess(data.message);
      } else {
        setIsVerified(false);
        setVerifyError(data.error);
      }
    } catch (err) {
      setVerifyError('Failed to verify connection. Please try again.');
    } finally {
      setVerifying(false);
    }
  };

  const handleRemoveTier = (index: number) => {
    setTiers((current) => current.filter((_, tierIndex) => tierIndex !== index));
  };

  const handleCreateRequest = async (e?: React.FormEvent<HTMLFormElement>) => {
    e?.preventDefault();
    setStep(2);
  };

  const handlePayListingFee = useCallback(async () => {
    setLoading(true);
    setTimeout(async () => {
      try {
        const telegramId = window.Telegram?.WebApp?.initDataUnsafe?.user?.id ?? 0

        const creatorReferrer = localStorage.getItem('creator_referrer') || undefined;

        const payload = {
          name: formData.name,
          description: formData.description,
          cover_image: formData.cover_image,
          channel_link: formData.channel_link,
          creator_name: formData.creator_name,
          category: formData.category,
          payment_address: formData.payment_address,
          tiers,
          creator_telegram_id: telegramId,
          referrer_payment_address: creatorReferrer,
        }

        const response = await fetch('/api/spaces', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })

        if (!response.ok) {
          let errorMsg = 'There was an error saving your space.';
          try {
            const result = await response.json();
            errorMsg = result.error || errorMsg;
          } catch (jsonErr) {
            errorMsg = `Server error ${response.status}: Payload might be too large.`;
          }
          console.error('Error saving space:', errorMsg);
          alert(errorMsg);
        } else {
          setStep(3)
          confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#000000', '#71717a', '#a1a1aa'],
          })
          
          setCreatedSpace({
            id: 'pending', // Will be updated if we get the ID back from API
            ...formData
          })
          setIsCelebrationOpen(true)
        }
      } catch (error) {
        console.error('Error saving space:', error)
      } finally {
        setLoading(false)
      }
    }, 1500);
  }, [formData, tiers]);

  useEffect(() => {
    let cleanup = () => {}
    const initMainButton = async () => {
      try {
        const WebApp = (await import('@twa-dev/sdk')).default

        if (step === 1) {
          const handleFormSubmit = () => {
            const form = document.getElementById('create-space-form') as HTMLFormElement | null
            if (form?.requestSubmit) {
              form.requestSubmit()
            } else {
              form?.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }))
            }
          }

          WebApp.MainButton.setText('Review space')
          WebApp.MainButton.show()
          WebApp.MainButton.onClick(handleFormSubmit)

          cleanup = () => {
            try {
              WebApp.MainButton.offClick?.(handleFormSubmit)
            } catch (cleanupError) {
              console.debug('Telegram cleanup failed', cleanupError)
            }

            try {
              WebApp.MainButton.hide?.()
            } catch (cleanupError) {
              console.debug('Telegram cleanup failed', cleanupError)
            }
          }
        } else if (step === 2) {
          const handlePayment = () => {
            handlePayListingFee()
          }

          WebApp.MainButton.setText('Pay listing fee')
          WebApp.MainButton.show()
          WebApp.MainButton.onClick(handlePayment)

          cleanup = () => {
            try {
              WebApp.MainButton.offClick?.(handlePayment)
            } catch (cleanupError) {
              console.debug('Telegram cleanup failed', cleanupError)
            }

            try {
              WebApp.MainButton.hide?.()
            } catch (cleanupError) {
              console.debug('Telegram cleanup failed', cleanupError)
            }
          }
        } else {
          try {
            WebApp.MainButton.hide?.()
          } catch (cleanupError) {
            console.debug('Telegram cleanup failed', cleanupError)
          }
        }
      } catch (error) {
        console.error('Telegram WebApp error', error)
      }
    }

    initMainButton()
    return () => cleanup()
  }, [step, handlePayListingFee])

  return (
    <main className="min-h-screen bg-background pb-32">
      <Header />
      
      <CelebrationModal 
        isOpen={isCelebrationOpen} 
        onClose={() => setIsCelebrationOpen(false)} 
        space={createdSpace || { name: formData.name }} 
      />

      <div className="container mx-auto px-4 py-10 max-w-3xl">
        {step === 1 && (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <header className="space-y-3">
              <h1 className="text-4xl font-heading font-semibold text-slate-950 tracking-tight">Launch your space</h1>
              <p className="text-base text-slate-600 font-medium leading-relaxed">Configure your Telegram community, set membership tiers, and submit for verified placement.</p>
            </header>

            <form id="create-space-form" onSubmit={handleCreateRequest} className="space-y-10">
              <section className="space-y-6">
                <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex flex-col gap-4 mb-6">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Space Definition</p>
                      <h2 className="text-xl font-semibold text-slate-950 mt-2">Tell us about your community</h2>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-900 ml-1">Identity</label>
                      <Input
                        required
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="e.g. Quantum Alpha Syndicate"
                        className="h-11 rounded-2xl border-slate-200 bg-slate-50/80 focus-visible:ring-primary/10"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-900 ml-1">Creator Display Name</label>
                        <Input
                          required
                          name="creator_name"
                          value={formData.creator_name}
                          onChange={handleChange}
                          placeholder="e.g. by The Quantum Team"
                          className="h-11 rounded-2xl border-slate-200 bg-slate-50/80 focus-visible:ring-primary/10"
                        />
                        <p className="text-[10px] text-slate-400 ml-1 leading-relaxed">
                          This name will be shown publicly as the provider of the space.
                        </p>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-900 ml-1">Niche Category</label>
                        <select
                          required
                          name="category"
                          value={formData.category}
                          onChange={handleChange as any}
                          className="w-full h-11 rounded-2xl border border-slate-200 bg-slate-50/80 px-3 text-sm focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all font-medium"
                        >
                          <option>Crypto Alpha</option>
                          <option>Trading</option>
                          <option>Lifestyle</option>
                          <option>Education</option>
                          <option>Technical</option>
                        </select>
                        <p className="text-[10px] text-slate-400 ml-1 leading-relaxed">
                          Helps users find you in the Discovery Mall.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-900 ml-1">Abstract</label>
                      <textarea
                        required
                        maxLength={120}
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Describe the core value of your Telegram channel..."
                        className="w-full h-28 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-slate-400"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-900 ml-1">Visual Asset (PNG/JPG)</label>
                        <Input
                          type="file"
                          accept="image/png, image/jpeg"
                          required
                          onChange={handleImageUpload}
                          className="h-11 rounded-2xl border-slate-200 bg-slate-50/80 file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-semibold file:bg-primary/5 file:text-primary hover:file:bg-primary/10 file:cursor-pointer pb-2 text-xs text-slate-600 cursor-pointer pt-[9px]"
                        />
                      </div>
                      <div className="space-y-1.5 flex flex-col justify-end">
                        <label className="text-xs font-semibold text-slate-900 ml-1">Channel Link</label>
                        <Input
                          required
                          type="text"
                          name="channel_link"
                          value={formData.channel_link}
                          onChange={handleChange}
                          placeholder="@channelname or t.me/... or -100..."
                          className="w-full h-11 rounded-2xl border border-slate-200 bg-slate-50/80 px-3 text-sm focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all"
                        />
                        <p className="text-[10px] text-slate-500 font-medium ml-1 mt-1 leading-relaxed">
                          Enter your <span className="text-primary font-bold">@username</span>, <span className="text-primary font-bold">t.me/link</span>, or <span className="text-primary font-bold">Numeric ID</span> (-100...).
                          <br />
                          <span className="text-slate-900">Note:</span> Use the <span className="font-bold underline">Numeric ID</span> for private channels to enable single-use invite link security.
                        </p>
                        
                        <div className="mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                          <div className="flex items-center justify-between gap-4">
                            <div>
                               <p className="text-xs font-bold text-slate-950 uppercase tracking-tight">Channel Connection</p>
                               <p className="text-[10px] text-slate-500 font-medium">Verify Subora bot is admin.</p>
                            </div>
                            <button
                              type="button"
                              onClick={handleVerifyConnection}
                              disabled={verifying}
                              className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
                                isVerified 
                                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' 
                                : 'bg-slate-950 text-white hover:bg-slate-900'
                              }`}
                            >
                              {verifying ? 'Checking...' : isVerified ? 'Verified ✓' : 'Verify Connection'}
                            </button>
                          </div>
                          {verifyError && <p className="text-[10px] font-bold text-rose-500">{verifyError}</p>}
                          {verifySuccess && <p className="text-[10px] font-bold text-emerald-500">{verifySuccess}</p>}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-900 ml-1">TON Wallet Address (for receiving payments)</label>
                      <Input
                        required
                        name="payment_address"
                        value={formData.payment_address}
                        onChange={handleChange}
                        placeholder="UQ... or EQ..."
                        className="h-11 rounded-2xl border-slate-200 bg-slate-50/80 font-mono text-xs"
                      />
                      <p className="text-[10px] text-slate-400 ml-1">Your TON wallet where subscriber payments will be sent.</p>
                    </div>
                  </div>
                </div>
              </section>

              <section className="space-y-6">
                <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex flex-col gap-4 mb-6">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Subscription Logic</p>
                      <h2 className="text-xl font-semibold text-slate-950 mt-2">Plan the member experience</h2>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {tiers.map((tier, index) => (
                      <div key={`${tier.name}-${index}`} className="rounded-3xl bg-slate-50 border border-slate-200 p-5">
                        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                          <div className="space-y-2">
                            <p className="text-[10px] font-bold text-slate-900 uppercase tracking-widest leading-none">Tier {index + 1}</p>
                            <Input
                              name={`tier-${index}-name`}
                              value={tier.name}
                              onChange={(e) => handleTierChange(index, 'name', e.target.value)}
                              className="h-9 rounded-2xl bg-white border-slate-200 text-xs font-semibold"
                              placeholder="Founders Circle"
                            />
                          </div>

                          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-[1fr_auto] md:items-end md:gap-4">
                            <Input
                              type="number"
                              name={`tier-${index}-price`}
                              value={tier.price}
                              onChange={(e) => handleTierChange(index, 'price', e.target.value)}
                              className="h-9 rounded-2xl bg-white border-slate-200 text-xs font-bold"
                              placeholder="149"
                            />
                            <div className="flex gap-2">
                              <select
                                name={`tier-${index}-currency`}
                                value={tier.currency}
                                onChange={(e) => handleTierChange(index, 'currency', e.target.value)}
                                className="h-9 rounded-2xl bg-white border border-slate-200 text-[10px] font-bold uppercase px-2"
                              >
                                <option value="TON">TON</option>
                                <option value="USDT">USDT</option>
                                <option value="Stars">Stars</option>
                              </select>
                              <select
                                name={`tier-${index}-duration`}
                                value={tier.duration}
                                onChange={(e) => handleTierChange(index, 'duration', e.target.value)}
                                className="h-9 rounded-2xl bg-white border border-slate-200 text-[10px] font-bold uppercase px-2"
                              >
                                <option value="week">Weekly</option>
                                <option value="month">Monthly</option>
                                <option value="year">Yearly</option>
                              </select>
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 flex items-center justify-between gap-3">
                          <p className="text-sm text-slate-500">Flexible tier you can rename, price, and remove.</p>
                          <button
                            type="button"
                            onClick={() => handleRemoveTier(index)}
                            disabled={tiers.length === 1}
                            className="rounded-full border border-slate-200 bg-white p-2 text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={handleAddTier}
                      className="inline-flex items-center justify-center gap-2 rounded-3xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-900 shadow-sm hover:bg-slate-50 transition"
                    >
                      Add another tier
                    </button>
                  </div>
                </div>
              </section>

              <footer className="pt-6 text-center space-y-4">
                <button
                  type="submit"
                  disabled={!isVerified}
                  className="inline-flex items-center justify-center gap-2 rounded-3xl bg-primary px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/15 hover:bg-primary/90 transition-all disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {isVerified ? 'Review space' : 'Verify Bot to Continue'}
                </button>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                  If you are inside Telegram, use the native main button above.
                </p>
              </footer>
            </form>
          </div>
        )}

        {step === 2 && (
          <div className="animate-in zoom-in-95 fade-in duration-500 py-12 space-y-10">
            <header className="text-center space-y-2">
              <h2 className="text-3xl font-heading font-semibold text-slate-950 tracking-tight">Security Deposit</h2>
              <p className="text-base text-slate-600 font-medium">Anti-spam verification fee for the Subora ecosystem.</p>
            </header>

            <div className="p-8 rounded-[32px] bg-[#0f172a] text-white shadow-2xl shadow-slate-900/20 max-w-sm mx-auto space-y-8">
              <div className="flex justify-between items-center border-b border-white/10 pb-6">
                <span className="text-xs font-bold uppercase tracking-widest opacity-60">Verification Fee</span>
                <span className="text-3xl font-heading font-bold tracking-tight">99</span>
              </div>
              
              <ul className="space-y-4 text-sm font-medium text-slate-200 opacity-90">
                {[
                  "Verified placement on Discover",
                  "Creator indexing",
                  "Revenue management terminal access"
                ].map((item, i) => (
                  <li key={i} className="pl-4">
                    • {item}
                  </li>
                ))}
              </ul>

              <div className="pt-4 text-[10px] font-bold uppercase tracking-widest opacity-70 text-center">
                Encrypted via Telegram
              </div>
            </div>

            <div className="space-y-4 text-center">
              <button
                onClick={handlePayListingFee}
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 rounded-3xl bg-primary px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/15 hover:bg-primary/90 transition-all disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? 'Processing payment...' : 'Pay listing fee and launch'}
              </button>
              <button
                onClick={() => setStep(1)}
                className="text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors uppercase tracking-widest"
              >
                Modify configuration
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="animate-in zoom-in-95 fade-in duration-500 text-center py-20 space-y-10">
            <div className="flex justify-center">
              <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center shadow-xl shadow-primary/20">
                <span className="text-4xl font-bold text-white">✓</span>
              </div>
            </div>
            
            <header className="space-y-2">
              <h2 className="text-4xl font-heading font-semibold text-slate-950 tracking-tight">Authorized.</h2>
              <p className="text-slate-600 font-medium max-w-xs mx-auto">Your community is now successfully indexed within the ecosystem.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-xs mx-auto">
              <a
                href="/"
                className="inline-flex h-11 items-center justify-center rounded-3xl border border-slate-200 bg-white px-6 text-xs font-bold text-slate-900 hover:bg-slate-50 transition-all"
              >
                Discovery
              </a>
              <Link
                href="/dashboard"
                className="inline-flex h-11 items-center justify-center rounded-3xl bg-primary px-6 text-xs font-bold text-white hover:bg-primary/90 transition-all shadow-lg shadow-primary/15"
              >
                Management
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
