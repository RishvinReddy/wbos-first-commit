import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { fetchEvents } from "@/lib/api";

function formatEventType(type: string) {
  switch (type) {
    case "OrderCreated": return <Badge variant="secondary" className="bg-blue-500/20 text-blue-500 border-blue-500/20">OrderCreated</Badge>;
    case "InvoiceGenerated": return <Badge variant="secondary" className="bg-purple-500/20 text-purple-500 border-purple-500/20">InvoiceGenerated</Badge>;
    case "NotificationSent": return <Badge variant="secondary" className="bg-green-500/20 text-green-500 border-green-500/20">NotificationSent</Badge>;
    default: return <Badge variant="outline">{type}</Badge>;
  }
}

export default async function EventsPage() {
  let events: any[] = [];
  try {
    events = await fetchEvents();
  } catch (e) {
    console.error("Failed to fetch events", e);
  }

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">Event Stream</h2>
      
      <Card>
        <CardHeader>
          <CardTitle>Recent Operational Events</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 border-l-2 ml-4">
            {events.length === 0 ? (
              <div className="pl-6 py-6 text-muted-foreground text-sm">
                No events found in the stream.
              </div>
            ) : (
              events.map((event) => (
                <div key={event.eventId} className="relative pl-6 pb-6 last:pb-0">
                  <span className="absolute -left-1.5 top-1.5 h-3 w-3 rounded-full bg-primary ring-4 ring-background" />
                  <div className="flex flex-col space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium leading-none">
                        {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </span>
                      {formatEventType(event.type)}
                    </div>
                    <div className="text-sm text-muted-foreground mt-2">
                      <pre className="p-2 rounded bg-muted overflow-x-auto text-xs">
                        {JSON.stringify(JSON.parse(event.data || "{}"), null, 2)}
                      </pre>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
