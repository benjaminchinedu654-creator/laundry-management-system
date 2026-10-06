'use client';

import {
  createContext,
  useCallback,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';
import { User, LoginPayload, RegisterPayload } from '@/types/user';
import { api } from '@/lib/api';
import {
  saveCustomerAuth,
  loadCustomerAuth,
  clearCustomerAuth,
} from '@/lib/auth';

interface AuthContextValue {
  user: User | null;
  loading: boolean;      // true during initial hydration
  submitting: boolean;   // true during a login/register request
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  setUser: (u: User) => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  // Hydrate from localStorage on first mount
  useEffect(() => {
    const saved = loadCustomerAuth();
    if (saved) setUserState(saved.user);
    setLoading(false);
  }, []);

  const login = useCallback(async (payload: LoginPayload) => {
    setSubmitting(true);
    try {
      const { user, token } = await api.login(payload);
      saveCustomerAuth(user, token);
      setUserState(user);
      router.push('/dashboard');
    } finally {
      setSubmitting(false);
    }
  }, [router]);

  const register = useCallback(async (payload: RegisterPayload) => {
    setSubmitting(true);
    try {
      const { user, token } = await api.register(payload);
      saveCustomerAuth(user, token);
      setUserState(user);
      router.push('/dashboard');
    } finally {
      setSubmitting(false);
    }
  }, [router]);

  const logout = useCallback(() => {
    clearCustomerAuth();
    // Clear the cookie so middleware stops treating us as logged in
    if (typeof document !== 'undefined') {
      document.cookie =
        'customer_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    }
    setUserState(null);
    router.push('/login');
  }, [router]);

  const refreshUser = useCallback(async () => {
    try {
      const { user } = await api.me();
      setUserState(user);
      const saved = loadCustomerAuth();
      if (saved) {
        saveCustomerAuth(user, saved.token);
        // Keep cookie in sync
        if (typeof document !== 'undefined') {
          document.cookie = `customer_token=${saved.token}; path=/; max-age=${
            60 * 60 * 24
          }; samesite=lax`;
        }
      }
    } catch {
      // Silent; if token expired, middleware will handle redirect
    }
  }, []);

  const setUser = useCallback((u: User) => {
    setUserState(u);
    const saved = loadCustomerAuth();
    if (saved) saveCustomerAuth(u, saved.token);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, loading, submitting, login, register, logout, refreshUser, setUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}
