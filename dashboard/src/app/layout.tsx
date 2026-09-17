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
      <body className={`${outfit.className} antialiased flex bg-wbos-bg text-wbos-ink`}>
        {/* Subtle radial glow */}
        <div className="absolute inset-0 z-0 pointer-events-none" style={{
          background: 'radial-gradient(900px circle at 85% 5%, rgba(0, 168, 132, 0.035), transparent 60%)'
        }}></div>

        {/* Sidebar Navigation */}
        <nav className="w-64 border-r border-wbos-border bg-wbos-bg flex flex-col p-4 z-10 pb-8 h-screen overflow-y-auto">
          <div className="mb-8 flex items-center gap-3 px-2">
            <div className="h-8 w-8 rounded-lg bg-wbos-green flex items-center justify-center text-white font-bold text-lg shadow-sm">
              W
            </div>
            <div>
              <h1 className="text-lg font-extrabold tracking-tight text-wbos-ink leading-tight">WBOS</h1>
              <div className="text-[10px] font-semibold text-wbos-muted uppercase tracking-widest leading-tight">Command Center</div>
            </div>
          </div>
          
          <div className="space-y-1 flex-1">
            <div className="text-[11px] font-bold text-wbos-muted uppercase tracking-wider mb-2 px-3 mt-4">Workspace</div>
            <Link href="/" className="flex items-center gap-3 rounded-md px-3 py-2 bg-success-soft text-success font-semibold text-sm transition-all">
              <LayoutDashboard className="h-4 w-4" /> Overview
            </Link>
            <Link href="/conversations" className="flex items-center gap-3 rounded-md px-3 py-2 hover:bg-wbos-surface hover:text-wbos-ink transition-all text-sm font-medium text-wbos-ink-soft">
              <MessageSquare className="h-4 w-4 text-wbos-muted" /> Conversations
            </Link>
            <Link href="/customers" className="flex items-center gap-3 rounded-md px-3 py-2 hover:bg-wbos-surface hover:text-wbos-ink transition-all text-sm font-medium text-wbos-ink-soft">
              <Users className="h-4 w-4 text-wbos-muted" /> Customers
            </Link>

            <div className="text-[11px] font-bold text-wbos-muted uppercase tracking-wider mb-2 px-3 mt-6">Operations</div>
            <Link href="/orders" className="flex items-center gap-3 rounded-md px-3 py-2 hover:bg-wbos-surface hover:text-wbos-ink transition-all text-sm font-medium text-wbos-ink-soft">
              <ShoppingCart className="h-4 w-4 text-wbos-muted" /> Orders
            </Link>
            <Link href="/inventory" className="flex items-center gap-3 rounded-md px-3 py-2 hover:bg-wbos-surface hover:text-wbos-ink transition-all text-sm font-medium text-wbos-ink-soft">
              <Package className="h-4 w-4 text-wbos-muted" /> Inventory
            </Link>
            <Link href="/delivery" className="flex items-center gap-3 rounded-md px-3 py-2 hover:bg-wbos-surface hover:text-wbos-ink transition-all text-sm font-medium text-wbos-ink-soft">
              <Truck className="h-4 w-4 text-wbos-muted" /> Delivery
            </Link>

            <div className="text-[11px] font-bold text-wbos-muted uppercase tracking-wider mb-2 px-3 mt-6">Intelligence</div>
            <Link href="/analytics" className="flex items-center gap-3 rounded-md px-3 py-2 hover:bg-wbos-surface hover:text-wbos-ink transition-all text-sm font-medium text-wbos-ink-soft">
              <BarChart3 className="h-4 w-4 text-wbos-muted" /> Analytics
            </Link>
            <Link href="/assistant" className="flex items-center gap-3 rounded-md px-3 py-2 hover:bg-wbos-surface hover:text-wbos-ink transition-all text-sm font-medium text-wbos-ink-soft">
              <Bot className="h-4 w-4 text-wbos-muted" /> AI Assistant
            </Link>

            <div className="text-[11px] font-bold text-wbos-muted uppercase tracking-wider mb-2 px-3 mt-6">System</div>
            <Link href="/events" className="flex items-center gap-3 rounded-md px-3 py-2 hover:bg-wbos-surface hover:text-wbos-ink transition-all text-sm font-medium text-wbos-ink-soft">
              <Activity className="h-4 w-4 text-wbos-muted" /> Events
            </Link>
          </div>
          
          <div className="mt-auto border-t border-wbos-border pt-4 px-3 flex items-center gap-3">
            <div className="h-2 w-2 rounded-full bg-wbos-ink-soft"></div>
            <div>
              <div className="text-xs font-bold text-wbos-ink">TENANT_001</div>
              <div className="text-[11px] font-medium text-wbos-muted">Owner</div>
            </div>
          </div>
        </nav>
        
        {/* Main Content Area */}
        <main className="flex-1 flex flex-col min-h-screen overflow-auto z-10 relative">
          <header className="h-14 flex items-center px-6 border-b border-wbos-border bg-wbos-surface/80 backdrop-blur-md justify-between">
            <div className="text-sm font-semibold text-wbos-ink-soft flex items-center gap-2">
              <span>Overview</span>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-success"></span>
                <span className="text-xs font-medium text-wbos-ink">AWS Connected</span>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-wbos-muted px-2 py-0.5 bg-wbos-bg border border-wbos-border rounded-md">
                  {process.env.NEXT_PUBLIC_EXECUTION_MODE === 'demo' ? 'DEMO' : 'LIVE'}
                </span>
                {process.env.NEXT_PUBLIC_EXECUTION_MODE === 'demo' && (
                  <span className="text-xs text-wbos-muted hidden md:inline-block">Deterministic Execution Adapter</span>
                )}
              </div>
            </div>
          </header>
          
          <div className="flex-1 p-8">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}
