"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { IndianRupee, ShoppingCart, TrendingUp, Users } from "lucide-react";

// NOTE: All analytics data below is DEMO static data — not live DynamoDB figures.
const demoSalesData = [
  { name: 'Mon', revenue: 4000, orders: 24 },
  { name: 'Tue', revenue: 3000, orders: 13 },
  { name: 'Wed', revenue: 2000, orders: 98 },
  { name: 'Thu', revenue: 2780, orders: 39 },
  { name: 'Fri', revenue: 1890, orders: 48 },
  { name: 'Sat', revenue: 2390, orders: 38 },
  { name: 'Sun', revenue: 3490, orders: 43 },
];

const demoProductData = [
  { name: 'Basmati Rice', sales: 400 },
  { name: 'Cooking Oil', sales: 300 },
  { name: 'Sugar', sales: 300 },
  { name: 'Atta', sales: 200 },
  { name: 'Tea', sales: 278 },
];

export default function AnalyticsPage() {
  const kpis = [
    { label: "Total Sales", icon: IndianRupee, value: "₹19,550" },
    { label: "Total Orders", icon: ShoppingCart, value: "303" },
    { label: "Avg Order", icon: TrendingUp, value: "₹64.50" },
    { label: "Customers", icon: Users, value: "142" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <div className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--wbos-muted)' }}>Intelligence</div>
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight" style={{ color: 'var(--wbos-ink)' }}>Analytics</h1>
            <p className="text-sm font-medium mt-1" style={{ color: 'var(--wbos-muted)' }}>
              Business intelligence &amp; operational trends
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold px-2 py-1 rounded-md"
              style={{ background: 'var(--warning-soft)', color: 'var(--warning)' }}>
              DEMO DATA — Not live AWS metrics
            </span>
            <select className="rounded-md border px-3 py-1.5 text-sm font-medium outline-none"
              style={{ 
                background: 'var(--wbos-surface)', 
                borderColor: 'var(--wbos-border)',
                color: 'var(--wbos-ink-soft)'
              }}>
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
            </select>
          </div>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-4 gap-4">
        {kpis.map((kpi) => (
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

      {/* Revenue + Orders chart */}
      <div className="rounded-xl border overflow-hidden"
        style={{ background: 'var(--wbos-surface)', borderColor: 'var(--wbos-border)', boxShadow: 'var(--shadow-card)' }}>
        <div className="px-5 py-4 border-b flex items-center justify-between"
          style={{ borderColor: 'var(--wbos-border)', background: 'var(--wbos-bg)' }}>
          <h2 className="text-sm font-bold" style={{ color: 'var(--wbos-ink)' }}>Revenue &amp; Order Trend</h2>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 inline-block rounded" style={{ background: 'var(--success)' }}></span>Revenue</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 inline-block rounded" style={{ background: 'var(--ai)' }}></span>Orders</span>
          </div>
        </div>
        <div className="p-5">
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={demoSalesData} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E4E7EC" vertical={false} />
                <XAxis dataKey="name" stroke="#98A2B3" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis yAxisId="left" stroke="#98A2B3" fontSize={11} tickLine={false} axisLine={false} tickFormatter={v => `₹${v}`} />
                <YAxis yAxisId="right" orientation="right" stroke="#98A2B3" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #E4E7EC', boxShadow: '0 4px 12px rgba(0,0,0,0.06)', fontSize: '12px' }} />
                <Line yAxisId="left" type="monotone" dataKey="revenue" stroke="#00A884" strokeWidth={2.5} dot={false} name="Revenue (₹)" />
                <Line yAxisId="right" type="monotone" dataKey="orders" stroke="#6366F1" strokeWidth={2.5} dot={false} name="Orders" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Product chart + Insights */}
      <div className="grid grid-cols-2 gap-6">
        <div className="rounded-xl border overflow-hidden"
          style={{ background: 'var(--wbos-surface)', borderColor: 'var(--wbos-border)', boxShadow: 'var(--shadow-card)' }}>
          <div className="px-5 py-4 border-b"
            style={{ borderColor: 'var(--wbos-border)', background: 'var(--wbos-bg)' }}>
            <h2 className="text-sm font-bold" style={{ color: 'var(--wbos-ink)' }}>Top Products by Volume</h2>
          </div>
          <div className="p-5">
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={demoProductData} layout="vertical" margin={{ top: 0, right: 10, left: 30, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E4E7EC" horizontal={false} />
                  <XAxis type="number" stroke="#98A2B3" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis dataKey="name" type="category" stroke="#667085" fontSize={11} fontWeight={500} tickLine={false} axisLine={false} />
                  <Tooltip cursor={{ fill: 'rgba(0,0,0,0.02)' }} contentStyle={{ borderRadius: '8px', border: '1px solid #E4E7EC', fontSize: '12px' }} />
                  <Bar dataKey="sales" fill="#0891B2" radius={[0, 4, 4, 0]} barSize={16} name="Units Sold" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="rounded-xl border overflow-hidden"
          style={{ background: 'var(--wbos-surface)', borderColor: 'var(--wbos-border)', boxShadow: 'var(--shadow-card)' }}>
          <div className="px-5 py-4 border-b"
            style={{ borderColor: 'var(--wbos-border)', background: 'var(--wbos-bg)' }}>
            <h2 className="text-sm font-bold" style={{ color: 'var(--wbos-ink)' }}>Operational Insights</h2>
          </div>
          <div className="p-5 space-y-3">
            <div className="p-4 rounded-lg"
              style={{ background: 'var(--warning-soft)', border: '1px solid var(--warning)' }}>
              <div className="text-sm font-bold mb-1" style={{ color: 'var(--warning)' }}>Peak ordering time detected</div>
              <div className="text-xs" style={{ color: 'var(--wbos-ink-soft)' }}>Orders spike 35% between 10–11 AM over last 3 days.</div>
            </div>
            <div className="p-4 rounded-lg"
              style={{ background: 'var(--success-soft)', border: '1px solid var(--success)' }}>
              <div className="text-sm font-bold mb-1" style={{ color: 'var(--success)' }}>High customer retention</div>
              <div className="text-xs" style={{ color: 'var(--wbos-ink-soft)' }}>62% of customers this week were repeat buyers.</div>
            </div>
            <div className="text-[10px] font-bold uppercase" style={{ color: 'var(--wbos-muted)' }}>
              Demo data — Insights are illustrative
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
