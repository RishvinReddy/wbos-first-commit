import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, CheckCircle, AlertTriangle, Truck, MapPin, Phone, User, Check, Clock } from "lucide-react";

export default function OrdersPage() {
  const pipeline = {
    new: [
      { id: "#1044", customer: "Neha Verma", time: "5m ago", items: "5kg Atta, 1L Milk", total: 320 },
      { id: "#1045", customer: "Sanjay Kumar", time: "2m ago", items: "Bread, Eggs, Butter", total: 180 },
    ],
    confirmed: [
      { id: "#1043", customer: "Priya Reddy", time: "15m ago", items: "500g Sugar, Tea", total: 120 },
    ],
    preparing: [
      { id: "#1042", customer: "Rahul Sharma", time: "30m ago", items: "2kg Basmati Rice, 1L Oil", total: 540 },
    ],
    delivery: [
      { id: "#1041", customer: "Arjun Kumar", time: "45m ago", items: "Weekly Groceries", total: 1450 },
      { id: "#1039", customer: "Vikas Singh", time: "1h ago", items: "Snacks & Drinks", total: 450 },
    ]
  };

  const OrderCard = ({ order, status }: { order: any, status: string }) => (
    <div className="bg-white/80 border border-white p-3 rounded-xl shadow-sm mb-3 cursor-pointer hover:shadow-md transition-shadow group">
      <div className="flex justify-between items-start mb-2">
        <div className="font-bold text-sm group-hover:text-wa-green transition-colors">{order.id}</div>
        <div className="text-[10px] text-text-muted font-bold flex items-center gap-1"><Clock className="h-3 w-3" /> {order.time}</div>
      </div>
      <div className="text-sm font-bold text-text-primary mb-1 flex items-center gap-1.5">
        <User className="h-3 w-3 text-text-muted" /> {order.customer}
      </div>
      <div className="text-xs text-text-secondary font-medium mb-3 pb-3 border-b border-dashed border-black/5">
        {order.items}
      </div>
      <div className="flex justify-between items-center">
        <div className="font-bold text-sm">₹{order.total}</div>
        <button className="bg-text-primary hover:bg-black text-white text-[10px] font-bold px-2 py-1 rounded-md transition-colors">
          View Details
        </button>
      </div>
    </div>
  );

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col gap-6 max-w-[1400px] mx-auto">
      <div className="flex justify-between items-end">
        <div className="flex flex-col gap-1">
          <h2 className="text-3xl font-extrabold tracking-tight">Order Operations</h2>
          <p className="text-text-muted font-medium">Pipeline execution & fulfillment</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-wa-green text-white hover:bg-wa-green-dark cursor-pointer text-xs font-bold px-3 py-1">Auto-Confirm: ON</Badge>
          <Badge className="bg-accent-indigo text-white hover:bg-indigo-600 cursor-pointer text-xs font-bold px-3 py-1">AI Routing: ON</Badge>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 flex gap-4 overflow-x-auto pb-4">
        
        {/* NEW */}
        <div className="flex-1 min-w-[280px] flex flex-col bg-card/40 backdrop-blur-md rounded-2xl border border-border-color shadow-sm">
          <div className="p-3 border-b border-white/40 flex justify-between items-center bg-white/30 rounded-t-2xl">
            <div className="font-bold text-sm flex items-center gap-2">
              <ShoppingCart className="h-4 w-4 text-accent-indigo" />
              New
            </div>
            <span className="bg-accent-indigo/10 text-accent-indigo text-xs font-bold px-2 py-0.5 rounded-full">{pipeline.new.length}</span>
          </div>
          <div className="flex-1 p-3 overflow-y-auto">
            {pipeline.new.map(order => <OrderCard key={order.id} order={order} status="new" />)}
          </div>
        </div>

        {/* CONFIRMED */}
        <div className="flex-1 min-w-[280px] flex flex-col bg-card/40 backdrop-blur-md rounded-2xl border border-border-color shadow-sm">
          <div className="p-3 border-b border-white/40 flex justify-between items-center bg-white/30 rounded-t-2xl">
            <div className="font-bold text-sm flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-accent-cyan" />
              Confirmed
            </div>
            <span className="bg-accent-cyan/10 text-accent-cyan text-xs font-bold px-2 py-0.5 rounded-full">{pipeline.confirmed.length}</span>
          </div>
          <div className="flex-1 p-3 overflow-y-auto">
            {pipeline.confirmed.map(order => <OrderCard key={order.id} order={order} status="confirmed" />)}
          </div>
        </div>

        {/* PREPARING */}
        <div className="flex-1 min-w-[280px] flex flex-col bg-card/40 backdrop-blur-md rounded-2xl border border-border-color shadow-sm">
          <div className="p-3 border-b border-white/40 flex justify-between items-center bg-white/30 rounded-t-2xl">
            <div className="font-bold text-sm flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-accent-amber" />
              Preparing
            </div>
            <span className="bg-accent-amber/10 text-accent-amber text-xs font-bold px-2 py-0.5 rounded-full">{pipeline.preparing.length}</span>
          </div>
          <div className="flex-1 p-3 overflow-y-auto">
            {pipeline.preparing.map(order => <OrderCard key={order.id} order={order} status="preparing" />)}
          </div>
        </div>

        {/* DELIVERY */}
        <div className="flex-1 min-w-[280px] flex flex-col bg-card/40 backdrop-blur-md rounded-2xl border border-border-color shadow-sm">
          <div className="p-3 border-b border-white/40 flex justify-between items-center bg-white/30 rounded-t-2xl">
            <div className="font-bold text-sm flex items-center gap-2">
              <Truck className="h-4 w-4 text-wa-green" />
              Delivery
            </div>
            <span className="bg-wa-green/10 text-wa-green text-xs font-bold px-2 py-0.5 rounded-full">{pipeline.delivery.length}</span>
          </div>
          <div className="flex-1 p-3 overflow-y-auto">
            {pipeline.delivery.map(order => <OrderCard key={order.id} order={order} status="delivery" />)}
          </div>
        </div>

      </div>
    </div>
  );
}
