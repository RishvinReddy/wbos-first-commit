import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "../styles/globals.css";
import Link from "next/link";
import { 
  Activity, 
  Package, 
  ShoppingCart, 
  LayoutDashboard, 
  MessageSquare, 
  Users, 
  Truck, 
  BarChart3, 
  Bot 
} from "lucide-react";

const outfit = Outfit({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "WBOS Command Center",
  description: "Operations Dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${outfit.className} antialiased flex`}>
        {/* Background glow elements */}
        <div className="glow-bg bg-purple"></div>
        <div className="glow-bg bg-blue"></div>
        
        {/* Sidebar Navigation */}
        <nav className="w-64 border-r bg-card/80 backdrop-blur-xl flex flex-col p-4 shadow-[inset_-4px_0_8px_rgba(148,163,184,0.1)] z-10">
          <div className="mb-8 flex items-center gap-3 px-2">
            <div className="h-10 w-10 rounded-xl bg-wa-green flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-wa-green/30">
              W
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-text-primary to-text-secondary">WBOS</h1>
              <div className="text-[10px] font-semibold text-text-secondary uppercase tracking-widest">Command Center</div>
            </div>
          </div>
          
          <div className="space-y-1.5 flex-1">
            <div className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2 px-3 mt-4">Command Center</div>
            <Link href="/" className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-white hover:text-wa-green hover:shadow-md transition-all text-sm font-semibold text-text-secondary border border-transparent hover:border-wa-green/20">
              <LayoutDashboard className="h-4 w-4" /> Overview
            </Link>

            <div className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2 px-3 mt-6">Customer</div>
            <Link href="/conversations" className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-white hover:text-wa-green hover:shadow-md transition-all text-sm font-semibold text-text-secondary border border-transparent hover:border-wa-green/20">
              <MessageSquare className="h-4 w-4" /> Conversations
            </Link>
            <Link href="/customers" className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-white hover:text-wa-green hover:shadow-md transition-all text-sm font-semibold text-text-secondary border border-transparent hover:border-wa-green/20">
              <Users className="h-4 w-4" /> Customers
            </Link>

            <div className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2 px-3 mt-6">Operations</div>
            <Link href="/orders" className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-white hover:text-wa-green hover:shadow-md transition-all text-sm font-semibold text-text-secondary border border-transparent hover:border-wa-green/20">
              <ShoppingCart className="h-4 w-4" /> Orders
            </Link>
            <Link href="/inventory" className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-white hover:text-wa-green hover:shadow-md transition-all text-sm font-semibold text-text-secondary border border-transparent hover:border-wa-green/20">
              <Package className="h-4 w-4" /> Inventory
            </Link>
            <Link href="/delivery" className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-white hover:text-wa-green hover:shadow-md transition-all text-sm font-semibold text-text-secondary border border-transparent hover:border-wa-green/20">
              <Truck className="h-4 w-4" /> Delivery
            </Link>

            <div className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2 px-3 mt-6">Intelligence</div>
            <Link href="/analytics" className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-white hover:text-wa-green hover:shadow-md transition-all text-sm font-semibold text-text-secondary border border-transparent hover:border-wa-green/20">
              <BarChart3 className="h-4 w-4" /> Analytics
            </Link>
            <Link href="/assistant" className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-white hover:text-wa-green hover:shadow-md transition-all text-sm font-semibold text-text-secondary border border-transparent hover:border-wa-green/20">
              <Bot className="h-4 w-4 text-accent-indigo" /> AI Assistant
            </Link>

            <div className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2 px-3 mt-6">System</div>
            <Link href="/events" className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-white hover:text-wa-green hover:shadow-md transition-all text-sm font-semibold text-text-secondary border border-transparent hover:border-wa-green/20">
              <Activity className="h-4 w-4 text-accent-cyan" /> Events
            </Link>
          </div>
          
          <div className="mt-auto border-t border-dashed border-border-color pt-4 px-2">
            <div className="text-xs font-bold text-text-primary mb-1">TENANT_001</div>
            <div className="text-[11px] font-semibold text-text-secondary">Owner</div>
          </div>
        </nav>
        
        {/* Main Content Area */}
        <main className="flex-1 flex flex-col min-h-screen overflow-auto z-10">
          <header className="h-16 flex items-center px-8 bg-card/60 backdrop-blur-xl justify-between mx-6 mt-4 rounded-2xl border border-border-color shadow-[0_4px_12px_rgba(148,163,184,0.04),inset_2px_2px_4px_rgba(255,255,255,0.9)]">
            <div className="text-sm font-bold text-text-primary">
              WBOS Dashboard
            </div>
            
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-wa-green shadow-[0_0_8px_rgba(0,168,132,0.6)] animate-pulse"></span>
                <span className="text-[11px] font-bold text-wa-green-dark uppercase tracking-wide">AWS Backend — Connected</span>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-accent-indigo shadow-[0_0_8px_rgba(99,102,241,0.6)] animate-pulse"></span>
                <span className="text-[11px] font-bold text-accent-indigo uppercase tracking-wide">
                  {process.env.NEXT_PUBLIC_EXECUTION_MODE === 'demo' ? 'Demo Execution Adapter — Active' : 'Bedrock — Configured'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-accent-cyan shadow-[0_0_8px_rgba(6,182,212,0.6)] animate-pulse"></span>
                <span className="text-[11px] font-bold text-accent-cyan uppercase tracking-wide">Event Pipeline — Active</span>
              </div>
            </div>
          </header>
          
          <div className="flex-1 p-6">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}
