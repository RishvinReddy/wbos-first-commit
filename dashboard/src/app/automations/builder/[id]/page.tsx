"use client";

import { useState, useEffect } from "react";
import { fetchAuthSession } from "aws-amplify/auth";
import Link from "next/link";
import { ArrowLeft, Save, Play, Activity, Pause, Plus, Trash2, Settings, Server, Zap, CheckCircle2 } from "lucide-react";
import AutomationTestModal from "@/components/AutomationTestModal";

export async function generateStaticParams() {
  return [];
}

export default function AutomationBuilder({ params }: { params: { id: string } }) {
  const [flow, setFlow] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testModalOpen, setTestModalOpen] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    loadFlow();
  }, [params.id]);

  async function loadFlow() {
    setLoading(true);
    try {
      const session = await fetchAuthSession();
      const token = session.tokens?.idToken?.toString();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/automations/${params.id}`, {
        headers: { Authorization: token || "" },
      });
      if (res.ok) setFlow(await res.json());
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }

  async function saveFlow() {
    setSaving(true);
    try {
      const session = await fetchAuthSession();
      const token = session.tokens?.idToken?.toString();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/automations/${params.id}`, {
        method: "PUT",
        headers: { 
          Authorization: token || "",
          "Content-Type": "application/json"
        },
        body: JSON.stringify(flow)
      });
      if (res.ok) {
        setFlow(await res.json());
        setSuccessMsg("Draft Saved");
        setTimeout(() => setSuccessMsg(""), 3000);
      }
    } catch (e) {
      console.error(e);
    }
    setSaving(false);
  }

  async function toggleActivation() {
    setSaving(true);
    try {
      const session = await fetchAuthSession();
      const token = session.tokens?.idToken?.toString();
      const action = flow.status === "ACTIVE" ? "pause" : "activate";
      
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/automations/${params.id}/${action}`, {
        method: "POST",
        headers: { Authorization: token || "" },
      });
      if (res.ok) {
        setFlow(await res.json());
        setSuccessMsg(action === "activate" ? "Activated!" : "Paused");
        setTimeout(() => setSuccessMsg(""), 3000);
      } else {
        alert("Validation failed. Check your flow configuration.");
      }
    } catch (e) {
      console.error(e);
    }
    setSaving(false);
  }

  const addCondition = () => {
    const updated = { ...flow };
    updated.conditions.push({ field: "", operator: "equals", value: "" });
    setFlow(updated);
  };
  
  const updateCondition = (index: number, key: string, value: string) => {
    const updated = { ...flow };
    updated.conditions[index][key] = value;
    setFlow(updated);
  };
  
  const removeCondition = (index: number) => {
    const updated = { ...flow };
    updated.conditions.splice(index, 1);
    setFlow(updated);
  };

  const addAction = () => {
    const updated = { ...flow };
    updated.actions.push({ type: "SEND_WHATSAPP", message: "" });
    setFlow(updated);
  };
  
  const updateAction = (index: number, key: string, value: string) => {
    const updated = { ...flow };
    updated.actions[index][key] = value;
    setFlow(updated);
  };

  const removeAction = (index: number) => {
    const updated = { ...flow };
    updated.actions.splice(index, 1);
    setFlow(updated);
  };

  if (loading) return <div className="p-8 text-white">Loading builder...</div>;
  if (!flow) return <div className="p-8 text-white">Automation not found</div>;

  return (
    <div className="flex h-screen bg-[#0A0A0A] overflow-hidden">
      {/* Sidebar Flow Explorer */}
      <div className="w-64 border-r border-white/10 bg-[#111111] p-4 flex flex-col">
        <Link href="/automations" className="text-zinc-400 hover:text-white flex items-center gap-2 mb-8 text-sm">
          <ArrowLeft size={16} /> Back to List
        </Link>
        <div className="flex-1 space-y-4">
          <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Flow Structure</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-3 p-2 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-lg text-sm">
              <Zap size={16} /> Trigger
            </div>
            <div className="w-0.5 h-4 bg-white/10 ml-5"></div>
            <div className="flex items-center gap-3 p-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-lg text-sm">
              <Settings size={16} /> {flow.conditions.length} Conditions
            </div>
            <div className="w-0.5 h-4 bg-white/10 ml-5"></div>
            <div className="flex items-center gap-3 p-2 bg-green-500/10 border border-green-500/20 text-green-400 rounded-lg text-sm">
              <Activity size={16} /> {flow.actions.length} Actions
            </div>
          </div>
        </div>
      </div>

      {/* Main Canvas */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        <div className="sticky top-0 z-10 bg-[#0A0A0A]/80 backdrop-blur-md border-b border-white/10 p-4 flex justify-between items-center">
          <div>
            <input 
              type="text" 
              value={flow.name}
              onChange={e => setFlow({...flow, name: e.target.value})}
              className="bg-transparent text-xl font-bold text-white border-none focus:outline-none focus:ring-0 p-0" 
            />
            <div className="flex items-center gap-3 mt-1">
              <span className={`text-xs px-2 py-0.5 rounded flex items-center gap-1 ${flow.status === 'ACTIVE' ? 'bg-green-500/10 text-green-400' : 'bg-white/10 text-zinc-400'}`}>
                {flow.status === 'ACTIVE' ? <Activity size={12} /> : <Pause size={12} />}
                {flow.status}
              </span>
              <span className="text-xs text-zinc-500">v{flow.version}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {successMsg && <span className="text-green-400 text-sm flex items-center gap-1"><CheckCircle2 size={16} /> {successMsg}</span>}
            <button 
              onClick={() => setTestModalOpen(true)}
              className="bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2"
            >
              <Play size={16} className="text-green-400" /> Test Run
            </button>
            <button 
              onClick={saveFlow} disabled={saving}
              className="bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2"
            >
              <Save size={16} /> Save Draft
            </button>
            <button 
              onClick={toggleActivation} disabled={saving}
              className={`${flow.status === 'ACTIVE' ? 'bg-zinc-800 hover:bg-red-900/50 text-white' : 'bg-purple-600 hover:bg-purple-500 text-white'} px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2`}
            >
              {flow.status === 'ACTIVE' ? "Pause Flow" : "Publish & Activate"}
            </button>
          </div>
        </div>

        <div className="p-8 max-w-3xl mx-auto w-full space-y-8">
          
          {/* Trigger Block */}
          <div className="bg-[#111111] border border-white/10 rounded-xl overflow-hidden shadow-xl">
            <div className="bg-purple-500/10 border-b border-white/5 p-4 flex items-center gap-3">
              <div className="bg-purple-500/20 p-2 rounded-lg"><Zap size={20} className="text-purple-400" /></div>
              <h2 className="text-lg font-semibold text-white">When this happens...</h2>
            </div>
            <div className="p-6">
              <label className="block text-sm font-medium text-zinc-400 mb-2">Domain Event (EventBridge Source)</label>
              <select 
                value={flow.trigger.type || ""}
                onChange={e => setFlow({...flow, trigger: { ...flow.trigger, type: e.target.value }})}
                className="w-full bg-[#1A1A1A] border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-purple-500"
              >
                <option value="OrderCreated">Order Created</option>
                <option value="OrderConfirmed">Order Confirmed</option>
                <option value="OrderDelivered">Order Delivered</option>
                <option value="InventoryLow">Inventory Low</option>
                <option value="MessageReceived">Inbound Message Received</option>
              </select>
            </div>
          </div>

          <div className="flex justify-center"><div className="w-0.5 h-8 bg-white/10"></div></div>

          {/* Conditions Block */}
          <div className="bg-[#111111] border border-white/10 rounded-xl overflow-hidden shadow-xl">
            <div className="bg-blue-500/10 border-b border-white/5 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-blue-500/20 p-2 rounded-lg"><Settings size={20} className="text-blue-400" /></div>
                <h2 className="text-lg font-semibold text-white">If these conditions are met...</h2>
              </div>
              <button onClick={addCondition} className="text-blue-400 hover:text-blue-300 flex items-center gap-1 text-sm font-medium">
                <Plus size={16} /> Add Rule
              </button>
            </div>
            <div className="p-6 space-y-4">
              {flow.conditions.length === 0 && (
                <div className="text-zinc-500 text-sm italic">Run unconditionally for every event.</div>
              )}
              {flow.conditions.map((cond: any, i: number) => (
                <div key={i} className="flex gap-3 items-start">
                  <input 
                    placeholder="Field path (e.g. order.total)"
                    value={cond.field} onChange={e => updateCondition(i, "field", e.target.value)}
                    className="flex-1 bg-[#1A1A1A] border border-white/10 rounded-lg p-2.5 text-white text-sm focus:outline-none focus:border-blue-500"
                  />
                  <select 
                    value={cond.operator} onChange={e => updateCondition(i, "operator", e.target.value)}
                    className="w-40 bg-[#1A1A1A] border border-white/10 rounded-lg p-2.5 text-white text-sm focus:outline-none focus:border-blue-500"
                  >
                    <option value="equals">Equals (==)</option>
                    <option value="not_equals">Not Equals (!=)</option>
                    <option value="greater_than">Greater Than (&gt;)</option>
                    <option value="contains">Contains</option>
                    <option value="exists">Exists</option>
                  </select>
                  <input 
                    placeholder="Value"
                    value={cond.value} onChange={e => updateCondition(i, "value", e.target.value)}
                    className="flex-1 bg-[#1A1A1A] border border-white/10 rounded-lg p-2.5 text-white text-sm focus:outline-none focus:border-blue-500"
                  />
                  <button onClick={() => removeCondition(i)} className="p-2.5 text-zinc-500 hover:text-red-400 transition bg-white/5 rounded-lg border border-white/5">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-center"><div className="w-0.5 h-8 bg-white/10"></div></div>

          {/* Actions Block */}
          <div className="bg-[#111111] border border-white/10 rounded-xl overflow-hidden shadow-xl">
            <div className="bg-green-500/10 border-b border-white/5 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-green-500/20 p-2 rounded-lg"><Activity size={20} className="text-green-400" /></div>
                <h2 className="text-lg font-semibold text-white">Then do this...</h2>
              </div>
              <button onClick={addAction} className="text-green-400 hover:text-green-300 flex items-center gap-1 text-sm font-medium">
                <Plus size={16} /> Add Action
              </button>
            </div>
            <div className="p-6 space-y-4">
              {flow.actions.length === 0 && (
                <div className="text-red-400/80 text-sm italic">You must define at least one action.</div>
              )}
              {flow.actions.map((act: any, i: number) => (
                <div key={i} className="border border-white/10 bg-[#1A1A1A] rounded-xl p-4">
                  <div className="flex justify-between items-start mb-4">
                    <select 
                      value={act.type} onChange={e => updateAction(i, "type", e.target.value)}
                      className="bg-[#222222] border border-white/10 rounded-lg p-2 text-white font-medium focus:outline-none focus:border-green-500"
                    >
                      <option value="SEND_WHATSAPP">Send WhatsApp Message</option>
                      <option value="NOTIFY_OWNER">Notify Owner (Alert)</option>
                      <option value="UPDATE_ORDER">Update Order Status</option>
                    </select>
                    <button onClick={() => removeAction(i)} className="text-zinc-500 hover:text-red-400">
                      <Trash2 size={18} />
                    </button>
                  </div>
                  
                  {act.type === "SEND_WHATSAPP" && (
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs text-zinc-400 mb-1 block">Message Template</label>
                        <textarea 
                          value={act.message || ""} onChange={e => updateAction(i, "message", e.target.value)}
                          className="w-full bg-[#111111] border border-white/10 rounded-lg p-3 text-white text-sm focus:outline-none"
                          rows={3} placeholder="Hi! Your order is..."
                        />
                      </div>
                      <div>
                        <label className="text-xs text-zinc-400 mb-1 block">Phone Number Path (Leave empty to use event default)</label>
                        <input 
                          value={act.phone || ""} onChange={e => updateAction(i, "phone", e.target.value)}
                          className="w-full bg-[#111111] border border-white/10 rounded-lg p-2 text-white text-sm focus:outline-none"
                          placeholder="e.g. order.customerPhone"
                        />
                      </div>
                    </div>
                  )}

                  {act.type === "NOTIFY_OWNER" && (
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs text-zinc-400 mb-1 block">Alert Message</label>
                        <textarea 
                          value={act.message || ""} onChange={e => updateAction(i, "message", e.target.value)}
                          className="w-full bg-[#111111] border border-white/10 rounded-lg p-3 text-white text-sm focus:outline-none"
                          rows={2} placeholder="High value order received!"
                        />
                      </div>
                    </div>
                  )}

                  {act.type === "UPDATE_ORDER" && (
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs text-zinc-400 mb-1 block">Transition Command</label>
                        <select 
                          value={act.transition || ""} onChange={e => updateAction(i, "transition", e.target.value)}
                          className="w-full bg-[#111111] border border-white/10 rounded-lg p-2 text-white text-sm focus:outline-none"
                        >
                          <option value="">Select transition...</option>
                          <option value="CONFIRM">Auto-Confirm</option>
                          <option value="CANCEL">Cancel Order</option>
                        </select>
                      </div>
                    </div>
                  )}
                  
                </div>
              ))}
            </div>
          </div>

          {/* Spacer */}
          <div className="h-20"></div>
        </div>
      </div>

      {testModalOpen && (
        <AutomationTestModal 
          flow={flow} 
          onClose={() => setTestModalOpen(false)} 
        />
      )}
    </div>
  );
}
