import type { Metadata } from "next";
import { Inter, Noto_Sans } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { BottomNavigation } from "@/components/BottomNavigation";

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
    <html lang="en">
      <body className={`${inter.className} ${noto.className} antialiased min-h-screen bg-white text-miro-black overflow-x-hidden`}>
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
