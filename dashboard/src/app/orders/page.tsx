"use client";

import { useState, useEffect } from "react";
import { ShoppingCart, AlertTriangle, Clock, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { fetchOrders } from "@/lib/api";
import OrderDetailDrawer from "@/components/OrderDetailDrawer";

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

function StatusPill({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string }> = {
    PENDING: { bg: 'var(--warning-soft)', color: 'var(--warning)' },
    PENDING: { bg: 'var(--warning-soft)', color: 'var(--warning)' },
    CONFIRMED: { bg: 'var(--success-soft)', color: 'var(--success)' },
    PREPARING: { bg: 'var(--info-soft)', color: 'var(--info)' },
    READY: { bg: 'var(--success-soft)', color: 'var(--success)' },
    DELIVERY: { bg: 'var(--event-soft)', color: 'var(--event)' },
  };
  const { bg, color } = map[status] ?? { bg: 'var(--wbos-bg)', color: 'var(--wbos-muted)' };
  return (
    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md uppercase"
      style={{ background: bg, color }}>
      {status}
    </span>
  );
}

const DEMO_CUSTOMERS: Record<string, string> = {
  "+919876543210": "Rahul Sharma",
  "OWNER_USER": "Owner (Test)"
};

function formatTime(dateStr: string) {
  if (!dateStr) return "--:--";
  // Fix backend double timezone bug (e.g. 2026-09-18T08:18:17.123456+00:00Z)
  const cleaned = dateStr.replace(/\+00:00Z$/, "Z");
  const date = new Date(cleaned);
  if (isNaN(date.getTime())) return "Invalid";
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function OrdersPage() {
  const [pipeline, setPipeline] = useState({ new: [] as any[], confirmed: [] as any[], preparing: [] as any[], ready: [] as any[], delivery: [] as any[] });
  const [allOrders, setAllOrders] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const loadOrders = () => {
    setLoading(true);
    fetchOrders().then((data) => {
      setAllOrders(data);
      const newPipeline = { new: [] as any[], confirmed: [] as any[], preparing: [] as any[], ready: [] as any[], delivery: [] as any[] };
      data.forEach((order: any) => {
        const status = (order.status || "PENDING").toUpperCase();
        const obj = {
          id: order.orderId,
          customer: DEMO_CUSTOMERS[order.customer] || order.customer,
          time: formatTime(order.createdAt),
          items: order.itemCount,
          total: order.total,
          workerId: order.workerId,
          driverId: order.driverId
        };
        if (status === "CONFIRMED") newPipeline.confirmed.push(obj);
        else if (status === "PREPARING") newPipeline.preparing.push(obj);
        else if (status === "READY") newPipeline.ready.push(obj);
        else if (status === "DELIVERY") newPipeline.delivery.push(obj);
        else newPipeline.new.push(obj);
      });
      setPipeline(newPipeline);
      setLoading(false);
    }).catch(err => {
      setError(err.message || "Failed to fetch orders");
      setLoading(false);
    });
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const columns = [
    { key: "new", label: "New", count: pipeline.new.length, color: 'var(--warning)', bg: 'var(--warning-soft)', orders: pipeline.new, status: "PENDING" },
    { key: "confirmed", label: "Confirmed", count: pipeline.confirmed.length, color: 'var(--success)', bg: 'var(--success-soft)', orders: pipeline.confirmed, status: "CONFIRMED" },
    { key: "preparing", label: "Preparing", count: pipeline.preparing.length, color: 'var(--info)', bg: 'var(--info-soft)', orders: pipeline.preparing, status: "PREPARING" },
    { key: "ready", label: "Ready", count: pipeline.ready.length, color: 'var(--success)', bg: 'var(--success-soft)', orders: pipeline.ready, status: "READY" },
    { key: "delivery", label: "Delivery", count: pipeline.delivery.length, color: 'var(--event)', bg: 'var(--event-soft)', orders: pipeline.delivery, status: "DELIVERY" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <div className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--wbos-muted)' }}>Operations</div>
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight" style={{ color: 'var(--wbos-ink)' }}>Orders</h1>
            <p className="text-sm font-medium mt-1" style={{ color: 'var(--wbos-muted)' }}>
              Pipeline execution · {allOrders.length} total
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-md uppercase"
              style={{ background: 'var(--wbos-surface)', color: 'var(--wbos-muted)', border: '1px solid var(--wbos-border)' }}>
              Auto-Confirm: CONFIGURED
            </span>
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-md uppercase"
              style={{ background: 'var(--ai-soft)', color: 'var(--ai)' }}>
              Intent Routing: ON
            </span>
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold"
          style={{ background: 'var(--danger-soft)', border: '1px solid var(--danger)', color: 'var(--danger)' }}>
          <AlertTriangle className="h-4 w-4 shrink-0" /> {error}
        </div>
      )}

      <Section label="Kanban Pipeline">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 min-h-[500px]">
          {columns.map((col) => (
            <div key={col.key} className="flex flex-col rounded-xl border overflow-hidden"
              style={{ background: 'var(--wbos-surface)', borderColor: 'var(--wbos-border)', boxShadow: 'var(--shadow-card)' }}>
              {/* Column Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b"
                style={{ background: 'var(--wbos-bg)', borderColor: 'var(--wbos-border)' }}>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: col.color }}></div>
                  <span className="text-xs font-bold" style={{ color: 'var(--wbos-ink)' }}>{col.label}</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                  style={{ background: col.bg, color: col.color }}>
                  {col.count}
                </span>
              </div>

              {/* Orders */}
              <div className="flex-1 p-3 space-y-2 overflow-y-auto">
                {loading && (
                  <div className="text-center py-8 flex justify-center text-sm" style={{ color: 'var(--wbos-muted)' }}>
                    <Loader2 className="animate-spin h-5 w-5 opacity-50" />
                  </div>
                )}
                {!loading && col.orders.length === 0 && !error && (
                  <div className="text-center text-xs py-8" style={{ color: 'var(--wbos-muted)' }}>
                    No orders
                  </div>
                )}
                {col.orders.map((order: any) => (
                  <div key={order.id} onClick={() => setSelectedOrderId(order.id)} className="rounded-lg border p-3 transition-colors hover:opacity-90 cursor-pointer"
                    style={{ background: 'var(--wbos-surface)', borderColor: 'var(--wbos-border)' }}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold font-mono" style={{ color: 'var(--wbos-ink)' }}>{order.id}</span>
                      <div className="flex items-center gap-1" style={{ color: 'var(--wbos-muted)' }}>
                        <Clock className="h-3 w-3" />
                        <span className="text-[10px]">{order.time}</span>
                      </div>
                    </div>

                    <div className="text-sm font-semibold mb-1" style={{ color: 'var(--wbos-ink)' }}>{order.customer}</div>
                    <div className="text-xs mb-3" style={{ color: 'var(--wbos-muted)' }}>{order.items} item(s)</div>

                    {(order.workerId || order.driverId) && (
                      <div className="mb-3 px-2 py-1.5 rounded bg-black/5 flex items-center gap-1.5">
                        <span className="text-[10px]">👤</span>
                        <span className="text-[10px] font-bold" style={{ color: 'var(--wbos-ink)' }}>
                           {order.workerId || order.driverId}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t"
                      style={{ borderColor: 'var(--wbos-border)' }}>
                      <span className="text-sm font-bold" style={{ color: 'var(--wbos-ink)' }}>₹{order.total}</span>
                      <StatusPill status={col.status} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Section>
      
      {selectedOrderId && (
         <OrderDetailDrawer 
           orderId={selectedOrderId} 
           onClose={() => setSelectedOrderId(null)} 
           onUpdate={() => loadOrders()} 
         />
      )}
    </div>
  );
}
