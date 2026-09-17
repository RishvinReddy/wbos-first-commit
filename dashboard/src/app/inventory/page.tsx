import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Package, AlertTriangle, ArrowRight, Zap, RefreshCw, BarChart2, Filter } from "lucide-react";
import Link from "next/link";
import { fetchInventory } from "@/lib/api";

export default async function InventoryPage() {
  let inventory: any[] = [];
  let error = null;

  try {
    const data = await fetchInventory();
    inventory = data.map(item => ({
      id: item.productId,
      name: item.name,
      category: "General", // Placeholder until category is added to DB
      stock: item.stock,
      maxStock: Math.max(item.stock * 2, 50), // Dynamic maxStock for demo visualization
      price: item.price,
      status: item.stock < 10 ? "low" : (item.stock < 20 ? "warning" : "healthy"),
      velocity: item.stock < 10 ? "High" : "Medium"
    }));
  } catch (err: any) {
    error = err.message || "Failed to fetch live inventory data";
  }

  const lowStockCount = inventory.filter(i => i.status === 'low' || i.status === 'critical').length;

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col gap-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-end">
        <div className="flex flex-col gap-1">
          <h2 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">
            Inventory Intelligence
            <Badge className="bg-wa-green/20 text-wa-green border-wa-green/30 px-2 py-0.5 text-xs font-bold">LIVE DATA</Badge>
          </h2>
          <p className="text-text-muted font-medium">Real-time stock tracking and AI reordering</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
            <input 
              type="text" 
              placeholder="Search products..." 
              className="w-full bg-card/60 backdrop-blur-md border border-border-color rounded-xl pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-wa-green/30 shadow-sm"
            />
          </div>
          <button className="bg-card/60 backdrop-blur-md border border-border-color shadow-sm p-2 rounded-xl text-text-secondary hover:text-text-primary transition-colors">
            <Filter className="h-5 w-5" />
          </button>
        </div>
      </div>
      
      {error && (
        <div className="p-4 bg-accent-red/10 border border-accent-red/30 rounded-xl text-accent-red text-sm font-bold flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" /> {error}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-card/40 backdrop-blur-md border-border-color shadow-card">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold uppercase text-text-muted mb-1">Total SKUs</div>
              <div className="text-2xl font-bold">{inventory.length}</div>
            </div>
            <div className="h-10 w-10 rounded-full bg-wa-green/10 text-wa-green flex items-center justify-center">
              <Package className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/40 backdrop-blur-md border-border-color shadow-card">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold uppercase text-text-muted mb-1">Low Stock</div>
              <div className="text-2xl font-bold text-accent-red">{lowStockCount}</div>
            </div>
            <div className="h-10 w-10 rounded-full bg-accent-red/10 text-accent-red flex items-center justify-center">
              <AlertTriangle className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/40 backdrop-blur-md border-border-color shadow-card">
          <Link href="/events" className="block h-full cursor-pointer group">
            <CardContent className="p-5 flex items-center justify-between h-full hover:bg-white/40 transition-colors">
              <div>
                <div className="text-xs font-bold uppercase text-text-muted mb-1 group-hover:text-accent-indigo transition-colors">AI Reorders</div>
                <div className="text-2xl font-bold text-accent-indigo group-hover:scale-105 transition-transform origin-left">Active</div>
              </div>
              <div className="h-10 w-10 rounded-full bg-accent-indigo/10 text-accent-indigo flex items-center justify-center group-hover:bg-accent-indigo group-hover:text-white transition-colors">
                <Zap className="h-5 w-5" />
              </div>
            </CardContent>
          </Link>
        </Card>
        <Card className="bg-card/40 backdrop-blur-md border-border-color shadow-card">
          <Link href="/orders" className="block h-full cursor-pointer group">
            <CardContent className="p-5 flex items-center justify-between h-full hover:bg-white/40 transition-colors">
              <div>
                <div className="text-xs font-bold uppercase text-text-muted mb-1 group-hover:text-accent-cyan transition-colors">Turnover Rate</div>
                <div className="text-2xl font-bold text-accent-cyan group-hover:scale-105 transition-transform origin-left">High</div>
              </div>
              <div className="h-10 w-10 rounded-full bg-accent-cyan/10 text-accent-cyan flex items-center justify-center group-hover:bg-accent-cyan group-hover:text-white transition-colors">
                <RefreshCw className="h-5 w-5" />
              </div>
            </CardContent>
          </Link>
        </Card>
      </div>

      {/* Inventory List */}
      <Card className="flex-1 flex flex-col bg-card/60 backdrop-blur-md border-border-color shadow-card overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-[2fr_1fr_2fr_1fr_1fr] gap-4 px-4 py-2 text-xs font-bold text-text-muted uppercase tracking-wider mb-2 border-b border-white/20">
            <div>Product</div>
            <div>Category</div>
            <div>Stock Health</div>
            <div>Velocity</div>
            <div className="text-right">Action</div>
          </div>
          
          {inventory.length === 0 && !error && (
            <div className="text-center py-10 text-text-muted font-medium">
              No products found in inventory.
            </div>
          )}
          
          <div className="space-y-3">
            {inventory.map((item) => {
              const stockPercentage = Math.min((item.stock / item.maxStock) * 100, 100);
              const isLow = item.status === 'low' || item.status === 'critical';
              const isWarning = item.status === 'warning';
              
              const barColor = isLow ? 'bg-accent-red' : isWarning ? 'bg-accent-amber' : 'bg-wa-green';
              const badgeColor = isLow ? 'bg-accent-red/10 text-accent-red border-accent-red/20' : 
                                 isWarning ? 'bg-accent-amber/10 text-accent-amber border-accent-amber/20' : 
                                 'bg-wa-green/10 text-wa-green border-wa-green/20';

              return (
                <div key={item.id} className="grid grid-cols-[2fr_1fr_2fr_1fr_1fr] gap-4 px-4 py-4 items-center bg-white/40 rounded-xl border border-white/60 hover:bg-white/60 transition-colors shadow-sm">
                  <div>
                    <div className="font-bold text-sm">{item.name}</div>
                    <div className="text-xs text-text-muted font-jetbrains mt-0.5">{item.id} • ₹{item.price}</div>
                  </div>
                  
                  <div>
                    <Badge variant="outline" className="text-text-secondary border-black/10 bg-white/50">{item.category}</Badge>
                  </div>
                  
                  <div className="pr-8">
                    <div className="flex justify-between items-baseline mb-1">
                      <div className="text-xs font-bold">{item.stock} / {item.maxStock} units</div>
                      <Badge className={badgeColor + " text-[10px] px-1.5 py-0"}>
                        {item.status.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="w-full bg-black/5 rounded-full h-2 overflow-hidden shadow-inner">
                      <div className={`h-2 rounded-full ${barColor}`} style={{ width: `${stockPercentage}%` }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <Link href="/orders" className="flex items-center gap-1.5 text-xs font-bold text-text-secondary hover:text-wa-green transition-colors w-fit">
                      <BarChart2 className="h-4 w-4 text-text-muted" /> {item.velocity}
                    </Link>
                  </div>
                  
                  <div className="text-right">
                    {isLow ? (
                      <button className="bg-text-primary text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-1 hover:bg-black transition-colors ml-auto shadow-sm">
                        Reorder <ArrowRight className="h-3 w-3" />
                      </button>
                    ) : (
                      <button className="text-text-muted hover:text-text-primary text-xs font-bold px-4 py-2 rounded-lg transition-colors ml-auto">
                        Edit
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Card>
    </div>
  );
}
