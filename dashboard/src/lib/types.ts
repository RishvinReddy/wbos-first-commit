export interface MetricsData {
  date: string;
  total_sales: number;
  order_count: number;
  average_order_value: number;
}

export interface OrderData {
  orderId: string;
  customer: string;
  total: number;
  itemCount: number;
  createdAt: string;
  status?: string; // Implicitly determined by where it's fetched or mapped on the frontend
}

export interface ProductData {
  productId: string;
  name: string;
  stock: number;
  price: number;
  unit: string;
}

export interface EventData {
  eventId: string;
  type: string;
  timestamp: string;
  data: Record<string, any>;
}

export interface SimulatorResponse {
  status: string;
  operations?: Array<{
    tool: string;
    result: any;
  }>;
}
