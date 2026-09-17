import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Navigation, Truck, Package, Clock, CheckCircle } from "lucide-react";

export default function DeliveryPage() {
  const drivers = [
    { id: "DR-01", name: "Mukesh", status: "delivering", location: "Andheri West", currentOrder: "#1041", eta: "12 mins", tasks: 4 },
    { id: "DR-02", name: "Ramesh", status: "returning", location: "Bandra", currentOrder: null, eta: "25 mins", tasks: 0 },
    { id: "DR-03", name: "Suresh", status: "at-store", location: "Store", currentOrder: null, eta: "--", tasks: 0 },
  ];

  const activeDeliveries = [
    { id: "#1041", customer: "Arjun Kumar", address: "Powai, Mumbai", driver: "Mukesh", status: "Out for Delivery", time: "45m ago" },
    { id: "#1039", customer: "Vikas Singh", address: "Juhu, Mumbai", driver: "Pending", status: "Ready for Pickup", time: "1h ago" },
  ];

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col gap-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-end">
        <div className="flex flex-col gap-1">
          <h2 className="text-3xl font-extrabold tracking-tight">Delivery Operations</h2>
          <p className="text-text-muted font-medium">Fleet management and real-time tracking</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-wa-green animate-pulse"></div>
            <span className="text-sm font-bold">1 Active Driver</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-accent-amber animate-pulse"></div>
            <span className="text-sm font-bold">1 Returning</span>
          </div>
        </div>
      </div>

      <div className="flex gap-6 flex-1 min-h-0">
        {/* Left: Driver Fleet */}
        <Card className="w-1/3 flex flex-col bg-card/60 backdrop-blur-md border-border-color shadow-card overflow-hidden">
          <CardHeader className="border-b border-white/20 bg-white/40 pb-4">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Truck className="h-5 w-5 text-accent-indigo" /> Fleet Status
            </CardTitle>
          </CardHeader>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {drivers.map(driver => (
              <div key={driver.id} className="p-4 rounded-xl bg-white border border-white/60 shadow-sm">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shadow-sm ${
                      driver.status === 'delivering' ? 'bg-wa-green' : 
                      driver.status === 'returning' ? 'bg-accent-amber' : 'bg-text-muted'
                    }`}>
                      {driver.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-bold">{driver.name}</div>
                      <div className="text-xs text-text-muted font-jetbrains">{driver.id}</div>
                    </div>
                  </div>
                  <Badge variant="outline" className={`text-[10px] font-bold ${
                    driver.status === 'delivering' ? 'text-wa-green border-wa-green/30' : 
                    driver.status === 'returning' ? 'text-accent-amber border-accent-amber/30' : 'text-text-muted border-black/10'
                  }`}>
                    {driver.status.toUpperCase()}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-xs font-medium text-text-secondary bg-gray-50 p-2 rounded-lg border border-black/5">
                  <div className="flex items-center gap-1.5"><MapPin className="h-3 w-3 text-text-muted" /> {driver.location}</div>
                  <div className="flex items-center gap-1.5"><Clock className="h-3 w-3 text-text-muted" /> ETA: {driver.eta}</div>
                  <div className="flex items-center gap-1.5"><Package className="h-3 w-3 text-text-muted" /> {driver.tasks} Orders</div>
                  {driver.currentOrder && (
                    <div className="flex items-center gap-1.5 text-accent-indigo font-bold">
                      <Navigation className="h-3 w-3" /> {driver.currentOrder}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Right: Operations Board */}
        <div className="flex-1 flex flex-col gap-6">
          
          {/* Simulated Map Area (Placeholder for Leaflet/Google Maps if needed later) */}
          <Card className="h-[300px] bg-card/60 backdrop-blur-md border-border-color shadow-card relative overflow-hidden flex items-center justify-center">
            {/* Fake Map Background */}
            <div className="absolute inset-0 opacity-10" style={{
              backgroundImage: 'radial-gradient(circle at center, #94a3b8 1px, transparent 1px)',
              backgroundSize: '24px 24px'
            }}></div>
            
            <div className="text-center z-10">
              <MapPin className="h-12 w-12 text-text-muted mx-auto mb-2 opacity-50" />
              <div className="text-lg font-bold text-text-muted">Geospatial Tracking Disabled</div>
              <p className="text-sm text-text-muted/70 mt-1 max-w-sm">
                Map rendering is paused in operational view. Tracking relies on driver status updates.
              </p>
            </div>
            
            {/* Simulated Nodes */}
            <div className="absolute top-1/4 left-1/4 flex flex-col items-center animate-pulse">
              <div className="w-4 h-4 bg-wa-green rounded-full shadow-[0_0_12px_rgba(0,168,132,0.8)]"></div>
              <span className="text-[10px] font-bold mt-1 bg-white/80 px-1 rounded">Mukesh</span>
            </div>
            <div className="absolute top-2/3 right-1/3 flex flex-col items-center">
              <div className="w-4 h-4 bg-accent-amber rounded-full shadow-[0_0_12px_rgba(245,158,11,0.8)]"></div>
              <span className="text-[10px] font-bold mt-1 bg-white/80 px-1 rounded">Ramesh</span>
            </div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
              <div className="w-6 h-6 bg-text-primary rounded-full border-2 border-white shadow-lg z-10 flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
              <span className="text-xs font-extrabold mt-1 bg-white px-2 py-0.5 rounded shadow">Store</span>
            </div>
          </Card>

          {/* Active Deliveries */}
          <Card className="flex-1 bg-card/60 backdrop-blur-md border-border-color shadow-card overflow-hidden flex flex-col">
            <CardHeader className="border-b border-white/20 bg-white/40 pb-3">
              <CardTitle className="text-lg font-bold">Pending Deliveries</CardTitle>
            </CardHeader>
            <div className="flex-1 p-4 overflow-y-auto space-y-3">
              {activeDeliveries.map((delivery, i) => (
                <div key={i} className="flex justify-between items-center p-4 rounded-xl bg-white border border-white/60 shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className={`h-12 w-12 rounded-xl flex items-center justify-center shadow-sm ${
                      delivery.driver === 'Pending' ? 'bg-accent-amber/10 text-accent-amber' : 'bg-wa-green/10 text-wa-green'
                    }`}>
                      {delivery.driver === 'Pending' ? <Package className="h-6 w-6" /> : <Truck className="h-6 w-6" />}
                    </div>
                    <div>
                      <div className="font-bold flex items-center gap-2">
                        {delivery.id} <span className="text-xs text-text-muted font-jetbrains">{delivery.customer}</span>
                      </div>
                      <div className="text-xs font-medium text-text-secondary mt-1 flex items-center gap-1.5">
                        <MapPin className="h-3 w-3" /> {delivery.address}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right flex flex-col items-end gap-1.5">
                    <Badge variant="outline" className={delivery.driver === 'Pending' ? 'border-accent-amber/30 text-accent-amber bg-accent-amber/5' : 'border-wa-green/30 text-wa-green bg-wa-green/5'}>
                      {delivery.status}
                    </Badge>
                    <div className="text-xs font-bold text-text-muted flex items-center gap-1">
                      {delivery.driver !== 'Pending' && <span className="text-text-primary mr-2">Driver: {delivery.driver}</span>}
                      <Clock className="h-3 w-3" /> {delivery.time}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
