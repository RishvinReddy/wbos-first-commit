"use client";

import { useState } from "react";
import { Search, Send, Check, CheckCheck, Loader2, Zap } from "lucide-react";
import { simulateWebhook } from "@/lib/api";

const demoContacts = [
  { name: "Rahul Sharma", initial: "R", time: "10:42 AM", preview: "Active simulator session", unread: 2, active: true },
  { name: "Priya Reddy", initial: "P", time: "Yesterday", preview: "Perfect, thanks!", unread: 0, active: false },
  { name: "Arjun Kumar", initial: "A", time: "Tuesday", preview: "When will it arrive?", unread: 0, active: false },
  { name: "Sneha Gupta", initial: "S", time: "Monday", preview: "Can I add 1L oil to my order?", unread: 0, active: false },
];

export default function ConversationsPage() {
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  const [chat, setChat] = useState([
    { sender: "Customer", time: "10:30 AM", text: "Hi, do you have Basmati rice in stock?", isBot: false },
    { sender: "WBOS", time: "10:30 AM", text: "Yes, we have Basmati Rice available. How much do you need?", isBot: true },
  ]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isSending) return;

    const userMsg = message;
    setMessage("");
    setIsSending(true);

    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setChat(prev => [...prev, { sender: "Customer", time: timeNow, text: userMsg, isBot: false }]);

    try {
      const res = await simulateWebhook(userMsg);
      let replyText = "Message processed.";
      if (res.operations && res.operations.length > 0) {
        replyText = `Action executed: ${res.operations.map((o: any) => o.tool).join(', ')}`;
      } else if (res.status === "duplicate") {
        replyText = "Message was flagged as duplicate.";
      }
      setChat(prev => [...prev, { sender: "WBOS", time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), text: replyText, isBot: true }]);
    } catch (err: any) {
      setChat(prev => [...prev, { sender: "System", time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), text: `Error: ${err.message}`, isBot: true }]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <div className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--wbos-muted)' }}>Customer</div>
        <h1 className="text-3xl font-extrabold tracking-tight" style={{ color: 'var(--wbos-ink)' }}>Conversations</h1>
        <p className="text-sm font-medium mt-1" style={{ color: 'var(--wbos-muted)' }}>
          WhatsApp Simulator · Real pipeline execution
        </p>
      </div>

      <div className="flex gap-4 h-[calc(100vh-20rem)]">
        {/* Contact List */}
        <div className="w-72 shrink-0 rounded-xl border flex flex-col overflow-hidden"
          style={{ background: 'var(--wbos-surface)', borderColor: 'var(--wbos-border)', boxShadow: 'var(--shadow-card)' }}>

          <div className="p-3 border-b shrink-0" style={{ borderColor: 'var(--wbos-border)', background: 'var(--wbos-bg)' }}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5" style={{ color: 'var(--wbos-muted)' }} />
              <input
                type="text"
                placeholder="Search contacts…"
                className="w-full rounded-md text-sm pl-8 pr-3 py-2 outline-none border"
                style={{ background: 'var(--wbos-surface)', borderColor: 'var(--wbos-border)', color: 'var(--wbos-ink)' }}
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y" style={{ borderColor: 'var(--wbos-border)' }}>
            {demoContacts.map((c, i) => (
              <div key={i}
                className="flex items-center gap-3 px-4 py-3.5 cursor-pointer transition-colors hover:opacity-90"
                style={{ background: c.active ? 'var(--wbos-green-subtle)' : undefined }}>
                <div className="relative shrink-0">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold"
                    style={{ 
                      background: c.active ? 'var(--wbos-green)' : 'var(--wbos-border)',
                      color: c.active ? 'white' : 'var(--wbos-muted)'
                    }}>
                    {c.initial}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between mb-0.5">
                    <span className="text-sm font-semibold truncate" style={{ color: 'var(--wbos-ink)' }}>{c.name}</span>
                    <span className="text-[10px] shrink-0" style={{ color: c.unread > 0 ? 'var(--success)' : 'var(--wbos-muted)' }}>{c.time}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs truncate pr-2" style={{ color: 'var(--wbos-muted)' }}>{c.preview}</span>
                    {c.unread > 0 && (
                      <span className="w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center shrink-0"
                        style={{ background: 'var(--success)', color: 'white' }}>
                        {c.unread}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Panel */}
        <div className="flex-1 rounded-xl border overflow-hidden flex flex-col relative"
          style={{ background: '#efeae2', borderColor: 'var(--wbos-border)', boxShadow: 'var(--shadow-card)' }}>

          {/* Chat Header */}
          <div className="h-14 flex items-center justify-between px-4 border-b shrink-0"
            style={{ background: 'var(--wbos-surface)', borderColor: 'var(--wbos-border)' }}>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white"
                style={{ background: 'var(--wbos-green)' }}>R</div>
              <div>
                <div className="text-sm font-bold flex items-center gap-2" style={{ color: 'var(--wbos-ink)' }}>
                  Rahul Sharma
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md"
                    style={{ background: 'var(--success-soft)', color: 'var(--success)' }}>
                    SIMULATOR
                  </span>
                </div>
                <div className="text-xs" style={{ color: 'var(--wbos-muted)' }}>Customer · +91 9347761153</div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-md"
              style={{ background: 'var(--ai-soft)', color: 'var(--ai)' }}>
              <Zap className="h-3.5 w-3.5" />
              AI Pipeline Active
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            <div className="flex justify-center">
              <div className="text-[10px] font-bold uppercase px-3 py-1 rounded-full"
                style={{ background: 'rgba(255,255,255,0.6)', color: 'var(--wbos-muted)' }}>
                TODAY
              </div>
            </div>

            {chat.map((msg, i) => (
              <div key={i} className={`flex ${msg.isBot ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[70%] rounded-xl px-3 py-2 shadow-sm relative ${
                  msg.isBot ? 'rounded-tr-none' : 'rounded-tl-none'
                }`}
                  style={{ 
                    background: msg.isBot ? '#d9fdd3' : 'white',
                  }}>
                  <div className="text-sm leading-relaxed" style={{ color: '#111b21' }}>{msg.text}</div>
                  <div className="flex items-center justify-end gap-1 mt-1">
                    <span className="text-[10px]" style={{ color: '#667781' }}>{msg.time}</span>
                    {msg.isBot && <CheckCheck className="h-3 w-3" style={{ color: '#53bdeb' }} />}
                  </div>
                </div>
              </div>
            ))}

            {isSending && (
              <div className="flex justify-end">
                <div className="rounded-xl rounded-tr-none px-4 py-3" style={{ background: '#d9fdd3' }}>
                  <Loader2 className="h-4 w-4 animate-spin" style={{ color: 'var(--wbos-green)' }} />
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="border-t p-3 flex items-end gap-2 shrink-0"
            style={{ background: '#f0f2f5', borderColor: 'rgba(0,0,0,0.08)' }}>
            <form onSubmit={handleSend} className="flex-1 flex items-center gap-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                disabled={isSending}
                placeholder="Type a simulated message…"
                className="flex-1 rounded-xl px-4 py-2.5 text-sm outline-none disabled:opacity-50"
                style={{ background: 'white', color: '#111b21' }}
              />
              {message.trim() && !isSending ? (
                <button type="submit"
                  className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-opacity hover:opacity-80"
                  style={{ background: 'var(--wbos-green)' }}>
                  <Send className="h-4 w-4 text-white ml-0.5" />
                </button>
              ) : (
                <button type="button"
                  className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ color: 'var(--wbos-muted)' }}>
                  <Send className="h-4 w-4" />
                </button>
              )}
            </form>
          </div>
        </div>

        {/* AI Intent Panel */}
        <div className="w-64 shrink-0 rounded-xl border overflow-hidden flex flex-col"
          style={{ background: 'var(--wbos-surface)', borderColor: 'var(--wbos-border)', boxShadow: 'var(--shadow-card)' }}>
          <div className="px-4 py-4 border-b"
            style={{ borderColor: 'var(--wbos-border)', background: 'var(--ai-soft)' }}>
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4" style={{ color: 'var(--ai)' }} />
              <h3 className="text-sm font-bold" style={{ color: 'var(--ai)' }}>AI Analysis</h3>
            </div>
            <div className="text-[10px] mt-0.5" style={{ color: 'var(--wbos-muted)' }}>DEMO — Deterministic Adapter</div>
          </div>

          <div className="flex-1 p-4 space-y-4">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--wbos-muted)' }}>Intent</div>
              <span className="text-sm font-bold px-3 py-1.5 rounded-md"
                style={{ background: 'var(--success-soft)', color: 'var(--success)' }}>
                Order Intent
              </span>
            </div>

            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--wbos-muted)' }}>Products</div>
              <div className="space-y-1.5">
                {["2kg Basmati Rice", "Cooking Oil"].map((p) => (
                  <div key={p} className="text-xs font-medium px-3 py-2 rounded-md"
                    style={{ background: 'var(--wbos-bg)', border: '1px solid var(--wbos-border)', color: 'var(--wbos-ink-soft)' }}>
                    {p}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--wbos-muted)' }}>Flow</div>
              <div className="space-y-1.5">
                {[
                  { step: "Message", status: "done" },
                  { step: "AI Intent", status: "done" },
                  { step: "Order Created", status: "done" },
                  { step: "Inventory Check", status: "done" },
                  { step: "Invoice", status: "pending" },
                ].map((s) => (
                  <div key={s.step} className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full"
                      style={{ background: s.status === 'done' ? 'var(--success)' : 'var(--wbos-border)' }}></div>
                    <span className="text-xs" style={{ color: s.status === 'done' ? 'var(--wbos-ink)' : 'var(--wbos-muted)' }}>
                      {s.step}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
