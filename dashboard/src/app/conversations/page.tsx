"use client";

import { useState, useEffect } from 'react';
import { Search, Send, Paperclip, Smile, Check, CheckCheck, User, Package, Phone, Clock } from 'lucide-react';
import { useConversations } from '@/lib/conversationAdapter';
import { fetchOrders } from '@/lib/api';
import { OrderData, Conversation } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

const formatTime = (isoString?: string) => {
  if (!isoString) return '';
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  } catch (e) {
    return isoString;
  }
};

const maskPhone = (phone?: string) => {
  if (!phone) return '';
  if (phone.length < 9) return phone;
  return phone.substring(0, 9) + "•••••";
};

export default function ConversationsPage() {
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const { conversations, isLoading } = useConversations(selectedConversationId);
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    fetchOrders().then(setOrders).catch(console.error);
  }, []);

  const selectedConversation = conversations.find(c => c.id === selectedConversationId) || null;
  const filteredConversations = conversations.filter(c => {
    if (filter === 'unread' && c.unreadCount === 0) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return c.customer.name.toLowerCase().includes(q) || c.messages[c.messages.length - 1]?.content.toLowerCase().includes(q);
    }
    return true;
  });

  const getCustomerLatestOrder = (customerId: string) => {
    // Basic heuristic: find most recent order for this customer name/id
    const custOrders = orders.filter(o => o.customer.includes(customerId));
    return custOrders.length > 0 ? custOrders[0] : null;
  };

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)]">
      
      {/* Header / Status Bar */}
      <div className="flex items-center justify-between mb-4 flex-none">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--wbos-muted)' }}>Workspace</div>
          <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: 'var(--wbos-ink)' }}>Conversations</h1>
        </div>
        <div className="flex gap-4 items-center text-[10px] font-bold uppercase tracking-widest">
          <div className="flex items-center gap-1.5" style={{ color: 'var(--wbos-muted)' }}>
            <div className="w-2 h-2 rounded-full bg-green-500"></div> WhatsApp Connected
          </div>
          <div className="flex items-center gap-1.5" style={{ color: 'var(--wbos-muted)' }}>
            <div className="w-2 h-2 rounded-full bg-green-500"></div> AWS Connected
          </div>
          <div className="flex items-center gap-1.5" style={{ color: 'var(--wbos-muted)' }}>
            <div className="w-2 h-2 rounded-full bg-green-500"></div> EventBridge Active
          </div>
        </div>
      </div>

      {/* Main 3-pane layout */}
      <div className="flex flex-1 overflow-hidden rounded-xl border shadow-sm" style={{ background: 'var(--wbos-surface)', borderColor: 'var(--wbos-border)' }}>
        
        {/* LEFT PANE: Chat List */}
        <div className="w-full md:w-80 border-r flex flex-col" style={{ borderColor: 'var(--wbos-border)' }}>
          <div className="p-4 border-b" style={{ borderColor: 'var(--wbos-border)' }}>
            <div className="relative mb-4">
              <Search className="absolute left-3 top-2.5 h-4 w-4" style={{ color: 'var(--wbos-muted)' }} />
              <input 
                type="text" 
                placeholder="Search conversations..." 
                className="w-full pl-9 pr-4 py-2 text-sm rounded-md outline-none border transition-colors"
                style={{ background: 'var(--wbos-bg)', borderColor: 'var(--wbos-border)', color: 'var(--wbos-ink)' }}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => setFilter('all')}
                className={`text-xs font-semibold px-3 py-1 rounded-full transition-colors ${filter === 'all' ? 'bg-black text-white' : 'bg-transparent'}`}
                style={filter === 'all' ? {} : { color: 'var(--wbos-muted)', background: 'var(--wbos-bg)' }}
              >
                All
              </button>
              <button 
                onClick={() => setFilter('unread')}
                className={`text-xs font-semibold px-3 py-1 rounded-full transition-colors ${filter === 'unread' ? 'bg-black text-white' : 'bg-transparent'}`}
                style={filter === 'unread' ? {} : { color: 'var(--wbos-muted)', background: 'var(--wbos-bg)' }}
              >
                Unread
              </button>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="p-8 text-center text-sm" style={{ color: 'var(--wbos-muted)' }}>Loading...</div>
            ) : filteredConversations.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-sm font-medium mb-1" style={{ color: 'var(--wbos-ink)' }}>No conversations yet</p>
                <p className="text-xs" style={{ color: 'var(--wbos-muted)' }}>Incoming WhatsApp conversations will appear here when received.</p>
              </div>
            ) : (
              filteredConversations.map(conv => {
                const lastMsg = conv.messages[conv.messages.length - 1];
                const isSelected = selectedConversationId === conv.id;
                return (
                  <div 
                    key={conv.id} 
                    onClick={() => setSelectedConversationId(conv.id)}
                    className={`flex gap-3 p-4 cursor-pointer border-b transition-colors ${isSelected ? 'bg-gray-50/50' : 'hover:bg-gray-50/50'}`}
                    style={{ borderColor: 'var(--wbos-border)' }}
                  >
                    <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold flex-none" style={{ background: 'var(--wbos-bg)', color: 'var(--wbos-ink)' }}>
                      {conv.customer.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline mb-1">
                        <span className="font-semibold text-sm truncate" style={{ color: 'var(--wbos-ink)' }}>{conv.customer.name}</span>
                        <span className="text-[10px]" style={{ color: conv.unreadCount > 0 ? '#10b981' : 'var(--wbos-muted)' }}>
                          {formatTime(lastMsg?.timestamp || conv.updatedAt)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <p className="text-xs truncate mr-2" style={{ color: 'var(--wbos-muted)' }}>
                          {lastMsg?.sender === 'wbos' && <span className="inline-block mr-1">✓✓</span>}
                          {lastMsg?.content || "No messages"}
                        </p>
                        {conv.unreadCount > 0 && (
                          <span className="w-5 h-5 rounded-full bg-green-500 text-white text-[10px] flex items-center justify-center flex-none">
                            {conv.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* CENTER PANE: Conversation */}
        <div className={`flex-1 flex flex-col ${!selectedConversationId ? 'hidden md:flex' : 'flex'}`}>
          {!selectedConversation ? (
            <div className="flex-1 flex flex-col items-center justify-center" style={{ background: 'var(--wbos-bg)' }}>
              <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ background: 'var(--wbos-surface)', color: 'var(--wbos-muted)' }}>
                <Phone className="w-8 h-8" />
              </div>
              <h2 className="text-lg font-bold mb-2" style={{ color: 'var(--wbos-ink)' }}>WBOS Inbox</h2>
              <p className="text-sm max-w-xs text-center" style={{ color: 'var(--wbos-muted)' }}>
                Select a conversation or wait for incoming WhatsApp messages.
              </p>
            </div>
          ) : (
            <>
              {/* Chat Header */}
              <div className="flex items-center gap-3 p-4 border-b flex-none" style={{ borderColor: 'var(--wbos-border)', background: 'var(--wbos-surface)' }}>
                <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold flex-none" style={{ background: 'var(--wbos-bg)', color: 'var(--wbos-ink)' }}>
                  {selectedConversation.customer.name.charAt(0)}
                </div>
                <div>
                  <h2 className="font-semibold text-sm" style={{ color: 'var(--wbos-ink)' }}>{selectedConversation.customer.name}</h2>
                  <p className="text-xs" style={{ color: 'var(--wbos-muted)' }}>{maskPhone(selectedConversation.customer.phone)}</p>
                </div>
              </div>

              {/* Chat History */}
              <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4" style={{ background: 'var(--wbos-bg)' }}>
                <div className="flex justify-center my-2">
                  <span className="text-[10px] px-3 py-1 rounded-full font-medium" style={{ background: 'var(--wbos-surface)', color: 'var(--wbos-muted)' }}>TODAY</span>
                </div>
                
                {selectedConversation.messages.map(msg => {
                  const isWbos = msg.sender === 'wbos';
                  return (
                    <div key={msg.id} className={`flex flex-col max-w-[75%] ${isWbos ? 'self-end items-end' : 'self-start items-start'}`}>
                      <div 
                        className={`p-3 rounded-lg text-sm shadow-sm whitespace-pre-wrap ${isWbos ? 'bg-black text-white rounded-tr-none' : 'rounded-tl-none'}`}
                        style={isWbos ? {} : { background: 'var(--wbos-surface)', color: 'var(--wbos-ink)' }}
                      >
                        {msg.content}
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        <span className="text-[10px]" style={{ color: 'var(--wbos-muted)' }}>{formatTime(msg.timestamp)}</span>
                        {isWbos && msg.status && (
                          <span className="text-[10px]" style={{ color: msg.status === 'read' ? '#3b82f6' : 'var(--wbos-muted)' }}>
                            {msg.status === 'sent' ? <Check className="w-3 h-3" /> : <CheckCheck className="w-3 h-3" />}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Chat Composer */}
              <div className="p-4 border-t flex flex-col items-center justify-center text-center py-6" style={{ borderColor: 'var(--wbos-border)', background: 'var(--wbos-surface)' }}>
                <p className="text-sm font-semibold mb-1" style={{ color: 'var(--wbos-ink)' }}>Outbound dashboard messaging coming soon</p>
                <p className="text-xs max-w-sm mb-4" style={{ color: 'var(--wbos-muted)' }}>
                  This prototype currently sends customer replies via the live automated WhatsApp workflow. Manual outbound messaging is planned for a future release.
                </p>
                <div className="w-full flex gap-3 items-center opacity-50 pointer-events-none">
                  <div className="flex-1">
                    <input 
                      type="text" 
                      placeholder="Type a message... (Disabled)" 
                      className="w-full px-4 py-2 text-sm rounded-full outline-none border transition-colors"
                      style={{ background: 'var(--wbos-bg)', borderColor: 'var(--wbos-border)', color: 'var(--wbos-ink)' }}
                      disabled
                    />
                  </div>
                  <button className="p-3 bg-black text-white rounded-full transition-colors" disabled>
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* RIGHT PANE: Customer Context */}
        {selectedConversation && (
          <div className="w-80 border-l flex flex-col hidden lg:flex overflow-y-auto" style={{ borderColor: 'var(--wbos-border)', background: 'var(--wbos-bg)' }}>
            <div className="p-6 flex flex-col items-center border-b text-center" style={{ borderColor: 'var(--wbos-border)' }}>
              <div className="w-20 h-20 rounded-full flex items-center justify-center font-bold text-2xl mb-4" style={{ background: 'var(--wbos-surface)', color: 'var(--wbos-ink)' }}>
                {selectedConversation.customer.name.charAt(0)}
              </div>
              <h3 className="font-bold text-lg mb-1" style={{ color: 'var(--wbos-ink)' }}>{selectedConversation.customer.name}</h3>
              <p className="text-sm font-medium mb-3" style={{ color: 'var(--wbos-muted)' }}>{maskPhone(selectedConversation.customer.phone)}</p>
              <Badge variant="outline" className="text-[10px] uppercase tracking-wider">{selectedConversation.customer.status}</Badge>
            </div>

            <div className="p-6">
              <h4 className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: 'var(--wbos-muted)' }}>Orders</h4>
              
              {(() => {
                const latestOrder = getCustomerLatestOrder(selectedConversation.customer.name);
                if (!latestOrder) return <p className="text-sm" style={{ color: 'var(--wbos-muted)' }}>No recent orders found.</p>;
                return (
                  <Card className="shadow-none" style={{ borderColor: 'var(--wbos-border)' }}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-bold flex justify-between">
                        <span>#{latestOrder.orderId}</span>
                        <span className="text-green-600">${latestOrder.total.toFixed(2)}</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm">
                      <div className="flex items-center gap-2 mb-2" style={{ color: 'var(--wbos-ink)' }}>
                        <Package className="w-4 h-4" style={{ color: 'var(--wbos-muted)' }} />
                        <span className="font-medium">{latestOrder.status || 'Processing'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--wbos-muted)' }}>
                        <Clock className="w-4 h-4" />
                        <span>{new Date(latestOrder.createdAt).toLocaleDateString()}</span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })()}

              <div className="mt-8 space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--wbos-muted)' }}>Actions</h4>
                <Button variant="outline" className="w-full justify-between text-sm h-9" disabled>
                  <span>View customer</span>
                  <span className="text-[10px] uppercase font-bold" style={{ color: 'var(--wbos-muted)' }}>Soon</span>
                </Button>
                <Button variant="outline" className="w-full justify-between text-sm h-9" disabled>
                  <span>View orders</span>
                  <span className="text-[10px] uppercase font-bold" style={{ color: 'var(--wbos-muted)' }}>Soon</span>
                </Button>
                <Button variant="outline" className="w-full justify-between text-sm h-9" disabled>
                  <span>Create order</span>
                  <span className="text-[10px] uppercase font-bold" style={{ color: 'var(--wbos-muted)' }}>Soon</span>
                </Button>
                <Button variant="outline" className="w-full justify-between text-sm h-9" disabled>
                  <span>Send invoice</span>
                  <span className="text-[10px] uppercase font-bold" style={{ color: 'var(--wbos-muted)' }}>Soon</span>
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
