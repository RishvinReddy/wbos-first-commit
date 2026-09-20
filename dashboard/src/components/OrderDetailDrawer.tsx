import { useState, useEffect } from "react";
import { formatDistanceToNow } from 'date-fns';
import { fetchAuthSession } from 'aws-amplify/auth';
import { X, Clock, User, Package, CheckCircle, AlertTriangle, Play, Truck, ChevronRight } from "lucide-react";

export default function OrderDetailDrawer({ 
  orderId, 
  onClose, 
  onUpdate 
}: { 
  orderId: string; 
  onClose: () => void;
  onUpdate: () => void;
}) {
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [workers, setWorkers] = useState<any[]>([]);
  const [transitionState, setTransitionState] = useState<{type: string, show: boolean} | null>(null);
  const [selectedWorker, setSelectedWorker] = useState<string>("");
  const [transitioning, setTransitioning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch full order details including timeline/audit trail if we had that API
    // For now we will rely on what we can get or just simulate the timeline if not available
    const fetchDetails = async () => {
      try {
        setLoading(true);
        const session = await fetchAuthSession();
        const token = session.tokens?.accessToken?.toString();
        if (!token) {
          throw new Error("Your dashboard session has expired. Please sign in again.");
        }
        // We fetch all orders and find ours (for MVP)
        const res = await fetch("/api/orders", {
          headers: { "Authorization": `Bearer ${token}` }
        });
        const orders = await res.json();
        const found = orders.find((o: any) => o.orderId === orderId);
        setOrder(found);

        // Fetch workers
        const wRes = await fetch("/api/workers", {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (wRes.ok) {
           setWorkers(await wRes.json());
        }
      } catch (e: any) {
        console.error(e);
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    if (orderId) fetchDetails();
  }, [orderId]);

  const handleTransition = async (transition: string, payload: any = {}) => {
    try {
      setTransitioning(true);
      setError(null);
      const session = await fetchAuthSession();
      const token = session.tokens?.accessToken?.toString();
      if (!token) {
        throw new Error("Your dashboard session has expired. Please sign in again.");
      }
      const res = await fetch(`/api/orders/${orderId}/transition`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ transition, ...payload })
      });
      
      const raw = await res.text();
      let data: any = {};
      if (raw.trim()) {
        try {
          data = JSON.parse(raw);
        } catch {
          throw new Error(`Transition request returned an invalid response (${res.status}).`);
        }
      }
      
      if (!res.ok) throw new Error(data.error || "Transition failed");
      
      setTransitionState(null);
      onUpdate(); // refresh parent
      onClose();  // close drawer
    } catch (e: any) {
      setError(e.message);
    } finally {
      setTransitioning(false);
    }
  };

  if (!orderId) return null;

  const validTransitions = () => {
    if (!order) return [];
    const st = order.status || "NEW";
    if (st === "NEW") return [{ label: "Confirm Order", transition: "CONFIRM" }, { label: "Cancel Order", transition: "CANCEL" }];
    if (st === "CONFIRMED") return [{ label: "Start Preparation", transition: "START_PREPARATION" }, { label: "Cancel Order", transition: "CANCEL" }];
    if (st === "PREPARING") return [{ label: "Complete Preparation", transition: "COMPLETE_PREPARATION" }, { label: "Cancel Order", transition: "CANCEL" }];
    if (st === "READY") return [{ label: "Dispatch Order", transition: "DISPATCH" }];
    if (st === "DELIVERY") return [{ label: "Mark Delivered", transition: "DELIVER" }];
    return [];
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      
      {/* Drawer */}
      <div className="relative w-full max-w-md h-full shadow-2xl flex flex-col" style={{ background: 'var(--wbos-bg)' }}>
        {/* Header */}
        <div className="px-6 py-5 border-b flex items-center justify-between" style={{ borderColor: 'var(--wbos-border)' }}>
          <div className="flex flex-col">
             <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--wbos-muted)' }}>Order Details</span>
             <h2 className="text-xl font-bold font-mono" style={{ color: 'var(--wbos-ink)' }}>{orderId}</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-black/5">
            <X className="h-5 w-5" style={{ color: 'var(--wbos-ink)' }} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {loading ? (
            <div className="text-sm" style={{ color: 'var(--wbos-muted)' }}>Loading...</div>
          ) : !order ? (
            <div className="text-sm" style={{ color: 'var(--danger)' }}>Order not found</div>
          ) : (
            <>
              {/* Status & Summary */}
              <div className="flex items-center justify-between p-4 rounded-xl border" style={{ background: 'var(--wbos-surface)', borderColor: 'var(--wbos-border)' }}>
                <div>
                  <div className="text-xs font-semibold mb-1" style={{ color: 'var(--wbos-muted)' }}>Status</div>
                  <div className="text-lg font-bold" style={{ color: 'var(--wbos-ink)' }}>{order.status || 'NEW'}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-semibold mb-1" style={{ color: 'var(--wbos-muted)' }}>Total</div>
                  <div className="text-lg font-bold" style={{ color: 'var(--wbos-ink)' }}>₹{order.total}</div>
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-lg text-sm font-semibold flex items-center gap-2" style={{ background: 'var(--danger-soft)', color: 'var(--danger)' }}>
                  <AlertTriangle className="h-4 w-4" /> {error}
                </div>
              )}

              {/* Action Controls */}
              {validTransitions().length > 0 && (
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--wbos-muted)' }}>Actions</div>
                  <div className="flex flex-col gap-2">
                    {validTransitions().map(t => (
                      <button 
                        key={t.transition}
                        onClick={() => {
                          if (t.transition === "START_PREPARATION" || t.transition === "DISPATCH") {
                            setTransitionState({ type: t.transition, show: true });
                          } else {
                            handleTransition(t.transition);
                          }
                        }}
                        disabled={transitioning}
                        className="px-4 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-opacity hover:opacity-90"
                        style={{ 
                          background: t.transition === 'CANCEL' ? 'transparent' : 'var(--wbos-ink)', 
                          color: t.transition === 'CANCEL' ? 'var(--danger)' : 'var(--wbos-bg)',
                          border: t.transition === 'CANCEL' ? '1px solid var(--danger)' : 'none'
                        }}
                      >
                        {transitioning ? "Processing..." : t.label} <ChevronRight className="h-4 w-4" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Customer */}
              <div>
                <div className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--wbos-muted)' }}>Customer</div>
                <div className="flex items-center gap-3 p-3 rounded-xl border" style={{ borderColor: 'var(--wbos-border)' }}>
                  <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'var(--wbos-surface)' }}>
                    <User className="h-5 w-5" style={{ color: 'var(--wbos-muted)' }} />
                  </div>
                  <div>
                    <div className="font-semibold text-sm" style={{ color: 'var(--wbos-ink)' }}>{order.customerPhone}</div>
                  </div>
                </div>
              </div>

              {/* Assignment (if any) */}
              {(order.workerId || order.driverId) && (
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--wbos-muted)' }}>Assignment</div>
                  {order.workerId && (
                     <div className="text-sm font-medium mb-1">Worker ID: {order.workerId}</div>
                  )}
                  {order.driverId && (
                     <div className="text-sm font-medium">Driver ID: {order.driverId}</div>
                  )}
                </div>
              )}

            </>
          )}
        </div>
      </div>

      {/* Assignment Modal */}
      {transitionState?.show && (
        <div className="absolute inset-0 z-[60] bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl p-6 shadow-2xl" style={{ background: 'var(--wbos-bg)' }}>
            <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--wbos-ink)' }}>
              {transitionState.type === "START_PREPARATION" ? "Assign Packing Worker" : "Assign Delivery Driver"}
            </h3>
            
            <div className="space-y-2 mb-6">
              {workers
                .filter(w => transitionState.type === "START_PREPARATION" ? w.role === "PACKER" : w.role === "DELIVERY_DRIVER")
                .map(w => (
                <label key={w.workerId} className="flex items-center gap-3 p-3 rounded-xl border cursor-pointer hover:bg-black/5" style={{ borderColor: 'var(--wbos-border)' }}>
                  <input type="radio" name="worker" value={w.workerId} checked={selectedWorker === w.workerId} onChange={(e) => setSelectedWorker(e.target.value)} />
                  <div className="flex-1">
                    <div className="font-bold text-sm" style={{ color: 'var(--wbos-ink)' }}>{w.name}</div>
                    <div className="text-xs" style={{ color: 'var(--wbos-muted)' }}>{w.role} • {w.status}</div>
                  </div>
                </label>
              ))}
              {workers.length === 0 && (
                 <div className="text-sm text-center py-4" style={{ color: 'var(--wbos-muted)' }}>No workers found. Proceed without assignment? (API will fail if strictly enforced)</div>
              )}
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => setTransitionState(null)} 
                className="flex-1 py-2 rounded-xl text-sm font-bold border"
                style={{ borderColor: 'var(--wbos-border)', color: 'var(--wbos-ink)' }}
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                   if (transitionState.type === "START_PREPARATION") {
                     handleTransition("START_PREPARATION", { workerId: selectedWorker });
                   } else {
                     handleTransition("DISPATCH", { driverId: selectedWorker });
                   }
                }} 
                disabled={transitioning || !selectedWorker}
                className="flex-1 py-2 rounded-xl text-sm font-bold opacity-90 disabled:opacity-50"
                style={{ background: 'var(--wbos-ink)', color: 'var(--wbos-bg)' }}
              >
                {transitioning ? "Saving..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
