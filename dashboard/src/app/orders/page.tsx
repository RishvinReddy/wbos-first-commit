import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, CheckCircle, AlertTriangle, Truck, MapPin, Phone, User, Check, Clock, Box, Activity } from "lucide-react";
import Link from "next/link";
import { fetchOrders } from "@/lib/api";

export default async function OrdersPage() {
  let pipeline = {
    new: [] as any[],
    confirmed: [] as any[],
    preparing: [] as any[],
    delivery: [] as any[]
  };
  
  let error = null;

  try {
    const data = await fetchOrders();
    
    // Group orders based on status (assuming status might be added by backend, or fallback to new)
    data.forEach(order => {
      const status = (order.status || "PENDING").toUpperCase();
      const orderObj = {
        id: order.orderId,
        customer: order.customer,
        time: new Date(order.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
        items: `${order.itemCount} items`,
        total: order.total
      };
      
      if (status === "PENDING") pipeline.new.push(orderObj);
      else if (status === "CONFIRMED") pipeline.confirmed.push(orderObj);
      else if (status === "PREPARING") pipeline.preparing.push(orderObj);
      else if (status === "READY" || status === "DELIVERY") pipeline.delivery.push(orderObj);
      else pipeline.new.push(orderObj);
    });
  } catch (err: any) {
    error = err.message || "Failed to fetch live orders data";
  }

  const OrderCard = ({ order, status }: { order: any, status: string }) => (
    <div className="bg-white/80 border border-white p-3 rounded-xl shadow-sm mb-3 cursor-pointer hover:shadow-md transition-shadow group">
      <div className="flex justify-between items-start mb-2">
        <div className="font-bold text-sm group-hover:text-wa-green transition-colors">{order.id}</div>
        <div className="text-[10px] text-text-muted font-bold flex items-center gap-1"><Clock className="h-3 w-3" /> {order.time}</div>
      </div>
      
      <Link href="/customers" className="text-sm font-bold text-text-primary mb-1 flex items-center gap-1.5 hover:text-wa-green transition-colors w-fit">
        <User className="h-3 w-3 text-text-muted" /> {order.customer}
      </Link>
      
      <Link href="/inventory" className="text-xs text-text-secondary font-medium mb-3 pb-3 border-b border-dashed border-black/5 flex items-start gap-1.5 hover:text-accent-indigo transition-colors">
        <Box className="h-3 w-3 text-text-muted mt-0.5 shrink-0" />
        {order.items}
      </Link>
      
      <div className="flex justify-between items-center">
        <div className="font-bold text-sm">₹{order.total}</div>
        <div className="flex items-center gap-2">
          <Link href="/events" className="text-text-muted hover:text-accent-cyan p-1 transition-colors">
            <Activity className="h-4 w-4" />
          </Link>
          <button className="bg-text-primary hover:bg-black text-white text-[10px] font-bold px-2 py-1 rounded-md transition-colors">
            View Details
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col gap-6 max-w-[1400px] mx-auto">
      <div className="flex justify-between items-end">
        <div className="flex flex-col gap-1">
          <h2 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">
            Order Operations
            <Badge className="bg-wa-green/20 text-wa-green border-wa-green/30 px-2 py-0.5 text-xs font-bold">LIVE DATA</Badge>
          </h2>
          <p className="text-text-muted font-medium">Pipeline execution & fulfillment</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-wa-green text-white hover:bg-wa-green-dark cursor-pointer text-xs font-bold px-3 py-1">Auto-Confirm: ON</Badge>
          <Badge className="bg-accent-indigo text-white hover:bg-indigo-600 cursor-pointer text-xs font-bold px-3 py-1">AI Routing: ON</Badge>
        </div>
      </div>
      
      {error && (
        <div className="p-4 bg-accent-red/10 border border-accent-red/30 rounded-xl text-accent-red text-sm font-bold flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" /> {error}
        </div>
      )}

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
            {pipeline.new.length === 0 && !error && <div className="text-center text-xs text-text-muted mt-4">No new orders</div>}
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
            {pipeline.confirmed.length === 0 && !error && <div className="text-center text-xs text-text-muted mt-4">No confirmed orders</div>}
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
            {pipeline.preparing.length === 0 && !error && <div className="text-center text-xs text-text-muted mt-4">No orders preparing</div>}
          </div>
        </div>

        {/* DELIVERY */}
        <div className="flex-1 min-w-[280px] flex flex-col bg-card/40 backdrop-blur-md rounded-2xl border border-border-color shadow-sm">
          <Link href="/delivery" className="p-3 border-b border-white/40 flex justify-between items-center bg-white/30 rounded-t-2xl hover:bg-white/50 transition-colors">
            <div className="font-bold text-sm flex items-center gap-2">
              <Truck className="h-4 w-4 text-wa-green" />
              Delivery
            </div>
            <span className="bg-wa-green/10 text-wa-green text-xs font-bold px-2 py-0.5 rounded-full">{pipeline.delivery.length}</span>
          </Link>
          <div className="flex-1 p-3 overflow-y-auto">
            {pipeline.delivery.map(order => <OrderCard key={order.id} order={order} status="delivery" />)}
            {pipeline.delivery.length === 0 && !error && <div className="text-center text-xs text-text-muted mt-4">No orders for delivery</div>}
          </div>
        </div>

      </div>
    </div>
  );
}
