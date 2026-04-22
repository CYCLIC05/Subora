'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export function Onboarding() {
  const [step, setStep] = useState(0)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const seen = localStorage.getItem('subora_onboarding_seen')
    if (!seen) {
      setIsVisible(true)
    }
  }, [])

  const handleComplete = () => {
    localStorage.setItem('subora_onboarding_seen', 'true')
    setIsVisible(false)
  }

  const steps = [
    {
      title: 'Premium Signal Only.',
      description: 'Subora is a curated discovery layer for high-value Telegram communities. No noise, just verified alpha.',
      action: 'Next'
    },
    {
      title: 'Direct To Wallet.',
      description: 'Subscription revenue is sent directly to your TON wallet. No withdrawals, no delays, full sovereignty.',
      action: 'Next'
    },
    {
      title: 'Verified Access.',
      description: 'Automated invite links and membership management powered by the TON blockchain and Telegram.',
      action: 'Enter Subora'
    }
  ]

  if (!isVisible) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-slate-950 flex flex-col justify-between p-8 md:p-16 text-white overflow-hidden"
      >
        {/* Ambient Background Elements */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden flex items-center justify-center">
           <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03)_0%,transparent_100%)] rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl" />
           <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.05)_0%,transparent_100%)] rounded-full translate-y-1/3 -translate-x-1/4 blur-3xl" />
           
           <motion.div 
             key={`watermark-${step}`}
             initial={{ opacity: 0, scale: 0.9 }}
             animate={{ opacity: 0.03, scale: 1 }}
             transition={{ duration: 0.8 }}
             className="absolute text-[30rem] md:text-[40rem] font-heading font-black leading-none pointer-events-none select-none tracking-tighter"
           >
             0{step + 1}
           </motion.div>
        </div>

        <header className="relative z-10 flex justify-between items-center">
          <span className="text-sm font-black uppercase tracking-[0.4em] text-white">Subora</span>
          <button 
            onClick={handleComplete}
            className="text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-white transition-colors"
          >
            Skip
          </button>
        </header>

        <div className="relative z-10 flex-1 flex flex-col justify-center max-w-4xl mx-auto w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-10"
            >
              <div className="space-y-4">
                 <p className="text-xs font-bold uppercase tracking-[0.4em] text-slate-500">Phase 0{step + 1}</p>
                 <h1 className="text-5xl md:text-7xl lg:text-8xl font-heading font-bold tracking-tighter text-white leading-[0.95]">
                   {steps[step].title}
                 </h1>
              </div>
              <p className="text-lg md:text-xl text-slate-400 font-medium leading-relaxed max-w-xl">
                {steps[step].description}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        <footer className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-12 max-w-4xl mx-auto w-full">
          <div className="flex gap-3">
            {steps.map((_, i) => (
              <div 
                key={i} 
                className={`h-1.5 transition-all duration-500 rounded-full ${i === step ? 'w-16 bg-white' : 'w-4 bg-white/20'}`} 
              />
            ))}
          </div>

          <button
            onClick={() => {
              if (step < steps.length - 1) {
                setStep(step + 1)
              } else {
                handleComplete()
              }
            }}
            className="group flex items-center gap-4 text-xl md:text-2xl font-heading font-black tracking-tight text-white hover:text-slate-300 transition-colors"
          >
            <span>{steps[step].action}</span>
            <div className="flex items-center w-12 justify-start overflow-hidden">
              <motion.div
                animate={{ x: [-48, 0, 48] }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                className="h-px bg-white w-12"
              />
            </div>
          </button>
        </footer>
      </motion.div>
    </AnimatePresence>
  )
}
