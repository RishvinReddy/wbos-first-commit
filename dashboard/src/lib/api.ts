import { MetricsData, OrderData, ProductData, EventData, SimulatorResponse } from './types';

export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3001/api';
const OWNER_TOKEN = process.env.NEXT_PUBLIC_OWNER_TOKEN || 'OWNER_TOKEN';

export async function fetchMetrics(): Promise<MetricsData> {
    const res = await fetch(`${API_URL}/metrics`, {
        headers: { Authorization: `Bearer ${OWNER_TOKEN}` },
        cache: 'no-store'
    });
    if (!res.ok) throw new Error('Failed to fetch metrics');
    return res.json();
}

export async function fetchOrders(): Promise<OrderData[]> {
    const res = await fetch(`${API_URL}/orders`, {
        headers: { Authorization: `Bearer ${OWNER_TOKEN}` },
        cache: 'no-store'
    });
    if (!res.ok) throw new Error('Failed to fetch orders');
    return res.json();
}

export async function fetchInventory(): Promise<ProductData[]> {
    const res = await fetch(`${API_URL}/inventory`, {
        headers: { Authorization: `Bearer ${OWNER_TOKEN}` },
        cache: 'no-store'
    });
    if (!res.ok) throw new Error('Failed to fetch inventory');
    return res.json();
}

export async function fetchEvents(): Promise<EventData[]> {
    const res = await fetch(`${API_URL}/events`, {
        headers: { Authorization: `Bearer ${OWNER_TOKEN}` },
        cache: 'no-store'
    });
    if (!res.ok) throw new Error('Failed to fetch events');
    return res.json();
}

export async function simulateWebhook(message: string, phone: string = "+919347761153"): Promise<SimulatorResponse> {
    const res = await fetch(`${API_URL}/simulator/webhook`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OWNER_TOKEN}` 
        },
        body: JSON.stringify({ message, phone }),
        cache: 'no-store'
    });
    if (!res.ok) throw new Error('Simulator request failed');
    return res.json();
}
