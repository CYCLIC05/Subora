import { Header } from '@/components/Header';
import { WalletDashboard } from '@/components/WalletDashboard';

export default function WalletPage() {
  return (
    <main className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 pt-10 max-w-4xl">
        <header className="mb-6 space-y-2">
           <h1 className="text-2xl font-heading font-black text-slate-950 tracking-tight">Wallet</h1>
        </header>

        <WalletDashboard />
      </div>
    </main>
  );
}
