"use client";

import { useState, useEffect, type DragEvent } from "react";
import { AlertTriangle, Clock, GripVertical, Loader2, X } from "lucide-react";
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
    NEW: { bg: 'var(--warning-soft)', color: 'var(--warning)' },
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
  const cleaned = dateStr.replace(/\+00:00Z$/, "Z");
  const date = new Date(cleaned);
  if (isNaN(date.getTime())) return "Invalid";
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function OrdersPage() {
  const [pipeline, setPipeline] = useState({ new: [] as any[], confirmed: [] as any[], preparing: [] as any[], ready: [] as any[], delivery: [] as any[], delivered: [] as any[] });
  const [allOrders, setAllOrders] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const [draggingOrderId, setDraggingOrderId] = useState<string | null>(null);
  const [draggingStatus, setDraggingStatus] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<string | null>(null);
  const [transitioningOrderId, setTransitioningOrderId] = useState<string | null>(null);
  const [transitionError, setTransitionError] = useState<string | null>(null);
  const [assignmentTransition, setAssignmentTransition] = useState<{
    orderId: string;
    transition: "START_PREPARATION" | "DISPATCH";
    role: "PACKER" | "DELIVERY_DRIVER";
  } | null>(null);
  const [workers, setWorkers] = useState<any[]>([]);
  const [selectedWorker, setSelectedWorker] = useState("");

  const loadOrders = () => {
    setLoading(true);
    fetchOrders().then((data) => {
      setAllOrders(data);
      const newPipeline = { new: [] as any[], confirmed: [] as any[], preparing: [] as any[], ready: [] as any[], delivery: [] as any[], delivered: [] as any[] };
      data.forEach((order: any) => {
        const status = (order.status || "PENDING").toUpperCase();
        const obj = {
          id: order.orderId,
          customer: DEMO_CUSTOMERS[order.customer] || order.customer,
          time: formatTime(order.createdAt),
          items: order.itemCount,
          total: order.total,
          workerId: order.workerId,
          driverId: order.driverId,
          status: status === "PENDING" ? "NEW" : status,
        };
        if (status === "CONFIRMED") newPipeline.confirmed.push(obj);
        else if (status === "PREPARING") newPipeline.preparing.push(obj);
        else if (status === "READY") newPipeline.ready.push(obj);
        else if (status === "DELIVERY") newPipeline.delivery.push(obj);
        else if (status === "DELIVERED") newPipeline.delivered.push(obj);
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
    { key: "new", label: "New", count: pipeline.new.length, color: 'var(--warning)', bg: 'var(--warning-soft)', orders: pipeline.new, status: "NEW" },
    { key: "confirmed", label: "Confirmed", count: pipeline.confirmed.length, color: 'var(--success)', bg: 'var(--success-soft)', orders: pipeline.confirmed, status: "CONFIRMED" },
    { key: "preparing", label: "Preparing", count: pipeline.preparing.length, color: 'var(--info)', bg: 'var(--info-soft)', orders: pipeline.preparing, status: "PREPARING" },
    { key: "ready", label: "Ready", count: pipeline.ready.length, color: 'var(--success)', bg: 'var(--success-soft)', orders: pipeline.ready, status: "READY" },
    { key: "delivery", label: "Delivery", count: pipeline.delivery.length, color: 'var(--event)', bg: 'var(--event-soft)', orders: pipeline.delivery, status: "DELIVERY" },
    { key: "delivered", label: "Delivered", count: pipeline.delivered.length, color: 'var(--success)', bg: 'var(--success-soft)', orders: pipeline.delivered, status: "DELIVERED" },
  ];

  const dragTransitions: Record<string, { transition: "CONFIRM" | "START_PREPARATION" | "COMPLETE_PREPARATION" | "DISPATCH" | "DELIVER"; role?: "PACKER" | "DELIVERY_DRIVER" }> = {
    "NEW->CONFIRMED": { transition: "CONFIRM" },
    "CONFIRMED->PREPARING": { transition: "START_PREPARATION", role: "PACKER" },
    "PREPARING->READY": { transition: "COMPLETE_PREPARATION" },
    "READY->DELIVERY": { transition: "DISPATCH", role: "DELIVERY_DRIVER" },
    "DELIVERY->DELIVERED": { transition: "DELIVER" },
  };

  const getDragTransition = (from: string | null, to: string) => {
    if (!from) return null;
    return dragTransitions[`${from}->${to}`] ?? null;
  };

  const executeTransition = async (orderId: string, transition: string, payload: Record<string, string> = {}) => {
    try {
      setTransitioningOrderId(orderId);
      setTransitionError(null);
      const token = localStorage.getItem("wbos_token");
      const res = await fetch(`/api/orders/${orderId}/transition`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ transition, ...payload }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Order transition failed");
      }
      await loadOrders();
    } catch (err: any) {
      setTransitionError(err.message || "Order transition failed");
    } finally {
      setTransitioningOrderId(null);
    }
  };

  const handleDragStart = (event: DragEvent<HTMLDivElement>, order: any) => {
    if (transitioningOrderId) return;
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", order.id);
    setDraggingOrderId(order.id);
    setDraggingStatus(order.status);
    setDropTarget(null);
  };

  const handleDragEnd = () => {
    setDraggingOrderId(null);
    setDraggingStatus(null);
    setDropTarget(null);
  };

  const canDropOn = (targetStatus: string) => {
    return Boolean(draggingOrderId && getDragTransition(draggingStatus, targetStatus));
  };

  const handleDrop = async (event: DragEvent<HTMLDivElement>, targetStatus: string) => {
    event.preventDefault();
    const orderId = event.dataTransfer.getData("text/plain") || draggingOrderId;
    const transition = getDragTransition(draggingStatus, targetStatus);
    setDropTarget(null);

    if (!orderId || !transition) {
      handleDragEnd();
      return;
    }

    if (transition.role) {
      try {
        const token = localStorage.getItem("wbos_token");
        const res = await fetch("/api/workers", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          throw new Error("Failed to load workers");
        }
        setWorkers(await res.json());
        setSelectedWorker("");
        setAssignmentTransition({
          orderId,
          transition: transition.transition as "START_PREPARATION" | "DISPATCH",
          role: transition.role,
        });
      } catch (err: any) {
        setTransitionError(err.message || "Failed to load workers");
      }
      handleDragEnd();
      return;
    }

    handleDragEnd();
    await executeTransition(orderId, transition.transition);
  };

  return (
    <div className="space-y-6 relative">
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

      {(error || transitionError) && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold"
          style={{ background: 'var(--danger-soft)', border: '1px solid var(--danger)', color: 'var(--danger)' }}>
          <AlertTriangle className="h-4 w-4 shrink-0" /> {error || transitionError}
        </div>
      )}

      <Section label="Kanban Pipeline">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 min-h-[500px] overflow-x-auto pb-4">
          {columns.map((col) => {
            const validDropTarget = canDropOn(col.status);
            return (
              <div key={col.key} className="flex flex-col rounded-xl border overflow-hidden transition-all"
                onDragOver={(event) => {
                  if (!validDropTarget) return;
                  event.preventDefault();
                  event.dataTransfer.dropEffect = "move";
                  setDropTarget(col.key);
                }}
                onDragLeave={() => {
                  if (dropTarget === col.key) {
                    setDropTarget(null);
                  }
                }}
                onDrop={(event) => handleDrop(event, col.status)}
                style={{ 
                  background: 'var(--wbos-surface)', 
                  borderColor: dropTarget === col.key ? 'var(--wbos-ink)' : 'var(--wbos-border)', 
                  boxShadow: dropTarget === col.key ? '0 0 0 2px var(--wbos-ink)' : 'var(--shadow-card)' 
                }}>
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
                  {draggingOrderId && validDropTarget && (
                    <div className="rounded-lg border border-dashed px-3 py-2 text-[10px] font-bold uppercase tracking-wide text-center"
                      style={{ borderColor: 'var(--wbos-ink)', color: 'var(--wbos-ink)', background: 'var(--wbos-bg)' }}>
                      Drop to move to {col.label}
                    </div>
                  )}
                  {col.orders.map((order: any) => (
                    <div key={order.id} 
                      draggable={transitioningOrderId === null}
                      onDragStart={(event) => handleDragStart(event, order)}
                      onDragEnd={handleDragEnd}
                      onClick={() => {
                        if (!draggingOrderId) {
                          setSelectedOrderId(order.id);
                        }
                      }} 
                      className="rounded-lg border p-3 transition-all hover:opacity-90 cursor-grab active:cursor-grabbing"
                      style={{ 
                        background: 'var(--wbos-surface)', 
                        borderColor: draggingOrderId === order.id ? 'var(--wbos-ink)' : 'var(--wbos-border)', 
                        opacity: draggingOrderId === order.id ? 0.5 : 1 
                      }}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1.5">
                          <GripVertical className="h-3.5 w-3.5" style={{ color: 'var(--wbos-muted)' }} />
                          <span className="text-xs font-bold font-mono" style={{ color: 'var(--wbos-ink)' }}>{order.id}</span>
                        </div>
                        <div className="flex items-center gap-1" style={{ color: 'var(--wbos-muted)' }}>
                          {transitioningOrderId === order.id ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <Clock className="h-3 w-3" />
                          )}
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
            );
          })}
        </div>
      </Section>

      <p className="text-xs" style={{ color: 'var(--wbos-muted)' }}>
        Drag an order to the next lifecycle stage. Assignment-required moves will ask for a worker or driver.
      </p>

      {selectedOrderId && (
         <OrderDetailDrawer 
           orderId={selectedOrderId} 
           onClose={() => setSelectedOrderId(null)} 
           onUpdate={() => loadOrders()} 
         />
      )}

      {assignmentTransition && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="w-full max-w-md rounded-2xl p-6 shadow-2xl border"
            style={{ background: "var(--wbos-bg)", borderColor: "var(--wbos-border)" }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold" style={{ color: "var(--wbos-ink)" }}>
                Assign {assignmentTransition.role === "PACKER" ? "Packing Worker" : "Delivery Driver"}
              </h2>
              <button
                onClick={() => setAssignmentTransition(null)}
                className="rounded-full p-2 hover:bg-black/5 transition-colors"
                style={{ color: "var(--wbos-muted)" }}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-3 mb-6 max-h-[300px] overflow-y-auto">
              {workers.filter(w => w.role === assignmentTransition.role).length === 0 && (
                <div className="text-sm p-4 text-center rounded-xl bg-black/5" style={{ color: "var(--wbos-muted)" }}>
                  No available workers found for role {assignmentTransition.role}
                </div>
              )}
              {workers
                .filter((w: any) => w.role === assignmentTransition.role)
                .map((worker: any) => (
                  <label
                    key={worker.workerId}
                    className="flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all hover:bg-black/5"
                    style={{
                      borderColor: selectedWorker === worker.workerId ? "var(--wbos-ink)" : "var(--wbos-border)",
                      background: selectedWorker === worker.workerId ? "var(--wbos-surface)" : "transparent"
                    }}
                  >
                    <input
                      type="radio"
                      name="worker"
                      value={worker.workerId}
                      checked={selectedWorker === worker.workerId}
                      onChange={(e) => setSelectedWorker(e.target.value)}
                      className="accent-black"
                    />
                    <div className="flex-1">
                      <div className="font-bold text-sm" style={{ color: "var(--wbos-ink)" }}>{worker.name}</div>
                      <div className="text-xs" style={{ color: "var(--wbos-muted)" }}>{worker.role} • {worker.status}</div>
                    </div>
                  </label>
              ))}
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setAssignmentTransition(null)}
                className="px-4 py-2 text-sm font-bold rounded-lg border hover:bg-black/5 transition-colors"
                style={{ color: "var(--wbos-ink)", borderColor: "var(--wbos-border)" }}
              >
                Cancel
              </button>
              <button
                disabled={!selectedWorker}
                onClick={async () => {
                  const payload: Record<string, string> = assignmentTransition.role === "PACKER" ? { workerId: selectedWorker } : { driverId: selectedWorker };
                  const transition = assignmentTransition.transition;
                  const orderId = assignmentTransition.orderId;
                  setAssignmentTransition(null);
                  setSelectedWorker("");
                  await executeTransition(orderId, transition, payload);
                }}
                className="px-4 py-2 text-sm font-bold rounded-lg transition-all"
                style={{ 
                  background: selectedWorker ? "var(--wbos-ink)" : "var(--wbos-muted)", 
                  color: "var(--wbos-bg)" 
                }}
              >
                Confirm Move
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
