'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Compass, PencilLine } from 'lucide-react';
import { cn } from '@/lib/utils';
import WebApp from '@twa-dev/sdk';

export function BottomNavigation() {
  const pathname = usePathname();

  const navItems = [
    { name: 'Discover', href: '/', icon: Compass },
    { name: 'Create', href: '/create', icon: PencilLine },
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  ];

  const handleClick = () => {
    try {
      WebApp.HapticFeedback.impactOccurred('light');
    } catch (e) {}
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/70 backdrop-blur-xl border-t border-zinc-100 pb-safe-area-inset-bottom">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={handleClick}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full transition-all relative overflow-hidden",
                isActive 
                  ? "text-zinc-900" 
                  : "text-zinc-400 hover:text-zinc-600"
              )}
            >
              <div className={cn(
                "transition-transform duration-200",
                isActive ? "scale-110" : "scale-100"
              )}>
                <Icon className={cn("w-5 h-5", isActive ? "stroke-[2.5px]" : "stroke-[1.5px]")} />
              </div>
              <span className={cn(
                "text-[10px] font-medium tracking-tight mt-1 transition-opacity",
                isActive ? "opacity-100" : "opacity-0 h-0"
              )}>
                {item.name}
              </span>
              {isActive && (
                <div className="absolute top-0 w-8 h-1 bg-zinc-900 rounded-b-full" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
