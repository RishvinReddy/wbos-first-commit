"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Send, Terminal, Sparkles, AlertTriangle, ArrowRight } from "lucide-react";

export default function AssistantPage() {
  const [query, setQuery] = useState("");
  const [history, setHistory] = useState<any[]>([
    {
      role: "assistant",
      content: "WBOS Intelligence is online. How can I help you manage operations today?",
      type: "text"
    }
  ]);

  const mockQuery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    const userQuery = query;
    setHistory([...history, { role: "user", content: userQuery, type: "text" }]);
    setQuery("");

    setTimeout(() => {
      let response;
      if (userQuery.toLowerCase().includes("stock") || userQuery.toLowerCase().includes("inventory")) {
        response = {
          role: "assistant",
          content: "3 products require attention.",
          type: "action",
          payload: [
            { name: "Basmati Rice", units: 18, status: "Low" },
            { name: "Sunflower Oil", units: 7, status: "Critical" },
            { name: "Toor Dal", units: 12, status: "Low" }
          ],
          recommendation: "Review reorder quantities for critical items immediately."
        };
      } else {
        response = {
          role: "assistant",
          content: "Query understood. In WBOS 2.0 (UI-4), this will trigger a Bedrock agent execution path to analyze Live AWS DynamoDB operational data.",
          type: "text"
        };
      }
      setHistory(prev => [...prev, response]);
    }, 600);
  };

  const QuickAction = ({ text }: { text: string }) => (
    <button 
      onClick={() => setQuery(text)}
      className="bg-card/40 backdrop-blur-md border border-white/60 hover:bg-white/60 text-xs font-bold px-3 py-2 rounded-lg transition-colors text-left"
    >
      {text}
    </button>
  );

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col gap-6 max-w-5xl mx-auto">
      <div className="flex flex-col gap-1">
        <h2 className="text-3xl font-extrabold tracking-tight flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-accent-indigo" />
          Intelligence Assistant
        </h2>
        <p className="text-text-muted font-medium">Business command interface powered by AWS Bedrock</p>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-2 -mt-2">
        <QuickAction text="Which products are low in stock?" />
        <QuickAction text="How much did we sell today?" />
        <QuickAction text="Show pending orders" />
        <QuickAction text="Which customer has the highest order value?" />
      </div>

      <Card className="flex-1 flex flex-col bg-[#1e1e1e] border-border-color shadow-card overflow-hidden relative">
        {/* Terminal Header */}
        <div className="h-10 bg-[#2d2d2d] flex items-center px-4 border-b border-black/40 shadow-subtle z-10 gap-2">
          <Terminal className="h-4 w-4 text-gray-400" />
          <span className="text-xs font-bold text-gray-400 font-jetbrains">wbos-bedrock-cli</span>
        </div>

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 z-10 font-jetbrains">
          {history.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-xl px-4 py-3 shadow-subtle ${msg.role === 'user' ? 'bg-wa-green/20 border border-wa-green/30 text-white' : 'bg-[#2d2d2d] border border-white/10 text-gray-200'}`}>
                {msg.role === 'user' ? (
                  <div className="text-sm font-medium">{msg.content}</div>
                ) : (
                  <div>
                    <div className="text-sm font-medium mb-2 text-wa-green flex items-center gap-2">
                      <Sparkles className="h-3 w-3" /> WBOS
                    </div>
                    <div className="text-sm leading-relaxed mb-2">{msg.content}</div>
                    
                    {msg.type === 'action' && msg.payload && (
                      <div className="mt-4 space-y-2">
                        {msg.payload.map((item: any, idx: number) => (
                          <div key={idx} className="flex items-center gap-3 bg-black/30 p-2 rounded border border-white/5">
                            <AlertTriangle className={`h-4 w-4 ${item.status === 'Critical' ? 'text-accent-red' : 'text-accent-amber'}`} />
                            <span className="font-bold">{item.name}</span>
                            <span className="text-gray-400 ml-auto">— {item.units} units</span>
                          </div>
                        ))}
                        {msg.recommendation && (
                          <div className="mt-4 p-3 bg-accent-indigo/10 border border-accent-indigo/20 rounded text-accent-indigo text-xs font-bold flex items-center justify-between">
                            <span>Recommended action: {msg.recommendation}</span>
                            <button className="bg-accent-indigo text-white px-2 py-1 rounded flex items-center gap-1 hover:bg-indigo-500 transition-colors">
                              Execute <ArrowRight className="h-3 w-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Command Input */}
        <div className="bg-[#2d2d2d] p-4 z-10 border-t border-black/40">
          <form onSubmit={mockQuery} className="relative flex items-center">
            <span className="absolute left-4 text-wa-green font-jetbrains font-bold">❯</span>
            <input 
              type="text" 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter operational command..." 
              className="w-full bg-[#1e1e1e] border border-white/10 rounded-lg pl-10 pr-12 py-3 text-sm text-white focus:outline-none focus:border-wa-green/50 font-jetbrains transition-colors"
            />
            <button 
              type="submit"
              className={`absolute right-2 p-2 rounded-md transition-colors ${query.trim() ? 'text-wa-green hover:bg-wa-green/10' : 'text-gray-500'}`}
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      </Card>
    </div>
  );
}
