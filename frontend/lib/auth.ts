import { User } from '@/types/user';
import { Admin } from '@/types/admin';
import { readToken, writeToken, clearToken } from './api';

const CUSTOMER_USER_KEY = 'customer_user';
const ADMIN_USER_KEY = 'admin_user';

/* ---------- Customer ---------- */

export function saveCustomerAuth(user: User, token: string): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(CUSTOMER_USER_KEY, JSON.stringify(user));
  writeToken('customer', token);
}

export function loadCustomerAuth(): { user: User; token: string } | null {
  if (typeof window === 'undefined') return null;
  const raw = window.localStorage.getItem(CUSTOMER_USER_KEY);
  const token = readToken('customer');
  if (!raw || !token) return null;
  try {
    return { user: JSON.parse(raw) as User, token };
  } catch {
    return null;
  }
}

export function clearCustomerAuth(): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(CUSTOMER_USER_KEY);
  clearToken('customer');
}

/* ---------- Admin ---------- */

export function saveAdminAuth(admin: Admin, token: string): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(admin));
  writeToken('admin', token);
}

export function loadAdminAuth(): { admin: Admin; token: string } | null {
  if (typeof window === 'undefined') return null;
  const raw = window.localStorage.getItem(ADMIN_USER_KEY);
  const token = readToken('admin');
  if (!raw || !token) return null;
  try {
    return { admin: JSON.parse(raw) as Admin, token };
  } catch {
    return null;
  }
}

export function clearAdminAuth(): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(ADMIN_USER_KEY);
  clearToken('admin');
}
