"use client";

import { useState, useEffect } from "react";
import { IndianRupee, ShoppingCart, TrendingUp, Truck, ArrowRight, AlertTriangle, MessageSquare, Zap, Loader2 } from "lucide-react";
import { fetchMetrics, fetchOrders, fetchInventory } from "@/lib/api";
import Link from "next/link";

// ── Inline primitive components ──────────────────────────────────────────

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[10px] font-bold uppercase tracking-widest mb-3"
        style={{ color: 'var(--wbos-muted)' }}>
        {label}
      </div>
      {children}
    </div>
  );
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl border ${className}`}
      style={{
        background: 'var(--wbos-surface)',
        borderColor: 'var(--wbos-border)',
        boxShadow: 'var(--shadow-card)'
      }}>
      {children}
    </div>
  );
}

function StatusBadge({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="w-1.5 h-1.5 rounded-full" style={{ background: color }}></div>
      <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--wbos-muted)' }}>{label}</span>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────

export default function ExecutiveCockpit() {
  const [metrics, setMetrics] = useState({ total_sales: 0, order_count: 0, average_order_value: 0 });
  const [pipeline, setPipeline] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetchMetrics(),
      fetchOrders(),
      fetchInventory().catch(() => [])
    ]).then(([metricsData, ordersData, inventoryData]) => {
      setMetrics({
        total_sales: metricsData.total_sales ?? 0,
        order_count: metricsData.order_count ?? 0,
        average_order_value: metricsData.average_order_value ?? 0
      });
      setPipeline(ordersData.slice(0, 4));
      setInventory(inventoryData.map((item: any) => ({
        name: item.name,
        stock: item.stock,
        price: item.price,
        status: item.stock < 10 ? "low" : item.stock < 20 ? "warning" : "healthy",
        maxStock: Math.max(item.stock * 2, 50)
      })));
      setLoading(false);
    }).catch(err => {
      setError(err.message ?? "Failed to load live AWS data");
      setLoading(false);
    });
  }, []);

  const lowStock = inventory.filter(i => i.status === "low");
  const needsAttention = lowStock.length > 0;

  // Static demo conversations (not fabricated business metrics)
  const demoConversations = [
    { name: "Rahul Sharma", initial: "R", time: "2m ago", message: "I need 2kg basmati rice and cooking oil", aiIntent: "Order intent detected", active: true },
    { name: "Priya Reddy", initial: "P", time: "1h ago", message: "Perfect, thanks! I'll pay on delivery.", aiIntent: null, active: false },
  ];

  const systemFlow = [
    { label: "OrderCreated", source: "EventBridge", color: 'var(--success)' },
    { label: "InventoryUpdated", source: "DynamoDB", color: 'var(--event)' },
    { label: "InvoiceGenerated", source: "Lambda → S3", color: 'var(--ai)' },
    { label: "DashboardEvent", source: "EventBridge", color: 'var(--success)' },
  ];

  return (
    <div className="space-y-8">

      {/* ── HERO ────────────────────────────────────────────── */}
      <div>
        <div className="text-[10px] font-bold uppercase tracking-widest mb-2 flex items-center gap-2"
          style={{ color: 'var(--wbos-muted)' }}>
          <span>Overview</span>
          <span style={{ color: 'var(--wbos-border)' }}>·</span>
          <StatusBadge color="var(--success)" label="Live Data" />
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight leading-none mb-2"
          style={{ color: 'var(--wbos-ink)' }}>
          Good morning, Owner.
        </h1>
        <p className="text-base font-medium" style={{ color: 'var(--wbos-muted)' }}>
          Your business is running. Here's what happened today.
        </p>
      </div>

      {/* ── ERROR BANNER ────────────────────────────────────── */}
      {error && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold"
          style={{ background: 'var(--danger-soft)', border: '1px solid var(--danger)', color: 'var(--danger)' }}>
          <AlertTriangle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {/* ── BUSINESS PULSE (dark anchor) ────────────────────── */}
      <Section label="Business Pulse">
        <div className="rounded-xl overflow-hidden" style={{ background: 'var(--wbos-ink-surface)' }}>
          <div className="px-6 py-5 border-b flex items-center justify-between"
            style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
            <div className="text-xs font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.4)' }}>
              Business Pulse
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--success)' }}></div>
              <span className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.5)' }}>Live Data</span>
            </div>
          </div>

          <div className="grid grid-cols-3 divide-x" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
            {/* Revenue — primary metric */}
            <div className="px-6 py-6 col-span-1">
              <div className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'rgba(255,255,255,0.35)' }}>Revenue</div>
              <div className="text-5xl font-extrabold leading-none mb-1 flex items-start" style={{ color: 'white' }}>
                <span className="text-2xl font-bold mt-2 mr-1" style={{ color: 'var(--wbos-green)' }}>₹</span>
                {loading ? <Loader2 className="animate-spin h-8 w-8 mt-1 opacity-50" /> : metrics.total_sales.toLocaleString()}
              </div>
              <div className="text-xs font-medium mt-2" style={{ color: 'rgba(255,255,255,0.4)' }}>Live revenue</div>
            </div>

            {/* Orders */}
            <div className="px-6 py-6">
              <div className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'rgba(255,255,255,0.35)' }}>Orders</div>
              <div className="text-5xl font-extrabold leading-none mb-1" style={{ color: 'white' }}>
                {loading ? <Loader2 className="animate-spin h-8 w-8 mt-1 opacity-50" /> : metrics.order_count}
              </div>
              <div className="text-xs font-medium mt-2" style={{ color: 'rgba(255,255,255,0.4)' }}>Processed today</div>
            </div>

            {/* AOV */}
            <div className="px-6 py-6">
              <div className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'rgba(255,255,255,0.35)' }}>Avg Order</div>
              <div className="text-5xl font-extrabold leading-none mb-1 flex items-start" style={{ color: 'white' }}>
                <span className="text-2xl font-bold mt-2 mr-1" style={{ color: 'var(--wbos-muted)' }}>₹</span>
                {loading ? <Loader2 className="animate-spin h-8 w-8 mt-1 opacity-50" /> : metrics.average_order_value}
              </div>
              <div className="text-xs font-medium mt-2" style={{ color: 'rgba(255,255,255,0.4)' }}>Per order</div>
            </div>
          </div>
        </div>
      </Section>

      {/* ── NEEDS ATTENTION ─────────────────────────────────── */}
      {needsAttention && (
        <Section label="Needs Attention">
          <div className="space-y-2">
            {lowStock.map((item, i) => (
              <div key={i} className="flex items-center justify-between px-5 py-4 rounded-xl border"
                style={{ background: 'var(--warning-soft)', borderColor: 'var(--warning)' }}>
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-4 w-4 shrink-0" style={{ color: 'var(--warning)' }} />
                  <div>
                    <div className="text-sm font-bold" style={{ color: 'var(--wbos-ink)' }}>
                      Low Stock — {item.name}
                    </div>
                    <div className="text-xs font-medium" style={{ color: 'var(--wbos-muted)' }}>
                      {item.stock} units remaining
                    </div>
                  </div>
                </div>
                <Link href="/inventory" className="flex items-center gap-1.5 text-xs font-bold transition-colors hover:opacity-80"
                  style={{ color: 'var(--warning)' }}>
                  Reorder <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* ── OPERATIONS ROW ──────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Order Pipeline */}
        <div className="lg:col-span-8">
          <Section label="Live Operations">
            <Card>
              <div className="px-6 py-4 border-b flex items-center justify-between"
                style={{ borderColor: 'var(--wbos-border)' }}>
                <h2 className="text-sm font-bold" style={{ color: 'var(--wbos-ink)' }}>Order Pipeline</h2>
                <div className="text-[10px] font-bold uppercase px-2 py-1 rounded-md"
                  style={{ background: 'var(--success-soft)', color: 'var(--success)' }}>
                  Active
                </div>
              </div>

              <div className="p-4 space-y-3">
                {loading && (
                  <div className="text-center py-10 flex flex-col items-center justify-center gap-2" style={{ color: 'var(--wbos-muted)' }}>
                    <Loader2 className="animate-spin h-5 w-5 opacity-50" />
                    <span className="text-xs font-medium">Loading live pipeline...</span>
                  </div>
                )}
                
                {!loading && pipeline.length === 0 && !error && (
                  <div className="text-center py-10 text-sm font-medium"
                    style={{ color: 'var(--wbos-muted)', border: '1px dashed var(--wbos-border)', borderRadius: '8px' }}>
                    No active orders. Send a message to start the pipeline.
                  </div>
                )}

                {pipeline.map((order, i) => (
                  <div key={i} className="rounded-lg border overflow-hidden"
                    style={{ borderColor: 'var(--wbos-border)' }}>
                    {/* Order Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b"
                      style={{ background: 'var(--wbos-bg)', borderColor: 'var(--wbos-border)' }}>
                      <div className="flex items-center gap-3">
                        <ShoppingCart className="h-3.5 w-3.5" style={{ color: 'var(--wbos-muted)' }} />
                        <span className="text-sm font-bold font-mono" style={{ color: 'var(--wbos-ink)' }}>{order.orderId}</span>
                        <span className="text-xs font-medium px-2 py-0.5 rounded-md"
                          style={{ background: 'var(--warning-soft)', color: 'var(--warning)' }}>
                          Pending
                        </span>
                      </div>
                      <span className="text-xs" style={{ color: 'var(--wbos-muted)' }}>
                        {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    {/* Order Data */}
                    <div className="px-4 py-3 flex items-center justify-between">
                      <div className="flex gap-8 text-xs">
                        <div>
                          <div className="font-medium mb-0.5" style={{ color: 'var(--wbos-muted)' }}>Customer</div>
                          <div className="font-semibold" style={{ color: 'var(--wbos-ink)' }}>{order.customer}</div>
                        </div>
                        <div>
                          <div className="font-medium mb-0.5" style={{ color: 'var(--wbos-muted)' }}>Items</div>
                          <div className="font-semibold" style={{ color: 'var(--wbos-ink)' }}>{order.itemCount}</div>
                        </div>
                        <div>
                          <div className="font-medium mb-0.5" style={{ color: 'var(--wbos-muted)' }}>Value</div>
                          <div className="font-semibold" style={{ color: 'var(--wbos-ink)' }}>₹{order.total}</div>
                        </div>
                      </div>
                    </div>

                    {/* Execution Pipeline Trace */}
                    <div className="px-4 py-3 border-t flex items-center gap-2"
                      style={{ background: 'var(--wbos-bg)', borderColor: 'var(--wbos-border)' }}>
                      {["Order", "Inventory", "Invoice", "Event"].map((step, idx, arr) => (
                        <div key={step} className="flex items-center gap-2">
                          <div className="flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full"
                              style={{ background: idx === 0 ? 'var(--success)' : 'var(--wbos-border)' }}></div>
                            <span className="text-[11px] font-semibold"
                              style={{ color: idx === 0 ? 'var(--success)' : 'var(--wbos-muted)' }}>
                              {step}
                            </span>
                          </div>
                          {idx < arr.length - 1 && (
                            <span className="text-[11px]" style={{ color: 'var(--wbos-border)' }}>→</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </Section>
        </div>

        {/* Event Stream */}
        <div className="lg:col-span-4">
          <Section label="Event Stream">
            <Card className="h-full">
              <div className="px-5 py-4 border-b flex items-center justify-between"
                style={{ borderColor: 'var(--wbos-border)' }}>
                <h2 className="text-sm font-bold" style={{ color: 'var(--wbos-ink)' }}>Infrastructure</h2>
                <div className="text-[10px] font-bold flex items-center gap-1.5 uppercase">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--event)' }}></div>
                  <span style={{ color: 'var(--event)' }}>Operational</span>
                </div>
              </div>

              <div className="p-5">
                <div className="relative">
                  {/* Vertical line */}
                  <div className="absolute left-2 top-3 bottom-3 w-px" style={{ background: 'var(--wbos-border)' }}></div>

                  <div className="space-y-5">
                    {systemFlow.map((evt, i) => (
                      <div key={i} className="relative flex items-start gap-4 pl-7">
                        {/* Dot */}
                        <div className="absolute left-0 top-1 w-4 h-4 rounded-full border-2 flex items-center justify-center"
                          style={{ background: 'var(--wbos-surface)', borderColor: evt.color }}>
                          <div className="w-1.5 h-1.5 rounded-full" style={{ background: evt.color }}></div>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-bold mb-0.5" style={{ color: 'var(--wbos-ink)' }}>
                            {evt.label}
                          </div>
                          <div className="text-[11px]" style={{ color: 'var(--wbos-muted)' }}>
                            {evt.source}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </Section>
        </div>
      </div>

      {/* ── INVENTORY + CONVERSATIONS ───────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Inventory */}
        <Section label="Inventory">
          <Card>
            <div className="px-5 py-4 border-b flex items-center justify-between"
              style={{ borderColor: 'var(--wbos-border)' }}>
              <h2 className="text-sm font-bold" style={{ color: 'var(--wbos-ink)' }}>Stock Levels</h2>
              {lowStock.length > 0 && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md"
                  style={{ background: 'var(--danger-soft)', color: 'var(--danger)' }}>
                  {lowStock.length} Low Stock
                </span>
              )}
            </div>

            {/* Table header */}
            <div className="grid grid-cols-[1fr_60px_80px_70px] gap-3 px-5 py-2 text-[10px] font-bold uppercase tracking-wider border-b"
              style={{ color: 'var(--wbos-muted)', borderColor: 'var(--wbos-border)', background: 'var(--wbos-bg)' }}>
              <div>Product</div>
              <div className="text-center">Stock</div>
              <div>Level</div>
              <div className="text-right">Action</div>
            </div>

            <div className="divide-y" style={{ borderColor: 'var(--wbos-border)' }}>
              {loading && (
                <div className="text-center py-8 flex justify-center items-center gap-2 text-sm" style={{ color: 'var(--wbos-muted)' }}>
                  <Loader2 className="animate-spin h-4 w-4 opacity-50" />
                  Loading inventory...
                </div>
              )}
              {!loading && inventory.length === 0 && !error && (
                <div className="text-center py-8 text-sm" style={{ color: 'var(--wbos-muted)' }}>
                  No inventory data available.
                </div>
              )}
              {inventory.map((item, i) => {
                const pct = Math.min((item.stock / item.maxStock) * 100, 100);
                const barColor = item.status === 'low' ? 'var(--danger)' : item.status === 'warning' ? 'var(--warning)' : 'var(--success)';
                const statusColor = item.status === 'low' ? 'var(--danger)' : item.status === 'warning' ? 'var(--warning)' : 'var(--success)';
                const statusBg = item.status === 'low' ? 'var(--danger-soft)' : item.status === 'warning' ? 'var(--warning-soft)' : 'var(--success-soft)';
                
                return (
                  <div key={i} className="grid grid-cols-[1fr_60px_80px_70px] gap-3 items-center px-5 py-3.5 hover:opacity-90 transition-opacity"
                    style={{ background: i % 2 === 1 ? 'var(--wbos-bg)' : undefined }}>
                    <div>
                      <div className="text-sm font-semibold" style={{ color: 'var(--wbos-ink)' }}>{item.name}</div>
                      <div className="text-[11px]" style={{ color: 'var(--wbos-muted)' }}>₹{item.price} / unit</div>
                    </div>
                    <div className="text-sm font-bold text-center" style={{ color: 'var(--wbos-ink)' }}>{item.stock}</div>
                    <div>
                      <div className="w-full h-1.5 rounded-full overflow-hidden mb-1" style={{ background: 'var(--wbos-border)' }}>
                        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: barColor }}></div>
                      </div>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-sm"
                        style={{ background: statusBg, color: statusColor }}>
                        {item.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="text-right">
                      {item.status === 'low' ? (
                        <Link href="/inventory" className="text-[11px] font-bold flex items-center justify-end gap-1 transition-opacity hover:opacity-80"
                          style={{ color: 'var(--info)' }}>
                          Reorder <ArrowRight className="h-3 w-3" />
                        </Link>
                      ) : (
                        <span className="text-[11px]" style={{ color: 'var(--wbos-muted)' }}>—</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </Section>

        {/* Customer Inbox */}
        <Section label="Customer Inbox">
          <Card>
            <div className="px-5 py-4 border-b flex items-center justify-between"
              style={{ borderColor: 'var(--wbos-border)' }}>
              <h2 className="text-sm font-bold" style={{ color: 'var(--wbos-ink)' }}>Recent Conversations</h2>
              <Link href="/conversations" className="text-xs font-semibold flex items-center gap-1 transition-opacity hover:opacity-70"
                style={{ color: 'var(--wbos-green)' }}>
                Open inbox <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="divide-y" style={{ borderColor: 'var(--wbos-border)' }}>
              {demoConversations.map((conv, i) => (
                <Link key={i} href="/conversations"
                  className="flex items-start gap-4 px-5 py-4 transition-colors block hover:opacity-90"
                  style={{ background: conv.active ? 'var(--wbos-green-subtle)' : undefined }}>
                  {/* Avatar */}
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
                    style={{ background: conv.active ? 'var(--wbos-green)' : 'var(--wbos-border)' }}>
                    <span style={{ color: conv.active ? 'white' : 'var(--wbos-muted)' }}>{conv.initial}</span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between mb-1">
                      <span className="text-sm font-bold" style={{ color: 'var(--wbos-ink)' }}>{conv.name}</span>
                      <span className="text-[11px]" style={{ color: 'var(--wbos-muted)' }}>{conv.time}</span>
                    </div>

                    <div className="text-sm mb-2 truncate" style={{ color: 'var(--wbos-ink-soft)' }}>
                      {conv.message}
                    </div>

                    {conv.aiIntent && (
                      <div className="flex items-center gap-1.5 text-[11px] font-semibold"
                        style={{ color: 'var(--ai)' }}>
                        <Zap className="h-3 w-3" />
                        AI — {conv.aiIntent}
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </Card>
        </Section>
      </div>
    </div>
  );
}
