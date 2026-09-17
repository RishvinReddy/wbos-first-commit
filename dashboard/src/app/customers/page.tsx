import { Search, MapPin, Phone, MessageSquare, ShoppingCart, Clock, IndianRupee } from "lucide-react";
import Link from "next/link";

// Note: Customers are labeled as demo/static data, not live AWS metrics
const demoCustomers = [
  { id: "CUS-101", name: "Rahul Sharma", phone: "+91 98765 43210", address: "Andheri West, Mumbai", orders: 12, spent: 8420, lastActive: "2 mins ago", initial: "R" },
  { id: "CUS-102", name: "Priya Reddy", phone: "+91 91234 56789", address: "Bandra East, Mumbai", orders: 8, spent: 5210, lastActive: "1 hour ago", initial: "P" },
  { id: "CUS-103", name: "Arjun Kumar", phone: "+91 99887 76655", address: "Powai, Mumbai", orders: 6, spent: 3940, lastActive: "Tuesday", initial: "A" },
  { id: "CUS-104", name: "Sneha Gupta", phone: "+91 98765 11223", address: "Juhu, Mumbai", orders: 15, spent: 12450, lastActive: "Monday", initial: "S" },
];

export default function CustomersPage() {
  const primary = demoCustomers[0];

  return (
    <div className="space-y-6">
      <div>
        <div className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--wbos-muted)' }}>Customer</div>
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight" style={{ color: 'var(--wbos-ink)' }}>Customers</h1>
            <p className="text-sm font-medium mt-1" style={{ color: 'var(--wbos-muted)' }}>
              Demo data · {demoCustomers.length} profiles shown
            </p>
          </div>
        </div>
      </div>

      <div className="flex gap-6 min-h-[600px]">
        {/* Customer List */}
        <div className="w-72 shrink-0 rounded-xl border overflow-hidden flex flex-col"
          style={{ background: 'var(--wbos-surface)', borderColor: 'var(--wbos-border)', boxShadow: 'var(--shadow-card)' }}>
          
          <div className="p-3 border-b" style={{ borderColor: 'var(--wbos-border)', background: 'var(--wbos-bg)' }}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5" style={{ color: 'var(--wbos-muted)' }} />
              <input
                type="text"
                placeholder="Search customers…"
                className="w-full rounded-md pl-8 pr-3 py-2 text-sm outline-none border"
                style={{ 
                  background: 'var(--wbos-surface)', 
                  borderColor: 'var(--wbos-border)',
                  color: 'var(--wbos-ink)'
                }}
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y" style={{ borderColor: 'var(--wbos-border)' }}>
            {demoCustomers.map((c, i) => (
              <div key={c.id}
                className="flex items-center gap-3 px-4 py-3.5 cursor-pointer transition-colors hover:opacity-90"
                style={{ background: i === 0 ? 'var(--wbos-green-subtle)' : undefined }}>
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                  style={{ 
                    background: i === 0 ? 'var(--wbos-green)' : 'var(--wbos-border)',
                    color: i === 0 ? 'white' : 'var(--wbos-muted)'
                  }}>
                  {c.initial}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold truncate" style={{ color: 'var(--wbos-ink)' }}>{c.name}</div>
                  <div className="text-[11px]" style={{ color: 'var(--wbos-muted)' }}>
                    {c.orders} orders · ₹{c.spent.toLocaleString()}
                  </div>
                </div>
                {i === 0 && (
                  <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: 'var(--success)' }}></div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Profile Detail */}
        <div className="flex-1 space-y-4">
          {/* Header Card */}
          <div className="rounded-xl border overflow-hidden"
            style={{ background: 'var(--wbos-surface)', borderColor: 'var(--wbos-border)', boxShadow: 'var(--shadow-card)' }}>
            {/* Accent band */}
            <div className="h-20" style={{ background: 'var(--wbos-ink-surface)' }}></div>
            <div className="px-6 pb-5 relative">
              <div className="w-16 h-16 rounded-xl border-4 flex items-center justify-center text-white font-bold text-xl absolute -top-8"
                style={{ background: 'var(--wbos-green)', borderColor: 'var(--wbos-surface)' }}>
                {primary.initial}
              </div>
              <div className="mt-10 flex justify-between items-end">
                <div>
                  <h2 className="text-2xl font-extrabold" style={{ color: 'var(--wbos-ink)' }}>{primary.name}</h2>
                  <div className="flex items-center gap-5 mt-1 text-sm" style={{ color: 'var(--wbos-muted)' }}>
                    <span className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" />{primary.phone}</span>
                    <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" />{primary.address}</span>
                  </div>
                </div>
                <Link href="/conversations"
                  className="flex items-center gap-2 px-4 py-2 rounded-md border text-sm font-semibold transition-colors hover:opacity-80"
                  style={{ borderColor: 'var(--wbos-border)', color: 'var(--wbos-ink-soft)' }}>
                  <MessageSquare className="h-4 w-4" style={{ color: 'var(--wbos-green)' }} />
                  Message
                </Link>
              </div>
            </div>
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Total Spent", value: `₹${primary.spent.toLocaleString()}`, icon: IndianRupee },
              { label: "Total Orders", value: `${primary.orders}`, icon: ShoppingCart },
              { label: "Last Active", value: primary.lastActive, icon: Clock },
            ].map((kpi) => (
              <div key={kpi.label} className="rounded-xl border p-5"
                style={{ background: 'var(--wbos-surface)', borderColor: 'var(--wbos-border)', boxShadow: 'var(--shadow-card)' }}>
                <div className="flex items-center gap-2 mb-2" style={{ color: 'var(--wbos-muted)' }}>
                  <kpi.icon className="h-3.5 w-3.5" />
                  <span className="text-[11px] font-bold uppercase tracking-wider">{kpi.label}</span>
                </div>
                <div className="text-2xl font-extrabold" style={{ color: 'var(--wbos-ink)' }}>{kpi.value}</div>
              </div>
            ))}
          </div>

          {/* Recent orders — static demo, labeled clearly */}
          <div className="rounded-xl border overflow-hidden"
            style={{ background: 'var(--wbos-surface)', borderColor: 'var(--wbos-border)', boxShadow: 'var(--shadow-card)' }}>
            <div className="px-5 py-4 border-b flex items-center justify-between"
              style={{ borderColor: 'var(--wbos-border)', background: 'var(--wbos-bg)' }}>
              <h3 className="text-sm font-bold" style={{ color: 'var(--wbos-ink)' }}>Order History</h3>
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md"
                style={{ background: 'var(--wbos-border)', color: 'var(--wbos-muted)' }}>
                Demo Data
              </span>
            </div>
            <div className="divide-y" style={{ borderColor: 'var(--wbos-border)' }}>
              {[
                { id: "#1042", status: "Preparing", date: "Today, 10:45 AM", total: "₹540", items: "2kg Basmati Rice, 1L Cooking Oil" },
                { id: "#0988", status: "Delivered", date: "Aug 14, 2026", total: "₹1,240", items: "Weekly Groceries (12 items)" },
              ].map((order, i) => (
                <div key={i} className="px-5 py-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold font-mono" style={{ color: 'var(--wbos-ink)' }}>{order.id}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md"
                        style={{ 
                          background: order.status === 'Delivered' ? 'var(--success-soft)' : 'var(--warning-soft)',
                          color: order.status === 'Delivered' ? 'var(--success)' : 'var(--warning)'
                        }}>
                        {order.status}
                      </span>
                    </div>
                    <span className="text-sm font-bold" style={{ color: 'var(--wbos-ink)' }}>{order.total}</span>
                  </div>
                  <div className="text-xs mb-1" style={{ color: 'var(--wbos-muted)' }}>{order.date}</div>
                  <div className="text-sm" style={{ color: 'var(--wbos-ink-soft)' }}>{order.items}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
