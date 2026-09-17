import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { fetchOrders } from "@/lib/api";

function formatStatus(status: string) {
  switch (status) {
    case "PENDING": return <Badge variant="secondary">Pending</Badge>;
    case "PREPARING": return <Badge variant="default" className="bg-blue-500 hover:bg-blue-600">Preparing</Badge>;
    case "READY": return <Badge variant="default" className="bg-yellow-500 hover:bg-yellow-600 text-black">Ready</Badge>;
    case "DISPATCHED": return <Badge variant="default" className="bg-green-500 hover:bg-green-600">Dispatched</Badge>;
    case "DELIVERED": return <Badge variant="outline" className="text-green-500 border-green-500">Delivered</Badge>;
    default: return <Badge variant="outline">{status}</Badge>;
  }
}

export default async function OrdersPage() {
  let orders: any[] = [];
  try {
    orders = await fetchOrders();
  } catch (e) {
    console.error("Failed to fetch orders", e);
  }

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">Order Pipeline</h2>
      
      <Card>
        <CardHeader>
          <CardTitle>Live Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                    No active orders found.
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((order) => (
                  <TableRow key={order.orderId}>
                    <TableCell className="font-medium">{order.orderId}</TableCell>
                    <TableCell>{order.customerName}</TableCell>
                    <TableCell>{order.itemCount}</TableCell>
                    <TableCell>₹{order.total}</TableCell>
                    <TableCell>{formatStatus(order.status)}</TableCell>
                    <TableCell className="text-right">
                      {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
