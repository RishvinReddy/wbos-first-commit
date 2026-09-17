import { Activity, Box, FileText, Bell, LayoutDashboard, Database, AlertTriangle, HelpCircle } from "lucide-react";
import { fetchEvents } from "@/lib/api";

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

const eventConfig: Record<string, { color: string; bg: string }> = {
  OrderCreated:         { color: 'var(--success)',  bg: 'var(--success-soft)' },
  DashboardEvent:       { color: 'var(--event)',    bg: 'var(--event-soft)' },
  NotificationRequested:{ color: 'var(--warning)',  bg: 'var(--warning-soft)' },
  InvoiceGenerated:     { color: 'var(--ai)',       bg: 'var(--ai-soft)' },
  InventoryUpdated:     { color: 'var(--info)',     bg: 'var(--info-soft)' },
};

export default async function EventsPage() {
  let events: any[] = [];
  let error = null;

  try {
    const data = await fetchEvents();
    events = data.map((evt: any) => {
      const cfg = eventConfig[evt.type] ?? { color: 'var(--wbos-muted)', bg: 'var(--wbos-bg)' };
      let detail = "";
      if (evt.type === "OrderCreated" && evt.data?.orderId) detail = `Order ${evt.data.orderId} created`;
      else if (evt.type === "InvoiceGenerated" && evt.data?.s3_key) detail = `Invoice stored: ${evt.data.s3_key}`;
      else if (evt.type === "DashboardEvent" && evt.data?.messageId) detail = `Processed message: ${evt.data.messageId}`;
      else detail = JSON.stringify(evt.data ?? {}).slice(0, 60) + "…";

      return {
        id: evt.eventId,
        type: evt.type,
        source: evt.data?.source || "EventBridge",
        detail,
        time: new Date(evt.timestamp).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
        ...cfg
      };
    });
  } catch (err: any) {
    error = err.message || "Failed to fetch events";
  }

  // Architecture nodes
  const archNodes = [
    { label: "Lambda → EventBridge", sub: "wbos-events bus", color: 'var(--success)' },
    { label: "Invoice Lambda", sub: "→ S3 PDF", color: 'var(--ai)' },
    { label: "Notify Lambda", sub: "→ SNS / SMS", color: 'var(--warning)' },
    { label: "Dashboard Lambda", sub: "→ DynamoDB Metrics", color: 'var(--event)' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <div className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--wbos-muted)' }}>System</div>
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight" style={{ color: 'var(--wbos-ink)' }}>Event Pipeline</h1>
            <p className="text-sm font-medium mt-1" style={{ color: 'var(--wbos-muted)' }}>
              AWS EventBridge · {events.length} events captured
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--event)' }}></div>
            <span className="text-xs font-semibold" style={{ color: 'var(--wbos-ink-soft)' }}>Pipeline Health: Operational</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold"
          style={{ background: 'var(--danger-soft)', border: '1px solid var(--danger)', color: 'var(--danger)' }}>
          <AlertTriangle className="h-4 w-4 shrink-0" /> {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Architecture Panel */}
        <div className="lg:col-span-4">
          <Section label="Architecture">
            <div className="rounded-xl border overflow-hidden"
              style={{ background: 'var(--wbos-surface)', borderColor: 'var(--wbos-border)', boxShadow: 'var(--shadow-card)' }}>
              
              <div className="px-5 py-4 border-b"
                style={{ borderColor: 'var(--wbos-border)', background: 'var(--wbos-bg)' }}>
                <h2 className="text-sm font-bold" style={{ color: 'var(--wbos-ink)' }}>Topology</h2>
              </div>

              <div className="p-5">
                {/* Source */}
                <div className="text-center mb-4">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border text-xs font-bold"
                    style={{ background: 'var(--wbos-ink-surface)', borderColor: 'transparent', color: 'white' }}>
                    ORDER_CREATED · WhatsApp / API
                  </div>
                </div>

                {/* Down arrow */}
                <div className="flex justify-center mb-4">
                  <div className="w-px h-8" style={{ background: 'var(--wbos-border)' }}></div>
                </div>

                {/* EventBridge */}
                <div className="text-center mb-4">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold"
                    style={{ background: 'var(--event)', color: 'white' }}>
                    <Activity className="h-3.5 w-3.5" />
                    Amazon EventBridge
                  </div>
                  <div className="text-[10px] mt-1" style={{ color: 'var(--wbos-muted)' }}>wbos-events</div>
                </div>

                {/* Fan out line */}
                <div className="flex justify-center mb-4">
                  <div className="w-3/4 h-px" style={{ background: 'var(--wbos-border)' }}></div>
                </div>

                {/* Targets */}
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: "Invoice", sub: "S3", color: 'var(--ai)' },
                    { label: "Notify", sub: "SNS", color: 'var(--warning)' },
                    { label: "Dashboard", sub: "DynamoDB", color: 'var(--event)' },
                  ].map((t) => (
                    <div key={t.label} className="rounded-lg border p-2.5 text-center"
                      style={{ borderColor: 'var(--wbos-border)', background: 'var(--wbos-bg)' }}>
                      <div className="text-[11px] font-bold mb-0.5" style={{ color: t.color }}>{t.label}</div>
                      <div className="text-[10px]" style={{ color: 'var(--wbos-muted)' }}>{t.sub}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Section>
        </div>

        {/* Event Log */}
        <div className="lg:col-span-8">
          <Section label="Event Log">
            <div className="rounded-xl border overflow-hidden"
              style={{ background: 'var(--wbos-surface)', borderColor: 'var(--wbos-border)', boxShadow: 'var(--shadow-card)' }}>

              <div className="px-5 py-4 border-b"
                style={{ borderColor: 'var(--wbos-border)', background: 'var(--wbos-bg)' }}>
                <h2 className="text-sm font-bold" style={{ color: 'var(--wbos-ink)' }}>System Events</h2>
              </div>

              {events.length === 0 && !error && (
                <div className="text-center py-16 text-sm" style={{ color: 'var(--wbos-muted)' }}>
                  No events yet. Send a message to start the pipeline.
                </div>
              )}

              <div className="divide-y" style={{ borderColor: 'var(--wbos-border)' }}>
                {events.map((evt, i) => (
                  <div key={evt.id} className="flex items-start gap-4 px-5 py-4 hover:opacity-90 transition-opacity"
                    style={{ background: i % 2 === 1 ? 'var(--wbos-bg)' : undefined }}>
                    {/* Icon dot */}
                    <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                      style={{ background: evt.bg }}>
                      <div className="w-2 h-2 rounded-full" style={{ background: evt.color }}></div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-bold" style={{ color: evt.color }}>{evt.type}</span>
                        <span className="text-xs font-mono" style={{ color: 'var(--wbos-muted)' }}>{evt.time}</span>
                      </div>
                      <div className="text-sm mb-1" style={{ color: 'var(--wbos-ink-soft)' }}>{evt.detail}</div>
                      <div className="text-[11px] font-semibold" style={{ color: 'var(--wbos-muted)' }}>
                        Source: {evt.source}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
}
