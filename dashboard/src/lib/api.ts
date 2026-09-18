import { MetricsData, OrderData, ProductData, EventData, SimulatorResponse } from './types';
import { fetchAuthSession } from 'aws-amplify/auth';

export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3001/api';

const getAuthToken = async () => {
    try {
        const session = await fetchAuthSession();
        return session.tokens?.accessToken?.toString() || '';
    } catch (e) {
        console.error("No valid Cognito session found", e);
        return '';
    }
};

export async function fetchMetrics(): Promise<MetricsData> {
    const token = await getAuthToken();
    const res = await fetch(`${API_URL}/metrics`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store'
    });
    if (!res.ok) throw new Error('Failed to fetch metrics');
    return res.json();
}

export async function fetchOrders(): Promise<OrderData[]> {
    const token = await getAuthToken();
    const res = await fetch(`${API_URL}/orders`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store'
    });
    if (!res.ok) throw new Error('Failed to fetch orders');
    return res.json();
}

export async function fetchInventory(): Promise<ProductData[]> {
    const token = await getAuthToken();
    const res = await fetch(`${API_URL}/inventory`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store'
    });
    if (!res.ok) throw new Error('Failed to fetch inventory');
    return res.json();
}

export async function fetchEvents(): Promise<EventData[]> {
    const token = await getAuthToken();
    const res = await fetch(`${API_URL}/events`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store'
    });
    if (!res.ok) throw new Error('Failed to fetch events');
    return res.json();
}
