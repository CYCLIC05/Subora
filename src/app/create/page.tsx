'use client';

import Link from 'next/link';
import { Header } from "@/components/Header";
import { useCallback, useEffect, useState } from "react";
import confetti from 'canvas-confetti';
import { Input } from "@/components/ui/input";

export default function CreateSpace() {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Form, 2: Payment, 3: Success

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    cover_image: '',
    channel_link: '',
  });

  const [tiers, setTiers] = useState([
    { name: 'Standard Access', price: 99, duration: 'week' },
    { name: 'Premium Access', price: 299, duration: 'month' },
  ]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTierChange = (index: number, field: 'name' | 'price' | 'duration', value: string) => {
    setTiers((current) =>
      current.map((tier, tierIndex) =>
        tierIndex === index
          ? { ...tier, [field]: field === 'price' ? Number(value) : value }
          : tier
      )
    );
  };

  const handleAddTier = () => {
    setTiers((current) => [...current, { name: 'New Tier', price: 149, duration: 'month' }]);
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
        const telegramId = (window as unknown as {
          Telegram?: {
            WebApp?: {
              initDataUnsafe?: { user?: { id?: number } }
            }
          }
        }).Telegram?.WebApp?.initDataUnsafe?.user?.id ?? 0

        const payload = {
          name: formData.name,
          description: formData.description,
          cover_image: formData.cover_image,
          channel_link: formData.channel_link,
          tiers,
          creator_telegram_id: telegramId,
        }

        const response = await fetch('/api/spaces', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })

        if (!response.ok) {
          const result = await response.json()
          console.error('Error saving space:', result)
        } else {
          setStep(3)
          confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#000000', '#71717a', '#a1a1aa'],
          })
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
                        placeholder="e.g. Quantitative Insights"
                        className="h-11 rounded-2xl border-slate-200 bg-slate-50/80 focus-visible:ring-primary/10"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-900 ml-1">Abstract</label>
                      <textarea
                        required
                        maxLength={120}
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Define the primary value of your space..."
                        className="w-full h-28 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-slate-400"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-900 ml-1">Visual Asset URL</label>
                        <Input
                          required
                          name="cover_image"
                          value={formData.cover_image}
                          onChange={handleChange}
                          placeholder="https://..."
                          className="h-11 rounded-2xl border-slate-200 bg-slate-50/80"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-900 ml-1">Terminal Link</label>
                        <Input
                          required
                          name="channel_link"
                          value={formData.channel_link}
                          onChange={handleChange}
                          placeholder="@channel"
                          className="h-11 rounded-2xl border-slate-200 bg-slate-50/80"
                        />
                      </div>
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
                              placeholder="Tier label"
                            />
                          </div>

                          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-[1fr_auto] md:items-end md:gap-4">
                            <Input
                              type="number"
                              name={`tier-${index}-price`}
                              value={tier.price}
                              onChange={(e) => handleTierChange(index, 'price', e.target.value)}
                              className="h-9 rounded-2xl bg-white border-slate-200 text-xs font-bold"
                              placeholder="Price"
                            />
                            <select
                              name={`tier-${index}-duration`}
                              value={tier.duration}
                              onChange={(e) => handleTierChange(index, 'duration', e.target.value)}
                              className="h-9 rounded-2xl bg-white border border-slate-200 text-[10px] font-bold uppercase"
                            >
                              <option value="week">Weekly</option>
                              <option value="month">Monthly</option>
                              <option value="year">Yearly</option>
                            </select>
                          </div>
                        </div>

                        <div className="mt-4 flex items-center justify-between gap-3">
                          <p className="text-sm text-slate-500">Flexible tier you can rename, price, and remove.</p>
                          <button
                            type="button"
                            onClick={() => handleRemoveTier(index)}
                            disabled={tiers.length === 1}
                            className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            Remove
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
                  className="inline-flex items-center justify-center gap-2 rounded-3xl bg-primary px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/15 hover:bg-primary/90 transition-all disabled:cursor-not-allowed disabled:opacity-70"
                >
                  Review space
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
              <Link
                href="/"
                className="inline-flex h-11 items-center justify-center rounded-3xl border border-slate-200 bg-white px-6 text-xs font-bold text-slate-900 hover:bg-slate-50 transition-all"
              >
                Discovery
              </Link>
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
