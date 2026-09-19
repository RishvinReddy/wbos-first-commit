"use client";

import { useState } from "react";
import { fetchAuthSession } from "aws-amplify/auth";
import { X, Play, Beaker, CheckCircle2, AlertCircle, ArrowRight, Pause } from "lucide-react";

export default function AutomationTestModal({ flow, onClose }: { flow: any, onClose: () => void }) {
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<any>(null);
  
  // Provide some default dummy data based on trigger
  const [eventDataStr, setEventDataStr] = useState(() => {
    let dummy = {};
    if (flow.trigger.type?.includes("Order")) {
      dummy = {
        order: { orderId: "ORD_TEST123", total: 1000, customerPhone: "+123456789" },
        status: "NEW"
      };
    } else if (flow.trigger.type === "InventoryLow") {
      dummy = {
        product: { productId: "PRD_TEST", name: "Premium Widget", stock: 2 }
      };
    }
    return JSON.stringify(dummy, null, 2);
  });

  async function runTest() {
    setRunning(true);
    setResult(null);
    try {
      const session = await fetchAuthSession();
      const token = session.tokens?.idToken?.toString();
      
      let parsedData = {};
      try { parsedData = JSON.parse(eventDataStr); } catch (e) {
        alert("Invalid JSON event data");
        setRunning(false);
        return;
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/automations/test`, {
        method: "POST",
        headers: { 
          Authorization: token || "",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          trigger: flow.trigger,
          conditions: flow.conditions,
          actions: flow.actions,
          eventData: parsedData
        })
      });
      
      if (res.ok) {
        setResult(await res.json());
      }
    } catch (e) {
      console.error(e);
    }
    setRunning(false);
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#111111] border border-white/10 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-4 border-b border-white/10 flex justify-between items-center bg-[#1A1A1A]">
          <h2 className="text-white font-semibold flex items-center gap-2">
            <Beaker size={18} className="text-purple-400" /> Test Run: {flow.name}
          </h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-white p-1"><X size={20} /></button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Left panel: Input */}
          <div className="w-1/2 p-6 border-r border-white/10 overflow-y-auto">
            <h3 className="text-sm font-semibold text-white mb-3">Simulated Event Payload</h3>
            <p className="text-xs text-zinc-400 mb-4">Provide a JSON payload that simulates what EventBridge would send when the <strong>{flow.trigger.type}</strong> event occurs.</p>
            
            <textarea
              value={eventDataStr}
              onChange={e => setEventDataStr(e.target.value)}
              className="w-full h-64 bg-[#0A0A0A] border border-white/10 rounded-lg p-4 text-green-400 font-mono text-sm focus:outline-none focus:border-purple-500"
            />
            
            <button 
              onClick={runTest} disabled={running}
              className="w-full mt-6 bg-purple-600 hover:bg-purple-500 text-white p-3 rounded-xl font-medium flex items-center justify-center gap-2 transition"
            >
              {running ? "Running Test..." : <><Play size={18} /> Execute Test Run</>}
            </button>
            <p className="text-xs text-zinc-500 text-center mt-3">Side effects are disabled during test mode.</p>
          </div>

          {/* Right panel: Results */}
          <div className="w-1/2 bg-[#0A0A0A] p-6 overflow-y-auto relative">
            <h3 className="text-sm font-semibold text-white mb-6">Execution Trace</h3>
            
            {!result && !running && (
              <div className="flex flex-col items-center justify-center h-48 text-zinc-600 border border-dashed border-white/10 rounded-xl">
                <Beaker size={32} className="mb-2" />
                <p>Run the test to see the trace</p>
              </div>
            )}
            
            {running && (
              <div className="flex items-center gap-3 text-purple-400 font-medium">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-purple-500 border-t-transparent"></div>
                Evaluating engine...
              </div>
            )}
            
            {result && !running && (
              <div className="space-y-6 relative before:absolute before:inset-0 before:ml-[15px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/10 before:to-transparent">
                {result.trace.map((step: any, i: number) => (
                  <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    
                    {/* Icon marker */}
                    <div className="flex items-center justify-center w-8 h-8 rounded-full border border-white/10 bg-[#111111] text-zinc-400 z-10 
                                  shadow-[0_0_0_4px_#0A0A0A] shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2
                                  group-[.is-active]:text-white">
                      {step.status === "SUCCESS" ? <CheckCircle2 size={16} className="text-green-400" /> : 
                       step.status === "FAILED" ? <AlertCircle size={16} className="text-red-400" /> :
                       <Pause size={16} className="text-zinc-500" />}
                    </div>
                    
                    {/* Content */}
                    <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2rem)] p-4 rounded-xl border border-white/10 bg-[#111111] shadow">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold uppercase tracking-wider text-purple-400">{step.step}</span>
                        <span className={`text-xs font-medium ${step.status === 'SUCCESS' ? 'text-green-400' : step.status === 'SKIPPED' ? 'text-zinc-500' : 'text-red-400'}`}>{step.status}</span>
                      </div>
                      <p className="text-sm text-white font-medium break-words">{step.detail}</p>
                      {step.message && <p className="text-xs text-zinc-400 mt-2 italic">{step.message}</p>}
                    </div>
                  </div>
                ))}

                {/* Final Result Card */}
                <div className="relative flex justify-center pt-4 z-10">
                  <div className={`px-6 py-3 rounded-full flex items-center gap-2 border shadow-lg font-bold
                    ${result.result === 'SUCCESS' ? 'bg-green-900/30 border-green-500/30 text-green-400' : 
                      result.result === 'SKIPPED' ? 'bg-zinc-800 border-zinc-700 text-zinc-300' : 
                      'bg-red-900/30 border-red-500/30 text-red-400'}`}>
                    {result.result === 'SUCCESS' ? 'Test Completed' : result.result}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
