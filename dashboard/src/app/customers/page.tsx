import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin, Phone, MessageSquare, ShoppingCart, Clock, IndianRupee, Check } from "lucide-react";
import Link from "next/link";

export default function CustomersPage() {
  const customers = [
    { id: "CUS-101", name: "Rahul Sharma", phone: "+91 98765 43210", address: "Andheri West, Mumbai", orders: 12, spent: 8420, lastActive: "2 mins ago" },
    { id: "CUS-102", name: "Priya Reddy", phone: "+91 91234 56789", address: "Bandra East, Mumbai", orders: 8, spent: 5210, lastActive: "1 hour ago" },
    { id: "CUS-103", name: "Arjun Kumar", phone: "+91 99887 76655", address: "Powai, Mumbai", orders: 6, spent: 3940, lastActive: "Tuesday" },
    { id: "CUS-104", name: "Sneha Gupta", phone: "+91 98765 11223", address: "Juhu, Mumbai", orders: 15, spent: 12450, lastActive: "Monday" },
  ];

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col gap-6 max-w-7xl mx-auto">
      <div className="flex flex-col gap-1">
        <h2 className="text-3xl font-extrabold tracking-tight">Customer Profiles</h2>
        <p className="text-text-muted font-medium">1,248 total customers</p>
      </div>

      <div className="flex gap-6 flex-1 min-h-0">
        {/* Left: Customer List */}
        <Card className="w-1/3 flex flex-col bg-card/60 backdrop-blur-md border-border-color shadow-card overflow-hidden">
          <div className="p-4 border-b border-white/20 bg-white/40">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
              <input 
                type="text" 
                placeholder="Search customers by name or phone..." 
                className="w-full bg-white border border-white rounded-xl pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-wa-green/30"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {customers.map((c, i) => (
              <div 
                key={c.id} 
                className={`flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all ${
                  i === 0 ? 'bg-white shadow-subtle border border-wa-green/30' : 'hover:bg-white/40 border border-transparent'
                }`}
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-wa-green/20 to-wa-green/10 flex items-center justify-center text-wa-green font-bold text-lg shrink-0 border border-wa-green/20">
                  {c.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-sm truncate">{c.name}</div>
                  <div className="text-xs text-text-secondary font-medium mt-0.5">
                    {c.orders} orders • ₹{c.spent.toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Right: Customer Profile */}
        <div className="flex-1 overflow-y-auto pr-2 pb-6 space-y-6">
          {/* Profile Header */}
          <Card className="bg-card/60 backdrop-blur-md border-border-color shadow-card overflow-hidden">
            <div className="h-24 bg-gradient-to-r from-wa-green to-accent-cyan"></div>
            <div className="px-6 pb-6 relative">
              <div className="w-24 h-24 rounded-2xl bg-white shadow-lg border-4 border-white flex items-center justify-center text-wa-green font-bold text-4xl absolute -top-12">
                R
              </div>
              <div className="mt-14 flex justify-between items-start">
                <div>
                  <h3 className="text-2xl font-extrabold">{customers[0].name}</h3>
                  <div className="flex items-center gap-4 text-sm font-medium text-text-muted mt-2">
                    <span className="flex items-center gap-1.5"><Phone className="h-4 w-4" /> {customers[0].phone}</span>
                    <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" /> {customers[0].address}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Link href="/conversations" className="flex items-center gap-2 bg-white border border-border-color shadow-subtle px-4 py-2 rounded-xl text-sm font-bold hover:bg-gray-50 hover:text-wa-green transition-colors">
                    <MessageSquare className="h-4 w-4 text-wa-green" /> Message
                  </Link>
                  <button className="flex items-center gap-2 bg-text-primary text-white shadow-subtle px-4 py-2 rounded-xl text-sm font-bold hover:bg-black transition-colors">
                    Edit Profile
                  </button>
                </div>
              </div>
            </div>
          </Card>

          {/* Customer KPIs */}
          <div className="grid grid-cols-3 gap-4">
            <Card className="bg-card/40 backdrop-blur-md border-border-color shadow-subtle">
              <CardContent className="p-5">
                <div className="flex items-center gap-2 text-text-muted mb-2">
                  <IndianRupee className="h-4 w-4" /> <span className="text-xs font-bold uppercase tracking-wider">Total Spent</span>
                </div>
                <div className="text-2xl font-bold">₹{customers[0].spent.toLocaleString()}</div>
              </CardContent>
            </Card>
            <Card className="bg-card/40 backdrop-blur-md border-border-color shadow-subtle">
              <CardContent className="p-5 hover:bg-white/40 transition-colors cursor-pointer group">
                <Link href="/orders" className="block">
                  <div className="flex items-center gap-2 text-text-muted mb-2 group-hover:text-accent-indigo transition-colors">
                    <ShoppingCart className="h-4 w-4" /> <span className="text-xs font-bold uppercase tracking-wider">Total Orders</span>
                  </div>
                  <div className="text-2xl font-bold group-hover:text-accent-indigo transition-colors">{customers[0].orders}</div>
                </Link>
              </CardContent>
            </Card>
            <Card className="bg-card/40 backdrop-blur-md border-border-color shadow-subtle">
              <CardContent className="p-5">
                <div className="flex items-center gap-2 text-text-muted mb-2">
                  <Clock className="h-4 w-4" /> <span className="text-xs font-bold uppercase tracking-wider">Last Active</span>
                </div>
                <div className="text-2xl font-bold">{customers[0].lastActive}</div>
              </CardContent>
            </Card>
          </div>

          {/* Current Order & History */}
          <Card className="bg-card/40 backdrop-blur-md border-border-color shadow-subtle">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-bold">Recent Orders</CardTitle>
              <Link href="/orders" className="text-xs font-bold text-accent-indigo hover:underline">View All Pipeline</Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-white border border-wa-green/30 shadow-badge hover:shadow-subtle transition-shadow">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <Link href="/orders" className="font-bold text-lg hover:text-wa-green transition-colors">#1042</Link>
                        <Badge className="bg-accent-amber/10 text-accent-amber hover:bg-accent-amber/20 border-accent-amber/20 cursor-pointer">Preparing</Badge>
                      </div>
                      <div className="text-sm font-medium text-text-muted mt-1">Today, 10:45 AM</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-lg">₹540</div>
                      <div className="text-sm font-medium text-wa-green flex items-center justify-end gap-1"><Check className="h-3 w-3" /> Paid via UPI</div>
                    </div>
                  </div>
                  <div className="pt-3 border-t border-dashed border-black/10">
                    <ul className="text-sm font-medium text-text-secondary space-y-1">
                      <li>
                        <Link href="/inventory" className="hover:text-accent-indigo transition-colors flex items-center gap-1.5 group">
                           • 2kg <span className="group-hover:underline">Basmati Rice</span>
                        </Link>
                      </li>
                      <li>
                        <Link href="/inventory" className="hover:text-accent-indigo transition-colors flex items-center gap-1.5 group">
                           • 1L <span className="group-hover:underline">Cooking Oil</span>
                        </Link>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-white/40 border border-border-color hover:bg-white transition-colors">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-lg">#0988</span>
                        <Badge variant="outline" className="text-text-muted border-text-muted/30">Delivered</Badge>
                      </div>
                      <div className="text-sm font-medium text-text-muted mt-1">Aug 14, 2026</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-lg">₹1,240</div>
                      <div className="text-sm font-medium text-text-muted">Paid via Cash</div>
                    </div>
                  </div>
                  <div className="pt-3 border-t border-dashed border-black/10">
                    <ul className="text-sm font-medium text-text-secondary space-y-1">
                      <li>• Weekly Groceries (12 items)</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
