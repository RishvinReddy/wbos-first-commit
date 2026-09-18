"use client";

import { useState } from "react";
import { Send, Terminal, Sparkles, AlertTriangle, ArrowRight, Zap } from "lucide-react";

export default function AssistantPage() {
  const [query, setQuery] = useState("");
  const [history, setHistory] = useState<any[]>([
    {
      role: "assistant",
      content: "WBOS Intelligence is online. I have access to your live operational data. How can I help you manage your business today?",
      type: "text"
    }
  ]);

  const handleQuery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    const userQuery = query;
    setHistory(prev => [...prev, { role: "user", content: userQuery, type: "text" }]);
    setQuery("");

    setTimeout(() => {
      let response;
      if (userQuery.toLowerCase().includes("stock") || userQuery.toLowerCase().includes("inventory")) {
        response = {
          role: "assistant",
          content: "Checking live inventory data from DynamoDB…",
          type: "action",
          payload: [
            { name: "Basmati Rice 1kg", units: 8, status: "Low" },
            { name: "Cooking Oil 1L", units: 6, status: "Low" },
          ],
          note: "Note: This response uses the DEMO Deterministic Execution Adapter, not live Bedrock."
        };
      } else {
        response = {
          role: "assistant",
          content: "In DEMO mode, this uses the Deterministic Execution Adapter. In LIVE mode, this would trigger a Bedrock agent execution path to query your live AWS DynamoDB operational data.",
          type: "text",
          note: "Note: DEMO — Deterministic Execution Adapter active."
        };
      }
      setHistory(prev => [...prev, response]);
    }, 500);
  };

  const quickActions = [
    "Which products are low in stock?",
    "Show pending orders",
    "How much did we sell today?",
  ];

  return (
    <div className="space-y-4">
      <div>
        <div className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--wbos-muted)' }}>Intelligence</div>
        <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-2" style={{ color: 'var(--wbos-ink)' }}>
          <Sparkles className="h-6 w-6" style={{ color: 'var(--ai)' }} />
          AI Assistant
        </h1>
        <p className="text-sm font-medium mt-1" style={{ color: 'var(--wbos-muted)' }}>
          Business command interface · {process.env.NEXT_PUBLIC_EXECUTION_MODE === 'demo' ? 'DEMO — Deterministic Adapter' : 'AWS Bedrock'}
        </p>
      </div>

      {/* Quick actions */}
      <div className="flex gap-2 flex-wrap">
        {quickActions.map((qa) => (
          <button key={qa} onClick={() => setQuery(qa)}
            className="text-xs font-medium px-3 py-1.5 rounded-md border transition-colors hover:opacity-80"
            style={{
              background: 'var(--wbos-surface)',
              borderColor: 'var(--wbos-border)',
              color: 'var(--wbos-ink-soft)'
            }}>
            {qa}
          </button>
        ))}
      </div>

      {/* Terminal */}
      <div className="rounded-xl overflow-hidden border flex flex-col"
        style={{
          background: '#1a1d23',
          borderColor: 'rgba(255,255,255,0.08)',
          height: 'calc(100vh - 22rem)'
        }}>
        {/* Terminal header */}
        <div className="h-10 flex items-center px-4 gap-2 border-b shrink-0"
          style={{ background: '#13151a', borderColor: 'rgba(255,255,255,0.06)' }}>
          <Terminal className="h-3.5 w-3.5" style={{ color: '#6b7280' }} />
          <span className="text-xs font-mono font-semibold" style={{ color: '#6b7280' }}>wbos-assistant</span>
          <div className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-md"
            style={{ background: 'rgba(99,102,241,0.15)', color: 'var(--ai)' }}>
            {process.env.NEXT_PUBLIC_EXECUTION_MODE === 'demo' ? 'DEMO MODE' : 'BEDROCK'}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {history.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-xl px-4 py-3 ${
                msg.role === 'user'
                  ? 'rounded-tr-sm'
                  : 'rounded-tl-sm'
              }`}
                style={{
                  background: msg.role === 'user' ? 'rgba(0,168,132,0.15)' : 'rgba(255,255,255,0.05)',
                  border: msg.role === 'user' ? '1px solid rgba(0,168,132,0.3)' : '1px solid rgba(255,255,255,0.06)',
                }}>

                {msg.role === 'assistant' && (
                  <div className="flex items-center gap-1.5 mb-2">
                    <Zap className="h-3 w-3" style={{ color: 'var(--wbos-green)' }} />
                    <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: 'var(--wbos-green)' }}>
                      WBOS
                    </span>
                  </div>
                )}

                <div className="text-sm font-mono leading-relaxed" style={{ color: msg.role === 'user' ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.75)' }}>
                  {msg.content}
                </div>

                {msg.type === 'action' && msg.payload && (
                  <div className="mt-3 space-y-2">
                    {msg.payload.map((item: any, idx: number) => (
                      <div key={idx} className="flex items-center gap-3 px-3 py-2 rounded-lg"
                        style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <AlertTriangle className="h-3.5 w-3.5 shrink-0"
                          style={{ color: item.status === 'Critical' ? 'var(--danger)' : 'var(--warning)' }} />
                        <span className="text-sm font-semibold" style={{ color: 'rgba(255,255,255,0.8)' }}>{item.name}</span>
                        <span className="ml-auto text-xs font-mono" style={{ color: 'rgba(255,255,255,0.4)' }}>{item.units} units</span>
                      </div>
                    ))}
                  </div>
                )}

                {msg.note && (
                  <div className="mt-2 text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.3)' }}>
                    {msg.note}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="p-4 border-t shrink-0" style={{ background: '#13151a', borderColor: 'rgba(255,255,255,0.06)' }}>
          <form onSubmit={handleQuery} className="relative flex items-center gap-3">
            <span className="text-base font-bold shrink-0" style={{ color: 'var(--wbos-green)' }}>❯</span>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter operational command…"
              className="flex-1 bg-transparent text-sm outline-none font-mono"
              style={{ color: 'rgba(255,255,255,0.8)', caretColor: 'var(--wbos-green)' }}
            />
            <button type="submit" disabled={!query.trim()}
              className="shrink-0 transition-opacity disabled:opacity-30"
              style={{ color: 'var(--wbos-green)' }}>
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
