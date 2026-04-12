'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Compass, Rocket, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import WebApp from '@twa-dev/sdk';

export function BottomNavigation() {
  const pathname = usePathname();

  const navItems = [
    { name: 'Discover', href: '/', icon: Compass },
    { name: 'Create', href: '/create', icon: Plus },
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  ];

  const handleClick = () => {
    try {
      WebApp.HapticFeedback.impactOccurred('light');
    } catch (e) {}
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-t border-miro-ring pb-safe-area-inset-bottom">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={handleClick}
              className={cn(
                "flex flex-col items-center gap-1 py-1 px-4 transition-all relative",
                isActive 
                  ? "text-miro-blue" 
                  : "text-miro-slate hover:text-miro-black"
              )}
            >
              <div className={cn(
                "p-1 rounded-xl transition-all",
                isActive ? "bg-miro-blue/10" : ""
              )}>
                <Icon className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest leading-none">
                {item.name}
              </span>
              {isActive && (
                <div className="absolute -bottom-2 w-1 h-1 bg-miro-blue rounded-full" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
