'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Compass, PencilLine } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export function BottomNavigation() {
  const pathname = usePathname();

  const navItems = [
    { name: 'Discover', href: '/', icon: Compass },
    { name: 'Create', href: '/create', icon: PencilLine },
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  ];

  const handleClick = async () => {
    try {
      const WebApp = (await import('@twa-dev/sdk')).default;
      WebApp.HapticFeedback.impactOccurred('light');
    } catch (error) {
      console.warn('Haptic feedback unavailable', error)
    }
  };

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 flex justify-center px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pointer-events-none">
      <nav className="w-full max-w-[min(100%,460px)] bg-white/95 backdrop-blur-xl border border-slate-200/70 rounded-full p-2 sm:p-3 flex items-center justify-between gap-1 shadow-lg shadow-slate-200/70 pointer-events-auto overflow-hidden">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={handleClick}
              aria-label={item.name}
              className={cn(
                "relative flex-1 flex items-center justify-center rounded-full transition-all duration-300 group outline-none",
                isActive ? "text-primary" : "text-slate-500 hover:text-slate-700"
              )}
            >
              <div className="relative z-10 flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2">
                <Icon className={cn(
                  "w-[20px] h-[20px] transition-transform duration-300",
                  isActive ? "scale-100" : "scale-90 group-hover:scale-100"
                )} />
                {isActive && (
                  <motion.span 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-[11px] font-bold uppercase tracking-[0.2em] hidden sm:inline-block"
                  >
                    {item.name}
                  </motion.span>
                )}
              </div>
              
              {isActive && (
                <motion.div
                  layoutId="active-nav-bubble"
                  className="absolute inset-1 bg-primary/10 rounded-full border border-primary/15"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
