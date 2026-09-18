import { MapPin, Navigation, Truck, Package, Clock } from "lucide-react";

// Static demo data — labeled explicitly
const demoDrivers = [
  { id: "DR-01", name: "Mukesh", initial: "M", status: "delivering", location: "Andheri West", order: "#1041", eta: "12 mins" },
  { id: "DR-02", name: "Ramesh", initial: "R", status: "returning", location: "Bandra", order: null, eta: "25 mins" },
  { id: "DR-03", name: "Suresh", initial: "S", status: "at-store", location: "Store", order: null, eta: "—" },
];

const demoDeliveries = [
  { id: "#1041", customer: "Arjun Kumar", address: "Powai, Mumbai", driver: "Mukesh", status: "Out for Delivery", time: "45m ago" },
  { id: "#1039", customer: "Vikas Singh", address: "Juhu, Mumbai", driver: "Pending", status: "Ready for Pickup", time: "1h ago" },
];

const statusConfig: Record<string, { color: string; bg: string; label: string }> = {
  delivering: { color: 'var(--success)', bg: 'var(--success-soft)', label: 'Delivering' },
  returning:  { color: 'var(--warning)', bg: 'var(--warning-soft)', label: 'Returning' },
  "at-store": { color: 'var(--wbos-muted)', bg: 'var(--wbos-bg)', label: 'At Store' },
};

export default function DeliveryPage() {
  const activeCount = demoDrivers.filter(d => d.status === 'delivering').length;

  return (
    <div className="space-y-6">
      <div>
        <div className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--wbos-muted)' }}>Operations</div>
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight" style={{ color: 'var(--wbos-ink)' }}>Delivery</h1>
            <p className="text-sm font-medium mt-1" style={{ color: 'var(--wbos-muted)' }}>
              Demo data · Fleet management &amp; tracking
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: 'var(--success)' }}></div>
              <span className="text-sm font-semibold" style={{ color: 'var(--wbos-ink-soft)' }}>{activeCount} Active</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Driver Fleet */}
        <div className="lg:col-span-1 space-y-4">
          <div className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--wbos-muted)' }}>Fleet</div>
          {demoDrivers.map((driver) => {
            const cfg = statusConfig[driver.status];
            return (
              <div key={driver.id} className="rounded-xl border p-4"
                style={{ background: 'var(--wbos-surface)', borderColor: 'var(--wbos-border)', boxShadow: 'var(--shadow-card)' }}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold"
                      style={{ background: cfg.bg, color: cfg.color }}>
                      {driver.initial}
                    </div>
                    <div>
                      <div className="text-sm font-bold" style={{ color: 'var(--wbos-ink)' }}>{driver.name}</div>
                      <div className="text-[11px] font-mono" style={{ color: 'var(--wbos-muted)' }}>{driver.id}</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md uppercase"
                    style={{ background: cfg.bg, color: cfg.color }}>
                    {cfg.label}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs" style={{ color: 'var(--wbos-muted)' }}>
                  <span className="flex items-center gap-1.5"><MapPin className="h-3 w-3" />{driver.location}</span>
                  <span className="flex items-center gap-1.5"><Clock className="h-3 w-3" />ETA: {driver.eta}</span>
                  {driver.order && (
                    <span className="flex items-center gap-1.5 font-semibold" style={{ color: 'var(--ai)' }}>
                      <Navigation className="h-3 w-3" />{driver.order}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Right panel */}
        <div className="lg:col-span-2 space-y-4">
          {/* Map placeholder */}
          <div className="rounded-xl border overflow-hidden relative flex items-center justify-center"
            style={{
              background: 'var(--wbos-surface)',
              borderColor: 'var(--wbos-border)',
              boxShadow: 'var(--shadow-card)',
              height: '240px'
            }}>
            <div className="absolute inset-0 opacity-5" style={{
              backgroundImage: 'radial-gradient(circle, var(--wbos-muted) 1px, transparent 1px)',
              backgroundSize: '24px 24px'
            }}></div>

            {/* Driver dots */}
            <div className="absolute top-1/4 left-1/4 flex flex-col items-center">
              <div className="w-3 h-3 rounded-full" style={{ background: 'var(--success)', boxShadow: '0 0 8px var(--success)' }}></div>
              <span className="text-[10px] font-bold px-1 rounded mt-0.5" style={{ background: 'white', color: 'var(--wbos-ink)' }}>Mukesh</span>
            </div>
            <div className="absolute top-2/3 right-1/3 flex flex-col items-center">
              <div className="w-3 h-3 rounded-full" style={{ background: 'var(--warning)', boxShadow: '0 0 8px var(--warning)' }}></div>
              <span className="text-[10px] font-bold px-1 rounded mt-0.5" style={{ background: 'white', color: 'var(--wbos-ink)' }}>Ramesh</span>
            </div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
              <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center"
                style={{ background: 'var(--wbos-ink)', borderColor: 'white' }}>
                <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
              </div>
              <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded mt-0.5"
                style={{ background: 'var(--wbos-ink)', color: 'white' }}>Store</span>
            </div>

            <div className="z-10 text-center">
              <MapPin className="h-6 w-6 mx-auto mb-1" style={{ color: 'var(--wbos-border)' }} />
              <div className="text-xs font-medium" style={{ color: 'var(--wbos-muted)' }}>Geospatial tracking paused</div>
            </div>
          </div>

          {/* Deliveries list */}
          <div className="rounded-xl border overflow-hidden"
            style={{ background: 'var(--wbos-surface)', borderColor: 'var(--wbos-border)', boxShadow: 'var(--shadow-card)' }}>
            <div className="px-5 py-4 border-b flex items-center justify-between"
              style={{ borderColor: 'var(--wbos-border)', background: 'var(--wbos-bg)' }}>
              <h2 className="text-sm font-bold" style={{ color: 'var(--wbos-ink)' }}>Active Deliveries</h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md"
                style={{ background: 'var(--wbos-border)', color: 'var(--wbos-muted)' }}>
                Demo Data
              </span>
            </div>
            <div className="divide-y" style={{ borderColor: 'var(--wbos-border)' }}>
              {demoDeliveries.map((d, i) => (
                <div key={i} className="flex items-center gap-4 px-5 py-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{
                      background: d.driver === 'Pending' ? 'var(--warning-soft)' : 'var(--success-soft)'
                    }}>
                    {d.driver === 'Pending'
                      ? <Package className="h-5 w-5" style={{ color: 'var(--warning)' }} />
                      : <Truck className="h-5 w-5" style={{ color: 'var(--success)' }} />
                    }
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-bold font-mono" style={{ color: 'var(--wbos-ink)' }}>{d.id}</span>
                      <span className="text-xs" style={{ color: 'var(--wbos-muted)' }}>{d.customer}</span>
                    </div>
                    <div className="text-xs flex items-center gap-1" style={{ color: 'var(--wbos-muted)' }}>
                      <MapPin className="h-3 w-3" />{d.address}
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md block mb-1"
                      style={{
                        background: d.driver === 'Pending' ? 'var(--warning-soft)' : 'var(--success-soft)',
                        color: d.driver === 'Pending' ? 'var(--warning)' : 'var(--success)'
                      }}>
                      {d.status}
                    </span>
                    {d.driver !== 'Pending' && (
                      <div className="text-[11px]" style={{ color: 'var(--wbos-muted)' }}>Driver: {d.driver}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
