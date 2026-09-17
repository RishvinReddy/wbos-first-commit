import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, ArrowDown, Database, FileText, Bell, LayoutDashboard, Search, Filter, Box, AlertTriangle, HelpCircle } from "lucide-react";
import { fetchEvents } from "@/lib/api";

export default async function EventsPage() {
  let events: any[] = [];
  let error = null;

  try {
    const data = await fetchEvents();
    
    events = data.map((evt) => {
      // Determine styling based on event type
      let icon = HelpCircle;
      let color = "text-text-secondary";
      let bg = "bg-gray-100";
      
      switch (evt.type) {
        case "OrderCreated":
          icon = Box;
          color = "text-wa-green";
          bg = "bg-wa-green/10";
          break;
        case "DashboardEvent":
          icon = LayoutDashboard;
          color = "text-accent-cyan";
          bg = "bg-accent-cyan/10";
          break;
        case "NotificationRequested":
          icon = Bell;
          color = "text-accent-amber";
          bg = "bg-accent-amber/10";
          break;
        case "InvoiceGenerated":
          icon = FileText;
          color = "text-accent-indigo";
          bg = "bg-accent-indigo/10";
          break;
        case "InventoryUpdated":
          icon = Database;
          color = "text-text-secondary";
          bg = "bg-gray-100";
          break;
        default:
          icon = Activity;
          color = "text-text-primary";
          bg = "bg-text-primary/10";
      }
      
      // Determine a detail string from data
      let detail = JSON.stringify(evt.data).slice(0, 50) + "...";
      if (evt.type === "OrderCreated" && evt.data?.orderId) {
        detail = `Order ${evt.data.orderId} created`;
      } else if (evt.type === "InvoiceGenerated" && evt.data?.s3_key) {
        detail = `Invoice stored: ${evt.data.s3_key}`;
      } else if (evt.type === "DashboardEvent" && evt.data?.messageId) {
        detail = `Processed message: ${evt.data.messageId}`;
      }

      return {
        id: evt.eventId,
        type: evt.type,
        source: evt.data?.source || "EventBridge",
        detail: detail,
        time: new Date(evt.timestamp).toLocaleString([], {month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit'}),
        status: "Processed",
        icon: icon,
        color: color,
        bg: bg
      };
    });
  } catch (err: any) {
    error = err.message || "Failed to fetch live events data";
  }

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col gap-6 max-w-7xl mx-auto overflow-y-auto pr-2 pb-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-3xl font-extrabold tracking-tight flex items-center gap-2">
          <Activity className="h-6 w-6 text-accent-indigo" />
          Event Pipeline
          <Badge className="bg-wa-green/20 text-wa-green border-wa-green/30 px-2 py-0.5 text-xs font-bold ml-2">LIVE DATA</Badge>
        </h2>
        <p className="text-text-muted font-medium">Asynchronous event routing and system observability</p>
      </div>
      
      {error && (
        <div className="p-4 bg-accent-red/10 border border-accent-red/30 rounded-xl text-accent-red text-sm font-bold flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" /> {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Architecture Diagram */}
        <div className="lg:col-span-1 space-y-4">
          <Card className="bg-card/60 backdrop-blur-md border-border-color shadow-card overflow-hidden h-full">
            <CardHeader className="pb-2 border-b border-white/20 bg-white/40">
              <CardTitle className="text-lg font-bold">Architecture Topology</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              
              <div className="flex flex-col items-center">
                {/* Source */}
                <div className="w-48 bg-white border border-border-color shadow-sm rounded-xl p-3 text-center z-10">
                  <div className="font-bold text-sm">ORDER_CREATED</div>
                  <div className="text-[10px] text-text-muted font-bold mt-1 uppercase tracking-wider">Source: WhatsApp / API</div>
                </div>

                <ArrowDown className="h-6 w-6 text-text-muted my-2 animate-bounce" />

                {/* EventBridge */}
                <div className="w-56 bg-gradient-to-br from-[#ff9900] to-[#ffb84d] text-white shadow-md rounded-xl p-3 text-center z-10">
                  <div className="font-extrabold flex items-center justify-center gap-2">
                    <Activity className="h-4 w-4" /> Amazon EventBridge
                  </div>
                  <div className="text-[10px] font-bold mt-1 opacity-90">Custom Event Bus: wbos-events</div>
                </div>

                <div className="flex w-full justify-center relative h-10 my-2">
                  <div className="absolute top-0 w-[80%] h-px bg-text-muted/50"></div>
                  <div className="absolute top-0 left-[10%] h-full w-px bg-text-muted/50"></div>
                  <div className="absolute top-0 left-1/2 h-full w-px bg-text-muted/50 -translate-x-1/2"></div>
                  <div className="absolute top-0 right-[10%] h-full w-px bg-text-muted/50"></div>
                </div>

                {/* Targets */}
                <div className="flex w-full justify-between gap-2 z-10">
                  <div className="flex-1 bg-white border border-accent-indigo/20 shadow-sm rounded-xl p-3 text-center flex flex-col items-center">
                    <FileText className="h-5 w-5 text-accent-indigo mb-1" />
                    <div className="font-bold text-[11px]">Invoice Lambda</div>
                    <div className="text-[9px] text-text-muted mt-0.5">S3 PDF Gen</div>
                  </div>
                  
                  <div className="flex-1 bg-white border border-accent-amber/20 shadow-sm rounded-xl p-3 text-center flex flex-col items-center">
                    <Bell className="h-5 w-5 text-accent-amber mb-1" />
                    <div className="font-bold text-[11px]">Notify Lambda</div>
                    <div className="text-[9px] text-text-muted mt-0.5">SNS SMS</div>
                  </div>
                  
                  <div className="flex-1 bg-white border border-accent-cyan/20 shadow-sm rounded-xl p-3 text-center flex flex-col items-center">
                    <LayoutDashboard className="h-5 w-5 text-accent-cyan mb-1" />
                    <div className="font-bold text-[11px]">Dashboard API</div>
                    <div className="text-[9px] text-text-muted mt-0.5">DynamoDB Metrics</div>
                  </div>
                </div>
              </div>

            </CardContent>
          </Card>
        </div>

        {/* Event Stream */}
        <div className="lg:col-span-2">
          <Card className="h-full flex flex-col bg-card/60 backdrop-blur-md border-border-color shadow-card overflow-hidden">
            <div className="p-4 border-b border-white/20 bg-white/40 flex justify-between items-center">
              <h3 className="font-bold text-lg">System Event Log</h3>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-muted" />
                  <input 
                    type="text" 
                    placeholder="Search events..." 
                    className="w-48 bg-white border border-white/60 rounded-lg pl-8 pr-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-wa-green/30"
                  />
                </div>
                <button className="bg-white border border-white/60 p-1.5 rounded-lg text-text-secondary hover:text-text-primary">
                  <Filter className="h-4 w-4" />
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 font-jetbrains text-sm">
              <div className="space-y-3 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-px before:bg-gradient-to-b before:from-border-color before:via-border-color before:to-transparent">
                {events.length === 0 && !error && (
                  <div className="text-center py-8 text-text-muted font-sans font-medium">No live events captured yet. Send a message to start the pipeline!</div>
                )}
                {events.map((event) => (
                  <div key={event.id} className="relative flex items-start gap-4 group">
                    <div className={`mt-0.5 flex items-center justify-center w-10 h-10 rounded-full border-2 border-white ${event.bg} ${event.color} shadow-sm shrink-0 z-10 transition-transform group-hover:scale-110`}>
                      <event.icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 bg-white/60 border border-white p-3 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <span className={`font-bold ${event.color}`}>{event.type}</span>
                          <span className="text-xs text-text-muted">{event.id}</span>
                        </div>
                        <div className="text-xs text-text-muted font-semibold">{event.time}</div>
                      </div>
                      <div className="text-text-primary font-medium">{event.detail}</div>
                      <div className="flex justify-between items-center mt-3 pt-3 border-t border-black/5">
                        <div className="text-xs font-bold text-text-secondary">Source: <span className="text-text-primary">{event.source}</span></div>
                        <Badge variant="outline" className={`text-[10px] ${event.color} border-current/30 ${event.bg}`}>
                          {event.status.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

      </div>
    </div>
  );
}
