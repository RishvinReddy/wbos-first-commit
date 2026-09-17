import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { fetchInventory } from "@/lib/api";

export default async function InventoryPage() {
  let inventory: any[] = [];
  try {
    inventory = await fetchInventory();
  } catch (e) {
    console.error("Failed to fetch inventory", e);
  }

  // Define a simple low stock threshold for the UI demo.
  // In a real app, this would come from the item's `lowStockThreshold` field.
  const isLowStock = (stock: number) => stock <= 15;
  const isCriticalStock = (stock: number) => stock <= 5;

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">Inventory</h2>
      
      <Card>
        <CardHeader>
          <CardTitle>Stock Levels</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Current Stock</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inventory.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                    No inventory items found.
                  </TableCell>
                </TableRow>
              ) : (
                inventory.map((item) => (
                  <TableRow key={item.productId}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>₹{item.price}</TableCell>
                    <TableCell>{item.stock} {item.unit}</TableCell>
                    <TableCell>
                      {isCriticalStock(item.stock) ? (
                        <Badge variant="destructive">CRITICAL</Badge>
                      ) : isLowStock(item.stock) ? (
                        <Badge variant="outline" className="text-orange-500 border-orange-500">LOW</Badge>
                      ) : (
                        <Badge variant="outline" className="text-green-500 border-green-500">NORMAL</Badge>
                      )}
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
