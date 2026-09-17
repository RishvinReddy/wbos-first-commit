import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { Activity, Package, ShoppingCart, LayoutDashboard } from "lucide-react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "WBOS Command Center",
  description: "Operations Dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} min-h-screen bg-background text-foreground antialiased flex`}>
        {/* Sidebar Navigation */}
        <nav className="w-64 border-r bg-card flex flex-col p-4">
          <div className="mb-8 flex items-center gap-2">
            <div className="h-8 w-8 rounded bg-primary flex items-center justify-center text-primary-foreground font-bold">W</div>
            <h1 className="text-xl font-bold">WBOS</h1>
          </div>
          <div className="space-y-2">
            <Link href="/" className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-accent text-sm font-medium">
              <LayoutDashboard className="h-4 w-4" /> Overview
            </Link>
            <Link href="/orders" className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-accent text-sm font-medium">
              <ShoppingCart className="h-4 w-4" /> Orders
            </Link>
            <Link href="/inventory" className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-accent text-sm font-medium">
              <Package className="h-4 w-4" /> Inventory
            </Link>
            <Link href="/events" className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-accent text-sm font-medium">
              <Activity className="h-4 w-4" /> Event Stream
            </Link>
          </div>
        </nav>
        
        {/* Main Content Area */}
        <main className="flex-1 flex flex-col min-h-screen overflow-auto">
          <header className="h-16 border-b flex items-center px-6 bg-card justify-between">
            <div className="text-sm text-muted-foreground font-medium">
              TENANT_001
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-green-500"></span>
              <span className="text-sm font-medium text-green-500">SYSTEM ONLINE</span>
            </div>
          </header>
          <div className="flex-1 p-6">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}
