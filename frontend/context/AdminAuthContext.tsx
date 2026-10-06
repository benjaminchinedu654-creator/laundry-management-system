'use client';

import {
  createContext,
  useCallback,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';
import { Admin } from '@/types/admin';
import { LoginPayload } from '@/types/user';
import { api } from '@/lib/api';
import { saveAdminAuth, loadAdminAuth, clearAdminAuth } from '@/lib/auth';

interface AdminAuthContextValue {
  admin: Admin | null;
  loading: boolean;
  submitting: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  logout: () => void;
  refreshAdmin: () => Promise<void>;
}

export const AdminAuthContext = createContext<AdminAuthContextValue | null>(null);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const saved = loadAdminAuth();
    if (saved) setAdmin(saved.admin);
    setLoading(false);
  }, []);

  const login = useCallback(
    async (payload: LoginPayload) => {
      setSubmitting(true);
      try {
        const { admin, token } = await api.adminLogin(payload);
        saveAdminAuth(admin, token);

        // Set admin cookie so middleware can protect /admin routes
        if (typeof document !== 'undefined') {
          document.cookie = `admin_token=${token}; path=/; max-age=${
            60 * 60 * 24
          }; samesite=lax`;
        }

        setAdmin(admin);
        router.push('/admin/dashboard');
      } finally {
        setSubmitting(false);
      }
    },
    [router]
  );

  const logout = useCallback(() => {
    clearAdminAuth();
    if (typeof document !== 'undefined') {
      document.cookie =
        'admin_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    }
    setAdmin(null);
    router.push('/admin/login');
  }, [router]);

  const refreshAdmin = useCallback(async () => {
    try {
      const { admin } = await api.adminMe();
      setAdmin(admin);
      const saved = loadAdminAuth();
      if (saved) {
        saveAdminAuth(admin, saved.token);
        if (typeof document !== 'undefined') {
          document.cookie = `admin_token=${saved.token}; path=/; max-age=${
            60 * 60 * 24
          }; samesite=lax`;
        }
      }
    } catch {
      // silent
    }
  }, []);

  return (
    <AdminAuthContext.Provider
      value={{ admin, loading, submitting, login, logout, refreshAdmin }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}
