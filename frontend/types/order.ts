export type OrderStatus =
  | 'pending'
  | 'picked_up'
  | 'washing'
  | 'ready'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled';

export type PaymentStatus = 'unpaid' | 'paid' | 'refunded';

export interface Order {
  id: number;
  order_code: string;
  user_id: number;
  status: OrderStatus;
  pickup_address: string;
  pickup_date: string;      // YYYY-MM-DD
  pickup_time: string;      // HH:MM:SS
  delivery_address: string;
  delivery_date: string;
  delivery_time: string;
  special_notes: string | null;
  subtotal: string;
  total: string;
  payment_status: PaymentStatus;
  created_at: string;
  updated_at: string;

  // Populated by some admin endpoints
  user_name?: string;
  user_email?: string;
  user_phone?: string;

  // Populated when loading a single order
  items?: OrderItem[];
}

export interface OrderItem {
  id: number;
  order_id: number;
  service_id: number;
  service_name: string;
  category: string;
  quantity: number;
  unit_price: string;
  line_total: string;
  created_at: string;
}

// Body for POST /api/orders
export interface OrderCreatePayload {
  pickup_address: string;
  pickup_date: string;
  pickup_time: string;
  delivery_address: string;
  delivery_date: string;
  delivery_time: string;
  special_notes?: string;
  items: { service_id: number; quantity: number }[];
}

export interface OrderListMeta {
  page: number;
  per_page: number;
  total: number;
  last_page: number;
}

export interface OrderListResponse {
  orders: Order[];
  meta: OrderListMeta;
}
