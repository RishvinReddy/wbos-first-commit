export default function ConversationsPage() {
  return (
    <div className="space-y-4">
      <div>
        <div className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--wbos-muted)' }}>Customer</div>
        <h1 className="text-3xl font-extrabold tracking-tight" style={{ color: 'var(--wbos-ink)' }}>Conversations</h1>
        <p className="text-sm font-medium mt-1" style={{ color: 'var(--wbos-muted)' }}>
          Live interactions view
        </p>
      </div>

      <div className="flex gap-4 h-[calc(100vh-20rem)] flex-col items-center justify-center rounded-xl border p-8"
          style={{ background: 'var(--wbos-surface)', borderColor: 'var(--wbos-border)' }}>

        <h2 className="text-xl font-bold" style={{ color: 'var(--wbos-ink)' }}>LIVE WHATSAPP Connected</h2>
        <p className="text-sm text-center max-w-md mt-4" style={{ color: 'var(--wbos-muted)' }}>
          Customer conversations are received through the configured WhatsApp Business webhook.
        </p>
        <p className="text-sm text-center max-w-md mt-2" style={{ color: 'var(--wbos-muted)' }}>
          No browser simulator is available in production.
        </p>
      </div>
    </div>
  );
}
