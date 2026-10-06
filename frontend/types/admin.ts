import type { OrderStatus } from './order';

export interface Admin {
  id: number;
  full_name: string;
  email: string;
  is_active: 0 | 1;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AdminAuthResponse {
  admin: Admin;
  token: string;
}

export interface DashboardMetrics {
  total_orders: number;
  today_orders: number;
  pending_orders: number;
  delivered_orders: number;
  revenue_total: number;
  revenue_today: number;
  total_customers: number;
}

export interface DashboardRecentOrder {
  id: number;
  order_code: string;
  status: OrderStatus;
  total: string;
  payment_status: 'unpaid' | 'paid' | 'refunded';
  created_at: string;
  user_name: string;
  user_phone: string;
}

export interface DashboardStatusCount {
  status: OrderStatus;
  count: number;
}

export interface DashboardResponse {
  metrics: DashboardMetrics;
  recent_orders: DashboardRecentOrder[];
  by_status: DashboardStatusCount[];
}
