import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  IndianRupee, 
  ShoppingCart, 
  TrendingUp, 
  Truck,
  Activity,
  AlertTriangle,
  Clock,
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
    { name: "Basmati Rice 1kg", stock: 8, status: "low", reorder: true },
    { name: "Cooking Oil 1L", stock: 6, status: "low", reorder: true },
    { name: "Sugar 1kg", stock: 45, status: "healthy", reorder: false },
  ];

  const systemEvents = [
    { type: "DashboardEvent", id: "Metrics Updated", time: "Just now", source: "AWS Bedrock" },
    { type: "System", id: "System Online", time: "1 min ago", source: "Initialization" }
  ];

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex flex-col gap-1">
        <h2 className="text-3xl font-extrabold tracking-tight">Good evening, Owner</h2>
        <div className="flex items-center gap-2">
          <p className="text-text-muted font-medium">Here's what's happening today in your business.</p>
          <Badge className="bg-wa-green/20 text-wa-green border-wa-green/30 px-2 py-0.5 text-[10px]">LIVE AWS DATA</Badge>
        </div>
      </div>
      
      {error && (
        <div className="p-4 bg-accent-red/10 border border-accent-red/30 rounded-xl text-accent-red text-sm font-bold flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" /> {error}
        </div>
      )}
      
      {/* 1. Executive Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-card/40 backdrop-blur-md border-border-color shadow-card hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold text-text-muted uppercase tracking-wider">Revenue</CardTitle>
            <IndianRupee className="h-4 w-4 text-wa-green" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">₹{metrics.total_sales.toLocaleString()}</div>
            <p className="text-xs text-wa-green font-semibold mt-1 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" /> Live
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-card/40 backdrop-blur-md border-border-color shadow-card hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold text-text-muted uppercase tracking-wider">Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-accent-indigo" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{metrics.order_count}</div>
            <p className="text-xs text-text-muted font-semibold mt-1">Today</p>
          </CardContent>
        </Card>

        <Card className="bg-card/40 backdrop-blur-md border-border-color shadow-card hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold text-text-muted uppercase tracking-wider">AOV</CardTitle>
            <TrendingUp className="h-4 w-4 text-accent-amber" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">₹{metrics.average_order_value}</div>
            <p className="text-xs text-text-muted font-semibold mt-1">Average order value</p>
          </CardContent>
        </Card>

        <Card className="bg-card/40 backdrop-blur-md border-border-color shadow-card hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold text-text-muted uppercase tracking-wider">Delivery</CardTitle>
            <Truck className="h-4 w-4 text-accent-cyan" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{deliveryActive}</div>
            <p className="text-xs text-text-muted font-semibold mt-1">Active operations</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        
        {/* 2. Order Pipeline */}
        <Card className="col-span-2 bg-card/40 backdrop-blur-md border-border-color shadow-card">
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center justify-between">
              Live Operations
              <Badge variant="outline" className="text-wa-green border-wa-green/30 bg-wa-green/10">Pipeline Active</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
             <div className="space-y-4">
               {pipeline.length === 0 && !error && (
                 <div className="text-center py-6 text-text-muted font-medium text-sm">
                   No active orders right now.
                 </div>
               )}
               {pipeline.map((order, i) => (
                 <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/40 border border-white/60 shadow-badge">
                   <div className="flex items-center gap-4">
                     <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-sm bg-accent-indigo/10 text-accent-indigo`}>
                       <ShoppingCart className="h-4 w-4" />
                     </div>
                     <div>
                       <div className="font-bold flex items-center gap-2">
                         {order.orderId} <span className="text-xs font-medium text-text-muted font-jetbrains">{order.customer}</span>
                       </div>
                       <div className="text-xs text-text-secondary font-medium">{order.itemCount} items • ₹{order.total}</div>
                     </div>
                   </div>
                   <div className="text-right">
                     <div className="text-sm font-bold">Pending</div>
                     <div className="text-xs flex items-center gap-1 text-text-muted justify-end">
                       <Clock className="h-3 w-3" /> {new Date(order.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                     </div>
                   </div>
                 </div>
               ))}
             </div>
          </CardContent>
        </Card>
        
        {/* 3. System Activity (Vertical Feed) */}
        <Card className="bg-card/40 backdrop-blur-md border-border-color shadow-card flex flex-col">
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Activity className="h-5 w-5 text-accent-indigo" />
              System Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-auto">
             <div className="space-y-5 relative before:absolute before:inset-0 before:ml-2 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border-color before:to-transparent">
               {systemEvents.map((event, i) => (
                 <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                   <div className="flex items-center justify-center w-5 h-5 rounded-full border-2 border-white bg-accent-indigo text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                     <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                   </div>
                   <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] p-3 rounded-xl bg-white/50 border border-white/60 shadow-sm ml-4 md:ml-0">
                     <div className="flex items-center justify-between mb-1">
                       <div className="font-bold text-xs text-accent-indigo">{event.type}</div>
                     </div>
                     <div className="text-sm font-bold mb-1">{event.id}</div>
                     <div className="text-[10px] text-text-muted font-semibold flex items-center gap-1">
                       <Clock className="h-3 w-3" /> {event.time} • {event.source}
                     </div>
                   </div>
                 </div>
               ))}
             </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* 4. Inventory Intelligence */}
        <Card className="bg-card/40 backdrop-blur-md border-border-color shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-bold flex items-center justify-between">
              Inventory Intelligence
              <Badge variant="outline" className="text-text-muted">Demo Surface</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {inventory.map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/40 border border-white/60">
                  <div className="flex-1">
                    <div className="font-bold text-sm mb-1">{item.name}</div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5 mb-1 overflow-hidden">
                      <div className={`h-1.5 rounded-full ${item.status === 'low' ? 'bg-accent-red' : 'bg-wa-green'}`} style={{ width: `${Math.min((item.stock / 20) * 100, 100)}%` }}></div>
                    </div>
                    <div className="text-xs font-semibold text-text-muted">{item.stock} units remaining</div>
                  </div>
                  {item.reorder && (
                    <button className="ml-4 text-xs font-bold bg-text-primary text-white px-3 py-1.5 rounded-lg flex items-center gap-1 hover:bg-black transition-colors">
                      Reorder <ArrowRight className="h-3 w-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 5. Customer Activity */}
        <Card className="bg-card/40 backdrop-blur-md border-border-color shadow-card">
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center gap-2 justify-between">
              Recent Conversations
              <Badge variant="outline" className="text-text-muted">Demo Surface</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-white/60 border border-white shadow-sm">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-wa-green to-wa-green-dark flex items-center justify-center text-white font-bold">R</div>
                <div className="flex-1">
                  <div className="flex justify-between items-baseline mb-0.5">
                    <div className="font-bold text-sm">Rahul Sharma</div>
                    <div className="text-[10px] text-text-muted font-bold">2m ago</div>
                  </div>
                  <div className="text-xs text-text-secondary font-medium bg-wa-bg p-2 rounded-lg rounded-tl-none border border-black/5 inline-block mt-1">
                    I need 2kg basmati rice and cooking oil
                  </div>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 rounded-xl hover:bg-white/40 border border-transparent transition-colors">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-text-secondary font-bold">P</div>
                <div className="flex-1">
                  <div className="flex justify-between items-baseline mb-0.5">
                    <div className="font-bold text-sm">Priya Reddy</div>
                    <div className="text-[10px] text-text-muted font-bold">1h ago</div>
                  </div>
                  <div className="text-xs text-text-muted font-medium truncate">
                    Perfect, thanks! I'll pay on delivery.
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
