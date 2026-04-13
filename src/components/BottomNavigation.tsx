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
    } catch (e) {}
  };

  return (
    <div className="fixed bottom-8 inset-x-0 z-50 flex justify-center pointer-events-none">
      <nav className="bg-zinc-950/90 backdrop-blur-2xl border border-white/10 rounded-full p-2 flex items-center gap-1 shadow-2xl shadow-zinc-950/40 pointer-events-auto overflow-hidden">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={handleClick}
              className={cn(
                "relative flex items-center justify-center p-3 sm:px-6 transition-all duration-300 rounded-full group outline-none",
                isActive ? "text-white" : "text-zinc-500 hover:text-zinc-300"
              )}
            >
              <div className="relative z-10 flex items-center gap-3">
                <Icon className={cn(
                  "w-[22px] h-[22px] transition-transform duration-300",
                  isActive ? "scale-100" : "scale-90 group-hover:scale-100"
                )} />
                {isActive && (
                  <motion.span 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-[11px] font-bold uppercase tracking-[0.1em] hidden sm:inline-block"
                  >
                    {item.name}
                  </motion.span>
                )}
              </div>
              
              {isActive && (
                <motion.div
                  layoutId="active-nav-bubble"
                  className="absolute inset-0 bg-primary/20 rounded-full border border-primary/20"
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
