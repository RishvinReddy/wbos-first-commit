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

export interface Customer {
  id: string;
  name: string;
  phone: string;
  status: string;
}

export interface Message {
  id: string;
  content: string;
  timestamp: string;
  sender: 'customer' | 'wbos';
  status?: 'sent' | 'delivered' | 'read';
}

export interface Conversation {
  id: string;
  customer: Customer;
  messages: Message[];
  unreadCount: number;
  updatedAt: string;
}
