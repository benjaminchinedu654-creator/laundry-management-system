import { ApiException, ApiResponse } from '@/types/api';

const BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000').replace(/\/+$/, '');

export type AuthScope = 'customer' | 'admin' | 'none';

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  scope?: AuthScope;
  query?: Record<string, string | number | undefined | null>;
  cache?: RequestCache;
}

/**
 * Core fetch wrapper. Throws ApiException on any non-2xx response.
 * Returns the parsed `data` field on success.
 */
export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const {
    method = 'GET',
    body,
    scope = 'none',
    query,
    cache = 'no-store',
  } = options;

  const url = new URL(BASE_URL + path);
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v !== undefined && v !== null && v !== '') {
        url.searchParams.set(k, String(v));
      }
    }
  }

  const headers: Record<string, string> = {
    Accept: 'application/json',
  };

  if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  if (scope !== 'none') {
    const token = readToken(scope);
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  let res: Response;
  try {
    res = await fetch(url.toString(), {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      cache,
    });
  } catch {
    throw new ApiException('Network error. Please check your connection.', 0);
  }

  let payload: ApiResponse<T> | null = null;
  try {
    payload = (await res.json()) as ApiResponse<T>;
  } catch {
    payload = null;
  }

  if (!res.ok) {
    const message =
      payload && 'message' in payload ? payload.message : `Request failed (${res.status})`;
    const fieldErrors =
      payload && 'errors' in payload && payload.errors ? payload.errors : {};
    throw new ApiException(message, res.status, fieldErrors);
  }

  if (!payload || payload.status !== 'success') {
    throw new ApiException('Unexpected response from server.', res.status);
  }

  return payload.data;
}

/* -------------------- Token storage -------------------- */

const CUSTOMER_TOKEN_KEY = 'customer_token';
const ADMIN_TOKEN_KEY = 'admin_token';

export function readToken(scope: 'customer' | 'admin'): string | null {
  if (typeof window === 'undefined') return null;
  return scope === 'customer'
    ? window.localStorage.getItem(CUSTOMER_TOKEN_KEY)
    : window.localStorage.getItem(ADMIN_TOKEN_KEY);
}

export function writeToken(scope: 'customer' | 'admin', token: string): void {
  if (typeof window === 'undefined') return;
  const key = scope === 'customer' ? CUSTOMER_TOKEN_KEY : ADMIN_TOKEN_KEY;
  window.localStorage.setItem(key, token);
}

export function clearToken(scope: 'customer' | 'admin'): void {
  if (typeof window === 'undefined') return;
  const key = scope === 'customer' ? CUSTOMER_TOKEN_KEY : ADMIN_TOKEN_KEY;
  window.localStorage.removeItem(key);
}

/* -------------------- Endpoint shortcuts -------------------- */

export const api = {
  // ---- Customer auth ----
  register: (body: import('@/types/user').RegisterPayload) =>
    apiFetch<import('@/types/user').AuthResponse>('/api/auth/register', {
      method: 'POST',
      body,
      scope: 'none',
    }),

  login: (body: import('@/types/user').LoginPayload) =>
    apiFetch<import('@/types/user').AuthResponse>('/api/auth/login', {
      method: 'POST',
      body,
      scope: 'none',
    }),

  me: () =>
    apiFetch<{ user: import('@/types/user').User }>('/api/auth/me', {
      scope: 'customer',
    }),

  updateProfile: (body: Partial<{ full_name: string; phone: string; address: string }>) =>
    apiFetch<{ user: import('@/types/user').User }>('/api/users/profile', {
      method: 'PUT',
      body,
      scope: 'customer',
    }),

  changePassword: (body: {
    current_password: string;
    new_password: string;
    new_password_confirmation: string;
  }) =>
    apiFetch<null>('/api/users/password', {
      method: 'PATCH',
      body,
      scope: 'customer',
    }),

  // ---- Services ----
  listServices: () =>
    apiFetch<import('@/types/service').ServiceListResponse>('/api/services', {
      scope: 'none',
    }),

  // ---- Orders (customer) ----
  listMyOrders: (query?: { page?: number; per_page?: number }) =>
    apiFetch<import('@/types/order').OrderListResponse>('/api/orders', {
      scope: 'customer',
      query,
    }),

  createOrder: (body: import('@/types/order').OrderCreatePayload) =>
    apiFetch<{ order: import('@/types/order').Order }>('/api/orders', {
      method: 'POST',
      body,
      scope: 'customer',
    }),

  getMyOrder: (id: number | string) =>
    apiFetch<{ order: import('@/types/order').Order }>(`/api/orders/${id}`, {
      scope: 'customer',
    }),

  cancelMyOrder: (id: number | string) =>
    apiFetch<{ order: import('@/types/order').Order }>(`/api/orders/${id}/cancel`, {
      method: 'POST',
      scope: 'customer',
    }),

  // ---- Notifications ----
  listNotifications: (query?: { page?: number; per_page?: number }) =>
    apiFetch<import('@/types/notification').NotificationListResponse>('/api/notifications', {
      scope: 'customer',
      query,
    }),

  markNotificationRead: (id: number | string) =>
    apiFetch<null>(`/api/notifications/${id}/read`, {
      method: 'PATCH',
      scope: 'customer',
    }),

  markAllNotificationsRead: () =>
    apiFetch<null>('/api/notifications/read-all', {
      method: 'PATCH',
      scope: 'customer',
    }),

  // ---- Admin auth ----
  adminLogin: (body: import('@/types/user').LoginPayload) =>
    apiFetch<import('@/types/admin').AdminAuthResponse>('/api/admin/auth/login', {
      method: 'POST',
      body,
      scope: 'none',
    }),

  adminMe: () =>
    apiFetch<{ admin: import('@/types/admin').Admin }>('/api/admin/auth/me', {
      scope: 'admin',
    }),

  adminChangePassword: (body: {
    current_password: string;
    new_password: string;
    new_password_confirmation: string;
  }) =>
    apiFetch<null>('/api/admin/auth/password', {
      method: 'PATCH',
      body,
      scope: 'admin',
    }),

  // ---- Admin dashboard ----
  adminDashboard: () =>
    apiFetch<import('@/types/admin').DashboardResponse>('/api/admin/dashboard', {
      scope: 'admin',
    }),

  // ---- Admin orders ----
  adminListOrders: (query?: {
    page?: number;
    per_page?: number;
    status?: string;
    payment_status?: string;
    search?: string;
    from_date?: string;
    to_date?: string;
  }) =>
    apiFetch<import('@/types/order').OrderListResponse>('/api/admin/orders', {
      scope: 'admin',
      query,
    }),

  adminGetOrder: (id: number | string) =>
    apiFetch<{ order: import('@/types/order').Order }>(`/api/admin/orders/${id}`, {
      scope: 'admin',
    }),

  adminUpdateOrderStatus: (id: number | string, status: string) =>
    apiFetch<{ order: import('@/types/order').Order }>(`/api/admin/orders/${id}/status`, {
      method: 'PATCH',
      body: { status },
      scope: 'admin',
    }),

  adminUpdateOrderPayment: (id: number | string, payment_status: string) =>
    apiFetch<{ order: import('@/types/order').Order }>(`/api/admin/orders/${id}/payment`, {
      method: 'PATCH',
      body: { payment_status },
      scope: 'admin',
    }),

  // ---- Admin users ----
  adminListUsers: (query?: { page?: number; per_page?: number; search?: string }) =>
    apiFetch<{
      users: import('@/types/user').User[];
      meta: import('@/types/order').OrderListMeta;
    }>('/api/admin/users', { scope: 'admin', query }),

  adminGetUser: (id: number | string) =>
    apiFetch<{
      user: import('@/types/user').User;
      orders: import('@/types/order').Order[];
    }>(`/api/admin/users/${id}`, { scope: 'admin' }),

  adminSetUserActive: (id: number | string, is_active: 0 | 1) =>
    apiFetch<{ user: import('@/types/user').User }>(`/api/admin/users/${id}/status`, {
      method: 'PATCH',
      body: { is_active },
      scope: 'admin',
    }),

  // ---- Admin services ----
  adminListServices: () =>
    apiFetch<{ services: import('@/types/service').Service[] }>('/api/admin/services', {
      scope: 'admin',
    }),

  adminCreateService: (body: import('@/types/service').ServiceCreatePayload) =>
    apiFetch<{ service: import('@/types/service').Service }>('/api/admin/services', {
      method: 'POST',
      body,
      scope: 'admin',
    }),

  adminUpdateService: (
    id: number | string,
    body: import('@/types/service').ServiceUpdatePayload
  ) =>
    apiFetch<{ service: import('@/types/service').Service }>(`/api/admin/services/${id}`, {
      method: 'PUT',
      body,
      scope: 'admin',
    }),

  adminSetServiceAvailability: (id: number | string, is_available: 0 | 1) =>
    apiFetch<{ service: import('@/types/service').Service }>(
      `/api/admin/services/${id}/availability`,
      { method: 'PATCH', body: { is_available }, scope: 'admin' }
    ),

  adminDeleteService: (id: number | string) =>
    apiFetch<null>(`/api/admin/services/${id}`, { method: 'DELETE', scope: 'admin' }),

  // ---- Admin payments ----
  adminListPayments: (query?: {
    page?: number;
    per_page?: number;
    status?: string;
    method?: string;
  }) =>
    apiFetch<import('@/types/payment').PaymentListResponse>('/api/admin/payments', {
      scope: 'admin',
      query,
    }),

  adminCreatePayment: (body: import('@/types/payment').PaymentCreatePayload) =>
    apiFetch<{ payment: import('@/types/payment').Payment }>('/api/admin/payments', {
      method: 'POST',
      body,
      scope: 'admin',
    }),

  adminUpdatePaymentStatus: (id: number | string, status: string) =>
    apiFetch<{ payment: import('@/types/payment').Payment }>(
      `/api/admin/payments/${id}/status`,
      { method: 'PATCH', body: { status }, scope: 'admin' }
    ),

  // ---- Admin reports ----
  adminReportOrders: (query?: { from_date?: string; to_date?: string }) =>
    apiFetch<{
      range: { from: string; to: string };
      summary: { total_orders: number; total_value: string; paid_value: string };
      orders: import('@/types/order').Order[];
    }>('/api/admin/reports/orders', { scope: 'admin', query }),

  adminReportRevenue: (query?: { from_date?: string; to_date?: string }) =>
    apiFetch<{
      range: { from: string; to: string };
      total_revenue: number;
      by_day: { day: string; revenue: string }[];
    }>('/api/admin/reports/revenue', { scope: 'admin', query }),

  adminReportCustomers: () =>
    apiFetch<{
      customers: {
        id: number;
        full_name: string;
        email: string;
        phone: string;
        order_count: number;
        lifetime_value: string;
      }[];
    }>('/api/admin/reports/customers', { scope: 'admin' }),
};
