"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { IndianRupee, ShoppingCart, TrendingUp, Users, ArrowUpRight, ArrowDownRight } from "lucide-react";

export default function AnalyticsPage() {
  const salesData = [
    { name: 'Mon', revenue: 4000, orders: 24 },
    { name: 'Tue', revenue: 3000, orders: 13 },
    { name: 'Wed', revenue: 2000, orders: 98 },
    { name: 'Thu', revenue: 2780, orders: 39 },
    { name: 'Fri', revenue: 1890, orders: 48 },
    { name: 'Sat', revenue: 2390, orders: 38 },
    { name: 'Sun', revenue: 3490, orders: 43 },
  ];

  const productData = [
    { name: 'Basmati Rice', sales: 400 },
    { name: 'Cooking Oil', sales: 300 },
    { name: 'Sugar', sales: 300 },
    { name: 'Atta', sales: 200 },
    { name: 'Tea', sales: 278 },
  ];

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col gap-6 max-w-7xl mx-auto overflow-y-auto pr-2 pb-6">
      <div className="flex justify-between items-end">
        <div className="flex flex-col gap-1">
          <h2 className="text-3xl font-extrabold tracking-tight">Analytics Workspace</h2>
          <p className="text-text-muted font-medium">Business intelligence and operational trends</p>
        </div>
        <div className="flex items-center gap-2">
          <select className="bg-card/60 backdrop-blur-md border border-border-color shadow-sm rounded-xl px-4 py-2 text-sm font-bold text-text-secondary focus:outline-none focus:ring-2 focus:ring-wa-green/30">
            <option>Last 7 Days</option>
            <option>Last 30 Days</option>
            <option>This Month</option>
          </select>
        </div>
      </div>

      {/* KPI Summary */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-card/40 backdrop-blur-md border-border-color shadow-sm">
          <CardContent className="p-5">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2 text-text-muted">
                <IndianRupee className="h-4 w-4" /> <span className="text-xs font-bold uppercase tracking-wider">Total Sales</span>
              </div>
              <span className="text-xs font-bold text-wa-green flex items-center bg-wa-green/10 px-1.5 py-0.5 rounded"><ArrowUpRight className="h-3 w-3" /> 14%</span>
            </div>
            <div className="text-2xl font-bold">₹19,550</div>
          </CardContent>
        </Card>
        <Card className="bg-card/40 backdrop-blur-md border-border-color shadow-sm">
          <CardContent className="p-5">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2 text-text-muted">
                <ShoppingCart className="h-4 w-4" /> <span className="text-xs font-bold uppercase tracking-wider">Total Orders</span>
              </div>
              <span className="text-xs font-bold text-wa-green flex items-center bg-wa-green/10 px-1.5 py-0.5 rounded"><ArrowUpRight className="h-3 w-3" /> 8%</span>
            </div>
            <div className="text-2xl font-bold">303</div>
          </CardContent>
        </Card>
        <Card className="bg-card/40 backdrop-blur-md border-border-color shadow-sm">
          <CardContent className="p-5">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2 text-text-muted">
                <TrendingUp className="h-4 w-4" /> <span className="text-xs font-bold uppercase tracking-wider">Average Order</span>
              </div>
              <span className="text-xs font-bold text-accent-red flex items-center bg-accent-red/10 px-1.5 py-0.5 rounded"><ArrowDownRight className="h-3 w-3" /> 2%</span>
            </div>
            <div className="text-2xl font-bold">₹64.50</div>
          </CardContent>
        </Card>
        <Card className="bg-card/40 backdrop-blur-md border-border-color shadow-sm">
          <CardContent className="p-5">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2 text-text-muted">
                <Users className="h-4 w-4" /> <span className="text-xs font-bold uppercase tracking-wider">Active Customers</span>
              </div>
              <span className="text-xs font-bold text-wa-green flex items-center bg-wa-green/10 px-1.5 py-0.5 rounded"><ArrowUpRight className="h-3 w-3" /> 12%</span>
            </div>
            <div className="text-2xl font-bold">142</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Area */}
      <div className="grid grid-cols-2 gap-6">
        
        {/* Revenue Trend */}
        <Card className="bg-card/60 backdrop-blur-md border-border-color shadow-card col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-bold">Revenue & Order Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={salesData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis yAxisId="left" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value}`} />
                  <YAxis yAxisId="right" orientation="right" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    itemStyle={{ fontWeight: 'bold' }}
                  />
                  <Line yAxisId="left" type="monotone" dataKey="revenue" stroke="#00a884" strokeWidth={3} dot={{ r: 4, fill: '#00a884', strokeWidth: 0 }} activeDot={{ r: 6 }} name="Revenue (₹)" />
                  <Line yAxisId="right" type="monotone" dataKey="orders" stroke="#6366f1" strokeWidth={3} dot={{ r: 4, fill: '#6366f1', strokeWidth: 0 }} name="Orders" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card className="bg-card/60 backdrop-blur-md border-border-color shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-bold">Top Products by Volume</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={productData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                  <XAxis type="number" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis dataKey="name" type="category" stroke="#475569" fontSize={12} fontWeight={600} tickLine={false} axisLine={false} />
                  <Tooltip 
                    cursor={{fill: 'rgba(0,0,0,0.02)'}}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Bar dataKey="sales" fill="#06b6d4" radius={[0, 4, 4, 0]} barSize={24} name="Units Sold" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Customer Activity / Operational Trends (Placeholder lists) */}
        <Card className="bg-card/60 backdrop-blur-md border-border-color shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-bold">Operational Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 mt-2">
              <div className="p-4 rounded-xl bg-accent-amber/10 border border-accent-amber/20 flex items-start gap-3">
                <div className="mt-0.5 bg-accent-amber text-white rounded-full p-1"><TrendingUp className="h-3 w-3" /></div>
                <div>
                  <div className="font-bold text-sm text-accent-amber mb-0.5">Peak ordering time detected</div>
                  <div className="text-xs font-medium text-text-secondary">Orders have spiked by 35% between 10 AM and 11 AM over the last 3 days.</div>
                </div>
              </div>
              
              <div className="p-4 rounded-xl bg-wa-green/10 border border-wa-green/20 flex items-start gap-3">
                <div className="mt-0.5 bg-wa-green text-white rounded-full p-1"><Users className="h-3 w-3" /></div>
                <div>
                  <div className="font-bold text-sm text-wa-green mb-0.5">High customer retention</div>
                  <div className="text-xs font-medium text-text-secondary">62% of customers this week were repeat buyers, up from 55% last week.</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
