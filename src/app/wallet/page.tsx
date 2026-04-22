import { Header } from '@/components/Header';
import { WalletDashboard } from '@/components/WalletDashboard';

export default function WalletPage() {
  return (
    <main className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 pt-10 max-w-4xl">
        <header className="mb-10 space-y-2">
           <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Financial Hub</p>
           <h1 className="text-4xl font-heading font-black text-slate-950 tracking-tight">Your Digital Vault</h1>
           <p className="text-sm font-medium text-slate-500 leading-relaxed max-w-lg">
             Manage your on-chain assets, track ecosystem payouts, and secure your earnings in one premium command center.
           </p>
        </header>

        <WalletDashboard />
      </div>
    </main>
  );
}
