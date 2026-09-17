export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3001/api';

export async function fetchMetrics() {
    const res = await fetch(`${API_URL}/metrics`, {
        headers: { 'Authorization': 'Bearer OWNER_TOKEN' },
        cache: 'no-store'
    });
    if (!res.ok) throw new Error('Failed to fetch metrics');
    return res.json();
}

export async function fetchOrders() {
    const res = await fetch(`${API_URL}/orders`, {
        headers: { 'Authorization': 'Bearer OWNER_TOKEN' },
        cache: 'no-store'
    });
    if (!res.ok) throw new Error('Failed to fetch orders');
    return res.json();
}

export async function fetchInventory() {
    const res = await fetch(`${API_URL}/inventory`, {
        headers: { 'Authorization': 'Bearer OWNER_TOKEN' },
        cache: 'no-store'
    });
    if (!res.ok) throw new Error('Failed to fetch inventory');
    return res.json();
}

export async function fetchEvents() {
    const res = await fetch(`${API_URL}/events`, {
        headers: { 'Authorization': 'Bearer OWNER_TOKEN' },
        cache: 'no-store'
    });
    if (!res.ok) throw new Error('Failed to fetch events');
    return res.json();
}
