'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Space } from '@/lib/supabase';
import { X, Share2, Send, Rocket, LayoutDashboard, Compass } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface CelebrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  space: Partial<Space>;
}

export function CelebrationModal({ isOpen, onClose, space }: CelebrationModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const handleShareX = () => {
    const text = `I just launched my premium Telegram space "${space.name}" on Subora! 🚀\n\nJoin us here: https://t.me/SuboraBot/app?startapp=space_${space.id}\n\n#Telegram #Web3 #Subora`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleShareTelegram = async () => {
    try {
      const WebApp = (await import('@twa-dev/sdk')).default;
      const username = WebApp.initDataUnsafe.user?.username || 'user';
      const inviteLink = `https://t.me/SuboraBot/app?startapp=space_${space.id}_ref_${username}`;
      const shareText = `🚀 My new space is LIVE on Subora!\n\nJoin "${space.name}" for exclusive alpha and private discussions.\n\nAccess here: ${inviteLink}`;
      
      if (WebApp.isVersionAtLeast('6.7')) {
        WebApp.switchInlineQuery(shareText, ['users', 'groups', 'channels']);
      } else {
        navigator.clipboard.writeText(shareText);
        alert('Share link copied to clipboard!');
      }
    } catch (error) {
      console.error('Telegram share failed', error);
      const fallback = `https://t.me/SuboraBot/app?startapp=space_${space.id}`;
      navigator.clipboard.writeText(fallback);
      alert('Link copied to clipboard!');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-md"
          />
          
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-lg bg-white rounded-[48px] overflow-hidden shadow-2xl"
          >
            {/* Celebratory Header */}
            <div className="relative h-48 bg-slate-950 flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 opacity-20">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,#5b76fe,transparent_70%)]" />
              </div>
              
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="relative z-10 flex flex-col items-center gap-4"
              >
                <div className="w-20 h-20 rounded-[24px] bg-primary flex items-center justify-center shadow-xl shadow-primary/20 rotate-12">
                  <Rocket className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-white text-2xl font-heading font-bold tracking-tight">Mission Accomplished.</h2>
              </motion.div>
              
              <button 
                onClick={onClose}
                className="absolute top-6 right-6 p-2 rounded-full bg-white/10 text-white/60 hover:bg-white/20 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-8 md:p-12 space-y-10">
              <div className="text-center space-y-3">
                <p className="text-[10px] font-bold text-primary uppercase tracking-[0.4em]">Viral Loop Active</p>
                <h3 className="text-3xl font-heading font-bold text-slate-950 leading-tight">
                  "{space.name}" is now Live.
                </h3>
                <p className="text-slate-500 font-medium leading-relaxed max-w-sm mx-auto">
                  Your space is authorized and listed. The faster people join, the higher you'll rank on the Discovery Mall.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={handleShareTelegram}
                  className="flex items-center justify-center gap-3 bg-primary text-white h-16 rounded-[24px] font-bold text-sm hover:bg-primary/90 transition-all active:scale-95 shadow-lg shadow-primary/15"
                >
                  <Send className="w-5 h-5" />
                  Share to Telegram
                </button>
                <button
                  onClick={handleShareX}
                  className="flex items-center justify-center gap-3 bg-slate-950 text-white h-16 rounded-[24px] font-bold text-sm hover:bg-slate-900 transition-all active:scale-95 shadow-lg shadow-slate-950/15"
                >
                  <Share2 className="w-5 h-5" />
                  Post to X
                </button>
              </div>

              <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-center gap-4">
                 <Link
                   href="/dashboard"
                   onClick={onClose}
                   className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-950 transition-colors uppercase tracking-widest"
                 >
                   <LayoutDashboard className="w-4 h-4" />
                   Manage Space
                 </Link>
                 <div className="hidden sm:block w-1.5 h-1.5 rounded-full bg-slate-200" />
                 <Link
                   href="/"
                   onClick={onClose}
                   className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-950 transition-colors uppercase tracking-widest"
                 >
                   <Compass className="w-4 h-4" />
                   View in Discovery
                 </Link>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
