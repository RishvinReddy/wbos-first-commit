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
  Bot,
  Search,
  Zap
} from "lucide-react";

const outfit = Outfit({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "WBOS — Business Operations OS",
  description: "Enterprise operations command center powered by AWS",
};

const navGroups = [
  {
    label: "Workspace",
    items: [
      { href: "/", icon: LayoutDashboard, label: "Overview" },
    ]
  },
  {
    label: "Customer",
    items: [
      { href: "/conversations", icon: MessageSquare, label: "Conversations" },
      { href: "/customers", icon: Users, label: "Customers" },
    ]
  },
  {
    label: "Operations",
    items: [
      { href: "/orders", icon: ShoppingCart, label: "Orders" },
      { href: "/inventory", icon: Package, label: "Inventory" },
      { href: "/delivery", icon: Truck, label: "Delivery" },
    ]
  },
  {
    label: "Intelligence",
    items: [
      { href: "/analytics", icon: BarChart3, label: "Analytics" },
      { href: "/assistant", icon: Bot, label: "AI Assistant" },
    ]
  },
  {
    label: "System",
    items: [
      { href: "/events", icon: Activity, label: "Events" },
    ]
  }
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isDemo = process.env.NEXT_PUBLIC_EXECUTION_MODE === 'demo';

  return (
    <html lang="en" className="h-full">
      <body className={`${outfit.className} antialiased flex h-full overflow-hidden`} style={{ background: 'var(--wbos-bg)', color: 'var(--wbos-ink)' }}>

        {/* ─── SIDEBAR ───────────────────────────────────── */}
        <nav className="w-60 flex flex-col h-screen shrink-0 border-r"
          style={{ 
            background: 'var(--wbos-surface)', 
            borderColor: 'var(--wbos-border)',
            boxShadow: 'var(--shadow-subtle)'
          }}>

          {/* Logo */}
          <div className="flex items-center gap-3 px-5 h-14 border-b shrink-0" style={{ borderColor: 'var(--wbos-border)' }}>
            <div className="w-7 h-7 rounded-md flex items-center justify-center text-white font-bold text-sm shrink-0"
              style={{ background: 'var(--wbos-green)' }}>
              W
            </div>
            <div className="leading-tight">
              <div className="font-extrabold text-sm tracking-tight" style={{ color: 'var(--wbos-ink)' }}>WBOS</div>
              <div className="text-[9px] font-bold uppercase tracking-widest" style={{ color: 'var(--wbos-muted)' }}>Business OS</div>
            </div>
          </div>

          {/* Command Entry */}
          <div className="px-3 py-3 border-b shrink-0" style={{ borderColor: 'var(--wbos-border)' }}>
            <Link href="/assistant"
              className="flex items-center gap-2 w-full px-3 py-2 rounded-md text-sm transition-colors group"
              style={{ background: 'var(--wbos-bg)', border: '1px solid var(--wbos-border)' }}>
              <Search className="h-3.5 w-3.5 shrink-0" style={{ color: 'var(--wbos-muted)' }} />
              <span className="text-sm flex-1" style={{ color: 'var(--wbos-muted)' }}>Ask WBOS anything…</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded hidden lg:inline-block"
                style={{ background: 'var(--wbos-border)', color: 'var(--wbos-muted)' }}>⌘K</span>
            </Link>
          </div>

          {/* Nav */}
          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-5">
            {navGroups.map((group) => (
              <div key={group.label}>
                <div className="text-[10px] font-bold uppercase tracking-widest px-2 mb-1.5"
                  style={{ color: 'var(--wbos-placeholder)' }}>
                  {group.label}
                </div>
                <div className="space-y-0.5">
                  {group.items.map((item) => (
                    <Link key={item.href} href={item.href}
                      className="flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm font-medium transition-all group hover:text-wbos-ink"
                      style={{ color: 'var(--wbos-ink-soft)' }}>
                      <item.icon className="h-4 w-4 shrink-0" style={{ color: 'var(--wbos-muted)' }} />
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* User Footer */}
          <div className="border-t px-4 py-3 shrink-0" style={{ borderColor: 'var(--wbos-border)' }}>
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                style={{ background: 'var(--wbos-green)' }}>
                O
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold leading-tight truncate" style={{ color: 'var(--wbos-ink)' }}>Owner</div>
                <div className="text-[10px] leading-tight" style={{ color: 'var(--wbos-muted)' }}>TENANT_001</div>
              </div>
              <div className="ml-auto flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--success)' }}></div>
              </div>
            </div>
          </div>
        </nav>

        {/* ─── MAIN ──────────────────────────────────────── */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

          {/* Top Bar */}
          <header className="h-14 shrink-0 flex items-center justify-between px-6 border-b"
            style={{ 
              background: 'var(--wbos-surface)', 
              borderColor: 'var(--wbos-border)',
              boxShadow: 'var(--shadow-subtle)'
            }}>

            <div className="flex items-center gap-1.5 text-sm" style={{ color: 'var(--wbos-muted)' }}>
              <Zap className="h-3.5 w-3.5" style={{ color: 'var(--wbos-green)' }} />
              <span className="font-semibold" style={{ color: 'var(--wbos-ink-soft)' }}>WBOS</span>
              <span>/</span>
              <span className="font-medium">Overview</span>
            </div>

            <div className="flex items-center gap-4">
              {/* AWS Status */}
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--success)' }}></div>
                <span className="text-xs font-semibold" style={{ color: 'var(--wbos-ink-soft)' }}>AWS Connected</span>
              </div>

              {/* Mode indicator */}
              <div className="flex items-center gap-2 px-3 py-1 rounded-md border text-xs font-bold"
                style={{ 
                  background: isDemo ? 'var(--wbos-bg)' : 'var(--success-soft)',
                  borderColor: isDemo ? 'var(--wbos-border)' : 'var(--success)',
                  color: isDemo ? 'var(--wbos-muted)' : 'var(--success)'
                }}>
                {isDemo ? 'DEMO' : 'LIVE'}
                {isDemo && <span className="font-normal hidden lg:inline" style={{ color: 'var(--wbos-placeholder)' }}>· Deterministic Adapter</span>}
              </div>

              {/* EventBridge Indicator */}
              <div className="hidden md:flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--event)' }}></div>
                <span className="text-xs font-semibold" style={{ color: 'var(--wbos-muted)' }}>EventBridge Active</span>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto">
            <div className="max-w-[1280px] mx-auto px-8 py-8">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
