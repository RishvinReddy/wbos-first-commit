import { Package, AlertTriangle, ArrowRight } from "lucide-react";
import Link from "next/link";
import { fetchInventory } from "@/lib/api";

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

export default async function InventoryPage() {
  let inventory: any[] = [];
  let error = null;

  try {
    const data = await fetchInventory();
    inventory = data.map((item: any) => ({
      id: item.productId,
      name: item.name,
      stock: item.stock,
      price: item.price,
      maxStock: Math.max(item.stock * 2, 50),
      status: item.stock < 10 ? "low" : item.stock < 20 ? "warning" : "healthy",
    }));
  } catch (err: any) {
    error = err.message || "Failed to fetch inventory";
  }

  const totalSkus = inventory.length;
  const lowCount = inventory.filter(i => i.status === 'low').length;
  const healthyCount = inventory.filter(i => i.status === 'healthy').length;

  return (
    <div className="space-y-6">
      <div>
        <div className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--wbos-muted)' }}>Operations</div>
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight" style={{ color: 'var(--wbos-ink)' }}>Inventory</h1>
            <p className="text-sm font-medium mt-1" style={{ color: 'var(--wbos-muted)' }}>
              Real-time stock tracking · {totalSkus} SKUs
            </p>
          </div>
          {lowCount > 0 && (
            <span className="text-sm font-bold px-3 py-1.5 rounded-md flex items-center gap-2"
              style={{ background: 'var(--danger-soft)', color: 'var(--danger)' }}>
              <AlertTriangle className="h-4 w-4" /> {lowCount} Low Stock
            </span>
          )}
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold"
          style={{ background: 'var(--danger-soft)', border: '1px solid var(--danger)', color: 'var(--danger)' }}>
          <AlertTriangle className="h-4 w-4 shrink-0" /> {error}
        </div>
      )}

      {/* KPI Strip */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total SKUs", value: totalSkus, color: 'var(--success)' },
          { label: "Low Stock", value: lowCount, color: 'var(--danger)' },
          { label: "Healthy", value: healthyCount, color: 'var(--success)' },
        ].map((kpi) => (
          <div key={kpi.label} className="rounded-xl border p-5"
            style={{ background: 'var(--wbos-surface)', borderColor: 'var(--wbos-border)', boxShadow: 'var(--shadow-card)' }}>
            <div className="text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--wbos-muted)' }}>{kpi.label}</div>
            <div className="text-3xl font-extrabold" style={{ color: kpi.value > 0 && kpi.label === "Low Stock" ? 'var(--danger)' : 'var(--wbos-ink)' }}>
              {kpi.value}
            </div>
          </div>
        ))}
      </div>

      <Section label="Stock Levels">
        <div className="rounded-xl border overflow-hidden"
          style={{ background: 'var(--wbos-surface)', borderColor: 'var(--wbos-border)', boxShadow: 'var(--shadow-card)' }}>

          {/* Table Header */}
          <div className="grid grid-cols-[1fr_80px_1fr_100px_100px] gap-4 px-5 py-3 text-[10px] font-bold uppercase tracking-widest border-b"
            style={{ color: 'var(--wbos-muted)', borderColor: 'var(--wbos-border)', background: 'var(--wbos-bg)' }}>
            <div>Product</div>
            <div className="text-center">Stock</div>
            <div>Level</div>
            <div>Status</div>
            <div className="text-right">Action</div>
          </div>

          {inventory.length === 0 && !error && (
            <div className="text-center py-12 text-sm" style={{ color: 'var(--wbos-muted)' }}>
              No inventory data.
            </div>
          )}

          <div className="divide-y" style={{ borderColor: 'var(--wbos-border)' }}>
            {inventory.map((item, i) => {
              const pct = Math.min((item.stock / item.maxStock) * 100, 100);
              const barColor = item.status === 'low' ? 'var(--danger)' : item.status === 'warning' ? 'var(--warning)' : 'var(--success)';
              const statusColor = item.status === 'low' ? 'var(--danger)' : item.status === 'warning' ? 'var(--warning)' : 'var(--success)';
              const statusBg = item.status === 'low' ? 'var(--danger-soft)' : item.status === 'warning' ? 'var(--warning-soft)' : 'var(--success-soft)';

              return (
                <div key={item.id}
                  className="grid grid-cols-[1fr_80px_1fr_100px_100px] gap-4 items-center px-5 py-4 hover:opacity-90 transition-opacity"
                  style={{ background: i % 2 === 1 ? 'var(--wbos-bg)' : undefined }}>
                  <div>
                    <div className="text-sm font-semibold" style={{ color: 'var(--wbos-ink)' }}>{item.name}</div>
                    <div className="text-[11px] font-mono" style={{ color: 'var(--wbos-muted)' }}>
                      {item.id} · ₹{item.price}
                    </div>
                  </div>

                  <div className="text-base font-bold text-center" style={{ color: 'var(--wbos-ink)' }}>
                    {item.stock}
                  </div>

                  <div>
                    <div className="w-full h-2 rounded-full overflow-hidden mb-1" style={{ background: 'var(--wbos-border)' }}>
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: barColor }}></div>
                    </div>
                    <div className="text-[10px]" style={{ color: 'var(--wbos-muted)' }}>{item.stock} / {item.maxStock} units</div>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase"
                      style={{ background: statusBg, color: statusColor }}>
                      {item.status}
                    </span>
                  </div>

                  <div className="text-right">
                    {item.status === 'low' ? (
                      <button className="text-xs font-bold flex items-center gap-1 ml-auto px-3 py-1.5 rounded-md transition-opacity hover:opacity-80"
                        style={{ background: 'var(--wbos-ink)', color: 'white' }}>
                        Reorder <ArrowRight className="h-3 w-3" />
                      </button>
                    ) : (
                      <span className="text-xs" style={{ color: 'var(--wbos-muted)' }}>—</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Section>
    </div>
  );
}
