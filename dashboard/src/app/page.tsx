import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  IndianRupee, 
  ShoppingCart, 
  TrendingUp, 
  Truck,
  ArrowRight
} from "lucide-react";
import { fetchMetrics, fetchOrders } from "@/lib/api";

export default async function ExecutiveCockpit() {
  let metrics = {
    total_sales: 0,
    order_count: 0,
    average_order_value: 0,
  };
  
  let pipeline: any[] = [];
  let error = null;

  try {
    const [metricsData, ordersData] = await Promise.all([
      fetchMetrics(),
      fetchOrders()
    ]);
    
    metrics = {
      total_sales: metricsData.total_sales,
      order_count: metricsData.order_count,
      average_order_value: metricsData.average_order_value
    };
    
    pipeline = ordersData.slice(0, 5); // Take top 5 for cockpit
  } catch (err: any) {
    error = err.message || "Failed to load live AWS data";
  }

  // Active delivery count can be derived from pipeline or mocked for UI-4 if not available
  const deliveryActive = 0; 

  const inventory = [
    { name: "Basmati Rice 1kg", stock: 8, status: "low", price: "₹150" },
    { name: "Cooking Oil 1L", stock: 6, status: "low", price: "₹180" },
    { name: "Sugar 1kg", stock: 45, status: "healthy", price: "₹50" },
  ];

  const systemEvents = [
    { type: "OrderCreated", time: "2 sec ago", source: "EventBridge" },
    { type: "InventoryUpdated", time: "1 sec ago", source: "DynamoDB" },
    { type: "InvoiceGenerated", time: "1 sec ago", source: "Lambda → S3" },
    { type: "DashboardEvent", time: "Just now", source: "EventBridge" }
  ];

  return (
    <div className="space-y-6 max-w-[1200px]">
      <div className="flex flex-col gap-1.5 mb-8">
        <h2 className="text-3xl font-extrabold tracking-tight text-wbos-ink">Good evening, Owner</h2>
        <div className="flex items-center gap-3">
          <p className="text-wbos-muted text-sm font-medium">Here's what's happening across your business today.</p>
          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-success"></span>
            <span className="text-[10px] font-bold text-wbos-ink uppercase tracking-wider">LIVE AWS DATA</span>
          </div>
        </div>
      </div>
      
      {error && (
        <div className="p-4 bg-danger-soft border border-danger/30 rounded-xl text-danger text-sm font-bold flex items-center gap-2">
          {error}
        </div>
      )}
      
      {/* KPI Row */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-wbos-surface border-wbos-border shadow-subtle p-5 rounded-xl">
          <div className="flex flex-row items-center justify-between pb-3">
            <h3 className="text-[11px] font-bold text-wbos-muted uppercase tracking-wider">Revenue</h3>
            <div className="p-1.5 bg-success-soft rounded-md">
              <IndianRupee className="h-3.5 w-3.5 text-success" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-wbos-ink">₹{metrics.total_sales.toLocaleString()}</div>
            <p className="text-xs text-wbos-muted font-medium mt-1">Live revenue</p>
          </div>
        </Card>
        
        <Card className="bg-wbos-surface border-wbos-border shadow-subtle p-5 rounded-xl">
          <div className="flex flex-row items-center justify-between pb-3">
            <h3 className="text-[11px] font-bold text-wbos-muted uppercase tracking-wider">Orders</h3>
            <div className="p-1.5 bg-info-soft rounded-md">
              <ShoppingCart className="h-3.5 w-3.5 text-info" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-wbos-ink">{metrics.order_count}</div>
            <p className="text-xs text-wbos-muted font-medium mt-1">Processed today</p>
          </div>
        </Card>

        <Card className="bg-wbos-surface border-wbos-border shadow-subtle p-5 rounded-xl">
          <div className="flex flex-row items-center justify-between pb-3">
            <h3 className="text-[11px] font-bold text-wbos-muted uppercase tracking-wider">AOV</h3>
            <div className="p-1.5 bg-warning-soft rounded-md">
              <TrendingUp className="h-3.5 w-3.5 text-warning" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-wbos-ink">₹{metrics.average_order_value}</div>
            <p className="text-xs text-wbos-muted font-medium mt-1">Average order value</p>
          </div>
        </Card>

        <Card className="bg-wbos-surface border-wbos-border shadow-subtle p-5 rounded-xl">
          <div className="flex flex-row items-center justify-between pb-3">
            <h3 className="text-[11px] font-bold text-wbos-muted uppercase tracking-wider">Delivery</h3>
            <div className="p-1.5 bg-event-soft rounded-md">
              <Truck className="h-3.5 w-3.5 text-event" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-wbos-ink">{deliveryActive}</div>
            <p className="text-xs text-wbos-muted font-medium mt-1">Active operations</p>
          </div>
        </Card>
      </div>

      {/* Row 2 */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-12">
        <Card className="lg:col-span-8 bg-wbos-surface border-wbos-border shadow-subtle p-6 rounded-xl flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-[11px] font-bold text-wbos-muted uppercase tracking-wider">Live Operations</h3>
            <div className="text-[10px] font-bold text-success uppercase tracking-wider bg-success-soft px-2 py-0.5 rounded-md">Pipeline Active</div>
          </div>
          <div className="flex-1 space-y-3">
             {pipeline.length === 0 && !error && (
               <div className="text-center py-8 text-wbos-muted font-medium text-sm border border-dashed border-wbos-border rounded-lg">
                 No active orders right now.
               </div>
             )}
             {pipeline.map((order, i) => (
               <div key={i} className="flex flex-col p-4 rounded-lg border border-wbos-border bg-wbos-surface hover:bg-wbos-bg transition-colors">
                 <div className="flex items-center justify-between mb-3 border-b border-wbos-border pb-3">
                   <div className="flex items-center gap-3">
                     <ShoppingCart className="h-4 w-4 text-wbos-muted" />
                     <span className="font-bold text-wbos-ink text-sm">{order.orderId}</span>
                   </div>
                   <div className="text-xs font-bold text-warning uppercase tracking-wider">Pending</div>
                 </div>
                 <div className="flex items-center justify-between text-xs">
                   <div className="flex gap-6">
                     <div className="flex flex-col">
                       <span className="text-wbos-muted mb-0.5">Customer</span>
                       <span className="font-semibold text-wbos-ink">{order.customer}</span>
                     </div>
                     <div className="flex flex-col">
                       <span className="text-wbos-muted mb-0.5">Items</span>
                       <span className="font-semibold text-wbos-ink">{order.itemCount}</span>
                     </div>
                     <div className="flex flex-col">
                       <span className="text-wbos-muted mb-0.5">Value</span>
                       <span className="font-semibold text-wbos-ink">₹{order.total}</span>
                     </div>
                   </div>
                   <div className="text-wbos-muted">{new Date(order.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                 </div>
                 <div className="mt-4 pt-3 border-t border-dashed border-wbos-border flex items-center gap-2 text-[11px] font-bold text-wbos-muted">
                    <span className="text-success">Order created</span> → 
                    <span>Inventory</span> → 
                    <span>Invoice</span> → 
                    <span>Event</span>
                 </div>
               </div>
             ))}
          </div>
        </Card>

        <Card className="lg:col-span-4 bg-wbos-surface border-wbos-border shadow-subtle p-6 rounded-xl flex flex-col">
          <div className="mb-6">
            <h3 className="text-[11px] font-bold text-wbos-muted uppercase tracking-wider">Event Stream</h3>
          </div>
          <div className="flex-1">
             <div className="space-y-6 relative before:absolute before:inset-0 before:ml-[5px] before:translate-x-0 before:h-full before:w-[2px] before:bg-wbos-border">
               {systemEvents.map((event, i) => (
                 <div key={i} className="relative flex items-start gap-4">
                   <div className="flex items-center justify-center w-3 h-3 rounded-full bg-wbos-surface border-[3px] border-event shrink-0 z-10 mt-1"></div>
                   <div className="flex-1">
                     <div className="text-sm font-semibold text-wbos-ink mb-0.5">{event.type}</div>
                     <div className="text-[11px] text-wbos-muted font-medium">
                       {event.time} · {event.source}
                     </div>
                   </div>
                 </div>
               ))}
             </div>
          </div>
        </Card>
      </div>

      {/* Row 3 */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        <Card className="bg-wbos-surface border-wbos-border shadow-subtle p-6 rounded-xl">
          <div className="mb-6">
            <h3 className="text-[11px] font-bold text-wbos-muted uppercase tracking-wider">Inventory</h3>
          </div>
          <div className="space-y-4">
            {inventory.map((item, i) => (
              <div key={i} className="flex flex-col p-4 rounded-lg border border-wbos-border">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="font-bold text-sm text-wbos-ink">{item.name}</div>
                    <div className="text-xs text-wbos-muted font-medium mt-0.5">{item.stock} units remaining</div>
                  </div>
                  <div className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${item.status === 'low' ? 'bg-danger-soft text-danger' : 'bg-success-soft text-success'}`}>
                    {item.status === 'low' ? 'Low Stock' : 'Healthy'}
                  </div>
                </div>
                
                <div className="w-full inventory-bar rounded-full h-1.5 mb-3 overflow-hidden">
                  <div className={`h-full rounded-full ${item.status === 'low' ? 'bg-danger' : 'bg-success'}`} style={{ width: `${Math.min((item.stock / 20) * 100, 100)}%` }}></div>
                </div>
                
                <div className="flex justify-between items-center text-xs">
                  <div className="font-semibold text-wbos-ink-soft">{item.price} <span className="text-wbos-muted font-normal">/ unit</span></div>
                  {item.status === 'low' && (
                    <button className="font-semibold text-info flex items-center gap-1 hover:text-blue-700 transition-colors">
                      Reorder <ArrowRight className="h-3 w-3" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="bg-wbos-surface border-wbos-border shadow-subtle p-6 rounded-xl">
          <div className="mb-6">
            <h3 className="text-[11px] font-bold text-wbos-muted uppercase tracking-wider">Conversations</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-4 rounded-lg border border-wbos-border bg-wbos-surface hover:bg-wbos-bg transition-colors cursor-pointer">
              <div className="w-8 h-8 rounded-full bg-success-soft flex items-center justify-center text-success font-bold text-xs shrink-0">R</div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-1">
                  <div className="font-bold text-sm text-wbos-ink truncate">Rahul Sharma</div>
                  <div className="text-[10px] text-wbos-muted font-medium shrink-0 ml-2">2m ago</div>
                </div>
                <div className="text-sm text-wbos-ink-soft truncate mb-2">
                  I need 2kg basmati rice and cooking oil
                </div>
                <div className="text-[11px] font-bold text-ai flex items-center gap-1">
                  AI → Order intent detected
                </div>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-4 rounded-lg border border-transparent hover:border-wbos-border hover:bg-wbos-bg transition-colors cursor-pointer">
              <div className="w-8 h-8 rounded-full bg-wbos-bg flex items-center justify-center text-wbos-muted font-bold text-xs shrink-0 border border-wbos-border">P</div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-1">
                  <div className="font-bold text-sm text-wbos-ink truncate">Priya Reddy</div>
                  <div className="text-[10px] text-wbos-muted font-medium shrink-0 ml-2">1h ago</div>
                </div>
                <div className="text-sm text-wbos-muted truncate">
                  Perfect, thanks! I'll pay on delivery.
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
