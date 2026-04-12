import type { Metadata } from "next";
import { Inter, Noto_Sans, Geist } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { BottomNavigation } from "@/components/BottomNavigation";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

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
    <html lang="en" className={cn("font-sans", geist.variable)} suppressHydrationWarning>
      <body className={`${inter.className} ${noto.className} antialiased min-h-screen bg-white text-zinc-900 overflow-x-hidden`}>
        <Providers>
          <div className="pb-20">
            {children}
          </div>
          <BottomNavigation />
        </Providers>
      </body>
    </html>
  );
}
