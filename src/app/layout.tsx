import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { BottomNavigation } from "@/components/BottomNavigation";
import { cn } from "@/lib/utils";
import { Toaster } from 'sonner';

const geist = Geist({subsets:['latin'],variable:'--font-sans'});
const geistMono = Geist_Mono({subsets:['latin'],variable:'--font-mono'});



export const metadata: Metadata = {
  title: "Subora Spaces",
  description: "Monetize your Telegram communities with ease.",
};

import { Onboarding } from "@/components/Onboarding";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("font-sans", geist.variable, geistMono.variable)} suppressHydrationWarning>
      <body suppressHydrationWarning className="antialiased min-h-screen bg-white text-zinc-900 overflow-x-hidden">
        <Providers>
          <Onboarding />
          <Toaster position="top-center" richColors />
          <div className="pb-32">
            {children}
          </div>
          <BottomNavigation />
        </Providers>
      </body>
    </html>
  );
}
