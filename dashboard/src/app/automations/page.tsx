"use client";

import { useState, useEffect } from "react";
import { fetchAuthSession } from "aws-amplify/auth";
import Link from "next/link";
import { Zap, Plus, Search, Activity, Pause, CheckCircle2, AlertCircle, Clock, Play } from "lucide-react";

export default function AutomationsPage() {
  const [automations, setAutomations] = useState([]);
  const [executions, setExecutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("flows");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const session = await fetchAuthSession();
      const token = session.tokens?.idToken?.toString();

      const [autoRes, execRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/automations`, {
          headers: { Authorization: token || "" },
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/automations/executions`, {
          headers: { Authorization: token || "" },
        })
      ]);

      if (autoRes.ok) setAutomations(await autoRes.json());
      if (execRes.ok) setExecutions(await execRes.json());
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }

  async function createFlow() {
    try {
      const session = await fetchAuthSession();
      const token = session.tokens?.idToken?.toString();
      
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/automations`, {
        method: "POST",
        headers: { 
          Authorization: token || "",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: "New Automation Flow",
          description: "Describe what this automation does...",
          trigger: { type: "OrderCreated" },
          conditions: [],
          actions: []
        })
      });
      
      if (res.ok) {
        const flow = await res.json();
        window.location.href = `/automations/builder/${flow.id}`;
      }
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Automations</h1>
          <p className="text-zinc-400 text-sm mt-1">Event-driven workflows for your business.</p>
        </div>
        <button
          onClick={createFlow}
          className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-medium transition-colors"
        >
          <Plus size={16} />
          Create Flow
        </button>
      </div>

      <div className="flex border-b border-white/10 gap-6">
        <button
          onClick={() => setActiveTab("flows")}
          className={`pb-3 text-sm font-medium ${activeTab === 'flows' ? 'text-white border-b-2 border-purple-500' : 'text-zinc-400 hover:text-zinc-300'}`}
        >
          My Flows
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`pb-3 text-sm font-medium ${activeTab === 'history' ? 'text-white border-b-2 border-purple-500' : 'text-zinc-400 hover:text-zinc-300'}`}
        >
          Execution History
        </button>
      </div>

      {loading ? (
        <div className="h-40 flex items-center justify-center text-zinc-500">Loading automations...</div>
      ) : activeTab === "flows" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {automations.map((flow: any) => (
            <div key={flow.id} className="bg-[#111111] border border-white/10 rounded-xl p-5 hover:border-white/20 transition-all flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-3">
                  <div className={`p-2 rounded-lg ${flow.status === 'ACTIVE' ? 'bg-green-500/10 text-green-400' : 'bg-zinc-800 text-zinc-400'}`}>
                    {flow.status === 'ACTIVE' ? <Activity size={18} /> : <Pause size={18} />}
                  </div>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${flow.status === 'ACTIVE' ? 'bg-green-500/10 text-green-400' : 'bg-white/5 text-zinc-400'}`}>
                    {flow.status} v{flow.version}
                  </span>
                </div>
                <h3 className="font-semibold text-white mb-1">{flow.name}</h3>
                <p className="text-sm text-zinc-400 line-clamp-2">{flow.description}</p>
                
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="text-xs bg-purple-500/10 text-purple-400 px-2 py-1 rounded border border-purple-500/20">
                    IF {flow.trigger.type}
                  </span>
                </div>
              </div>
              
              <div className="mt-6 pt-4 border-t border-white/10 flex justify-between items-center">
                <span className="text-xs text-zinc-500">Updated {new Date(flow.updatedAt).toLocaleDateString()}</span>
                <Link href={`/automations/builder/${flow.id}`} className="text-sm text-white hover:text-purple-400 font-medium">
                  Edit Flow →
                </Link>
              </div>
            </div>
          ))}
          {automations.length === 0 && (
            <div className="col-span-full py-12 text-center bg-[#111111] rounded-xl border border-white/5">
              <Zap size={32} className="mx-auto text-zinc-600 mb-3" />
              <h3 className="text-zinc-300 font-medium">No Automations Found</h3>
              <p className="text-zinc-500 text-sm mt-1">Create your first automated workflow to save time.</p>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-[#111111] rounded-xl border border-white/10 overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 border-b border-white/10 text-zinc-400 font-medium">
              <tr>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Automation</th>
                <th className="px-4 py-3">Trigger</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {executions.map((exec: any) => (
                <tr key={exec.executionId} className="hover:bg-white/5">
                  <td className="px-4 py-3">
                    {exec.status === "SUCCESS" && <span className="flex items-center gap-1.5 text-green-400"><CheckCircle2 size={14} /> Success</span>}
                    {exec.status === "SKIPPED" && <span className="flex items-center gap-1.5 text-zinc-400"><Pause size={14} /> Skipped</span>}
                    {exec.status === "FAILED" && <span className="flex items-center gap-1.5 text-red-400"><AlertCircle size={14} /> Failed</span>}
                  </td>
                  <td className="px-4 py-3 text-white font-medium">{exec.automationName}</td>
                  <td className="px-4 py-3 text-zinc-400">{exec.triggerEvent}</td>
                  <td className="px-4 py-3 text-zinc-400 flex items-center gap-2">
                    <Clock size={14} /> {new Date(exec.startedAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button className="text-purple-400 hover:text-purple-300 font-medium text-xs">
                      View Trace
                    </button>
                  </td>
                </tr>
              ))}
              {executions.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-zinc-500">
                    No execution history found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
