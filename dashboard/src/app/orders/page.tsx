import { ShoppingCart, AlertTriangle, Clock, ArrowRight } from "lucide-react";
import Link from "next/link";
import { fetchOrders } from "@/lib/api";

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
    CONFIRMED: { bg: 'var(--success-soft)', color: 'var(--success)' },
    PREPARING: { bg: 'var(--info-soft)', color: 'var(--info)' },
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

export default async function OrdersPage() {
  let pipeline = { new: [] as any[], confirmed: [] as any[], preparing: [] as any[], delivery: [] as any[] };
  let allOrders: any[] = [];
  let error = null;

  try {
    const data = await fetchOrders();
    allOrders = data;
    data.forEach((order: any) => {
      const status = (order.status || "PENDING").toUpperCase();
      const obj = {
        id: order.orderId,
        customer: order.customer,
        time: new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        items: order.itemCount,
        total: order.total
      };
      if (status === "CONFIRMED") pipeline.confirmed.push(obj);
      else if (status === "PREPARING") pipeline.preparing.push(obj);
      else if (["READY", "DELIVERY"].includes(status)) pipeline.delivery.push(obj);
      else pipeline.new.push(obj);
    });
  } catch (err: any) {
    error = err.message || "Failed to fetch orders";
  }

  const columns = [
    { key: "new", label: "New", count: pipeline.new.length, color: 'var(--warning)', bg: 'var(--warning-soft)', orders: pipeline.new, status: "PENDING" },
    { key: "confirmed", label: "Confirmed", count: pipeline.confirmed.length, color: 'var(--success)', bg: 'var(--success-soft)', orders: pipeline.confirmed, status: "CONFIRMED" },
    { key: "preparing", label: "Preparing", count: pipeline.preparing.length, color: 'var(--info)', bg: 'var(--info-soft)', orders: pipeline.preparing, status: "PREPARING" },
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
              style={{ background: 'var(--success-soft)', color: 'var(--success)' }}>
              Auto-Confirm: ON
            </span>
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-md uppercase"
              style={{ background: 'var(--ai-soft)', color: 'var(--ai)' }}>
              AI Routing: ON
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 min-h-[500px]">
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
                {col.orders.length === 0 && !error && (
                  <div className="text-center text-xs py-8" style={{ color: 'var(--wbos-muted)' }}>
                    No orders
                  </div>
                )}
                {col.orders.map((order: any) => (
                  <div key={order.id} className="rounded-lg border p-3 transition-colors hover:opacity-90 cursor-pointer"
                    style={{ background: 'var(--wbos-surface)', borderColor: 'var(--wbos-border)' }}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold font-mono" style={{ color: 'var(--wbos-ink)' }}>{order.id}</span>
                      <div className="flex items-center gap-1" style={{ color: 'var(--wbos-muted)' }}>
                        <Clock className="h-3 w-3" />
                        <span className="text-[10px]">{order.time}</span>
                      </div>
                    </div>

                    <div className="text-sm font-semibold mb-1" style={{ color: 'var(--wbos-ink)' }}>{order.customer}</div>
                    <div className="text-xs mb-3" style={{ color: 'var(--wbos-muted)' }}>{order.items} items</div>

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
    </div>
  );
}
