import type { Metadata } from "next";
import { Inter, Noto_Sans, Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { BottomNavigation } from "@/components/BottomNavigation";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});
const geistMono = Geist_Mono({subsets:['latin'],variable:'--font-mono'});

const inter = Inter({ subsets: ["latin"] });
const noto = Noto_Sans({ subsets: ["latin"], weight: ["400", "700"] });

export const metadata: Metadata = {
  title: "Subora Spaces",
  description: "Monetize your Telegram communities with ease.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("font-sans", geist.variable, geistMono.variable, inter.className, noto.className)} suppressHydrationWarning>
      <body suppressHydrationWarning className="antialiased min-h-screen bg-white text-zinc-900 overflow-x-hidden">
        <Providers>
          <div className="pb-32">
            {children}
          </div>
          <BottomNavigation />
        </Providers>
      </body>
    </html>
  );
}
