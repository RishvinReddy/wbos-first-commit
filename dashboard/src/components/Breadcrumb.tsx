"use client";

import { usePathname } from 'next/navigation';
import { Zap } from 'lucide-react';

export default function Breadcrumb() {
  const pathname = usePathname();
  let pageName = 'Overview';
  
  if (pathname?.startsWith('/conversations')) pageName = 'Conversations';
  else if (pathname?.startsWith('/orders')) pageName = 'Orders';
  else if (pathname?.startsWith('/inventory')) pageName = 'Inventory';
  else if (pathname?.startsWith('/customers')) pageName = 'Customers';
  else if (pathname?.startsWith('/delivery')) pageName = 'Delivery';
  else if (pathname?.startsWith('/events')) pageName = 'Events';
  else if (pathname?.startsWith('/analytics')) pageName = 'Analytics';
  else if (pathname?.startsWith('/assistant')) pageName = 'AI Assistant';

  return (
    <div className="flex items-center gap-1.5 text-sm" style={{ color: 'var(--wbos-muted)' }}>
      <Zap className="h-3.5 w-3.5" style={{ color: 'var(--wbos-green)' }} />
      <span className="font-semibold" style={{ color: 'var(--wbos-ink-soft)' }}>WBOS</span>
      <span>/</span>
      <span className="font-medium">{pageName}</span>
    </div>
  );
}
