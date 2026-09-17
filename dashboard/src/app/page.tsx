import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchMetrics } from "@/lib/api";

export default async function OverviewPage() {
  // If the API isn't running, we fallback to empty for the UI to still render
  let metrics = null;
  try {
    metrics = await fetchMetrics();
  } catch (e) {
    console.error("Failed to fetch metrics", e);
  }

  const sales = metrics?.total_sales || 0;
  const orders = metrics?.orders_count || 0;
  
  // Pending orders and low stock items are typically fetched separately 
  // or aggregated in the backend API. The current get_sales_summary gives us total_sales and orders_count.
  // We can just use dummy or 0 for the other two if they're not in the response yet,
  // or update the backend to include them. For now, we'll display what we have.

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">Executive Overview</h2>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{sales.toLocaleString()}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Orders Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orders}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Hardcoded or updated later if we modify the metrics API to include it */}
            <div className="text-2xl font-bold">12</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">5</div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Sales Trend</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center border-t border-dashed">
             <span className="text-muted-foreground">Chart Placeholder</span>
          </CardContent>
        </Card>
        
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Order Pipeline</CardTitle>
          </CardHeader>
          <CardContent>
             <div className="space-y-4">
               <div className="flex items-center justify-between">
                 <div className="font-medium">Pending</div>
                 <div className="font-bold">12</div>
               </div>
               <div className="flex items-center justify-between">
                 <div className="font-medium">Preparing</div>
                 <div className="font-bold">8</div>
               </div>
               <div className="flex items-center justify-between">
                 <div className="font-medium">Ready</div>
                 <div className="font-bold">5</div>
               </div>
               <div className="flex items-center justify-between">
                 <div className="font-medium">Out</div>
                 <div className="font-bold">14</div>
               </div>
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
