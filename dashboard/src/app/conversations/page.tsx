"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Search, MoreVertical, Paperclip, Send, Check, CheckCheck } from "lucide-react";

export default function ConversationsPage() {
  const [message, setMessage] = useState("");

  const contacts = [
    { name: "Rahul Sharma", time: "10:42 AM", preview: "I need 2kg basmati rice", unread: 2, active: true },
    { name: "Priya Reddy", time: "Yesterday", preview: "Perfect, thanks!", unread: 0, active: false },
    { name: "Arjun Kumar", time: "Tuesday", preview: "When will it arrive?", unread: 0, active: false },
    { name: "Sneha Gupta", time: "Monday", preview: "Can I add 1L oil to my order?", unread: 0, active: false },
  ];

  const chat = [
    { sender: "Customer", time: "10:30 AM", text: "Hi, do you have Basmati rice in stock?" },
    { sender: "WBOS", time: "10:30 AM", text: "Yes, we have Basmati Rice available. How much do you need?", isBot: true },
    { sender: "Customer", time: "10:42 AM", text: "I need 2kg basmati rice and cooking oil" },
  ];

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    // In UI-4 this will actually post to our demo API.
    setMessage("");
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex gap-6 max-w-6xl mx-auto">
      
      {/* 1. Contacts Sidebar */}
      <Card className="w-80 flex flex-col bg-card/60 backdrop-blur-md border-border-color shadow-card overflow-hidden">
        <div className="p-4 border-b border-white/20 bg-white/40">
          <h2 className="font-bold text-lg mb-4">Conversations</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
            <input 
              type="text" 
              placeholder="Search customers..." 
              className="w-full bg-white/60 border border-white rounded-xl pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-wa-green/30"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {contacts.map((contact, i) => (
            <div 
              key={i} 
              className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors ${
                contact.active ? 'bg-white shadow-sm border border-black/5' : 'hover:bg-white/40 border border-transparent'
              }`}
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-text-secondary font-bold text-lg shrink-0">
                {contact.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-0.5">
                  <div className="font-bold text-sm truncate">{contact.name}</div>
                  <div className={`text-[10px] font-bold ${contact.unread > 0 ? 'text-wa-green' : 'text-text-muted'}`}>
                    {contact.time}
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="text-xs text-text-secondary font-medium truncate pr-2">
                    {contact.preview}
                  </div>
                  {contact.unread > 0 && (
                    <div className="bg-wa-green text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center shrink-0">
                      {contact.unread}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* 2. WhatsApp Simulator */}
      <Card className="flex-1 flex flex-col bg-[#efeae2] border-border-color shadow-card overflow-hidden relative">
        {/* Chat Header */}
        <div className="h-16 bg-white flex items-center justify-between px-4 shadow-sm z-10 border-b border-black/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-text-secondary font-bold">
              R
            </div>
            <div>
              <div className="font-bold">Rahul Sharma</div>
              <div className="text-xs text-text-muted font-medium">Customer • +91 98765 43210</div>
            </div>
          </div>
          <div className="flex items-center gap-4 text-text-muted">
            <Search className="h-5 w-5 cursor-pointer hover:text-text-primary transition-colors" />
            <MoreVertical className="h-5 w-5 cursor-pointer hover:text-text-primary transition-colors" />
          </div>
        </div>

        {/* Chat Background Pattern */}
        <div className="absolute inset-0 opacity-40 pointer-events-none" style={{ backgroundImage: 'url("https://w0.peakpx.com/wallpaper/818/148/HD-wallpaper-whatsapp-background-solid-color-thumbnail.jpg")', backgroundSize: 'cover', backgroundPosition: 'center', mixBlendMode: 'multiply' }}></div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 z-10 space-y-4">
          <div className="flex justify-center mb-6">
            <div className="bg-[#e1f3fb] text-[#4a5e66] text-xs font-semibold px-3 py-1 rounded-lg shadow-sm border border-black/5">
              TODAY
            </div>
          </div>

          {chat.map((msg, i) => {
            const isBot = msg.isBot;
            return (
              <div key={i} className={`flex ${isBot ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[70%] rounded-lg px-3 py-2 shadow-sm relative ${isBot ? 'bg-[#d9fdd3] rounded-tr-none' : 'bg-white rounded-tl-none'}`}>
                  {/* Tail indicator for WhatsApp bubble */}
                  <div className={`absolute top-0 w-3 h-3 ${isBot ? '-right-2 text-[#d9fdd3]' : '-left-2 text-white'}`}>
                    <svg viewBox="0 0 8 13" width="8" height="13" className="fill-current"><path d={isBot ? "M5.188 1H0v11.193l6.467-8.625C7.526 2.156 6.958 1 5.188 1z" : "M2.812 1H8v11.193L1.533 3.568C.474 2.156 1.042 1 2.812 1z"}></path></svg>
                  </div>
                  
                  <div className="text-[14px] text-[#111b21] leading-relaxed break-words">{msg.text}</div>
                  <div className="flex items-center justify-end gap-1 mt-1">
                    <span className="text-[10px] text-[#667781] font-medium">{msg.time}</span>
                    {isBot && <CheckCheck className="h-3 w-3 text-[#53bdeb]" />}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Chat Input */}
        <div className="bg-[#f0f2f5] p-3 z-10 flex items-end gap-2 border-t border-black/5">
          <button className="p-2 text-text-muted hover:text-text-primary transition-colors">
            <Paperclip className="h-6 w-6" />
          </button>
          
          <form onSubmit={handleSend} className="flex-1">
            <input 
              type="text" 
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message..." 
              className="w-full bg-white rounded-xl px-4 py-3 text-[15px] focus:outline-none shadow-sm"
            />
          </form>
          
          {message.trim() ? (
            <button 
              onClick={handleSend}
              className="w-12 h-12 rounded-full bg-wa-green text-white flex items-center justify-center hover:bg-wa-green-dark transition-colors shadow-sm shrink-0"
            >
              <Send className="h-5 w-5 ml-1" />
            </button>
          ) : (
            <button className="w-12 h-12 rounded-full bg-transparent text-text-muted hover:text-text-primary flex items-center justify-center transition-colors shrink-0">
              <svg viewBox="0 0 24 24" width="24" height="24" className="fill-current"><path d="M11.999 14.942c2.001 0 3.531-1.53 3.531-3.531V4.35c0-2.001-1.53-3.531-3.531-3.531S8.469 2.35 8.469 4.35v7.061c0 2.001 1.53 3.531 3.53 3.531zm6.238-3.53c0 3.531-2.942 6.002-6.237 6.002s-6.237-2.471-6.237-6.002H3.761c0 4.001 3.178 7.297 7.061 7.885v3.884h2.354v-3.884c3.884-.588 7.061-3.884 7.061-7.885h-2.002z"></path></svg>
            </button>
          )}
        </div>
      </Card>
    </div>
  );
}
