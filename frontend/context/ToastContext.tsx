'use client';

import { createContext, useCallback, useState, ReactNode } from 'react';
import clsx from 'clsx';

export type ToastVariant = 'success' | 'error' | 'info';

export interface Toast {
  id: string;
  message: string;
  variant: ToastVariant;
}

interface ToastContextValue {
  toasts: Toast[];
  push: (message: string, variant?: ToastVariant) => void;
  dismiss: (id: string) => void;
}

export const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    (message: string, variant: ToastVariant = 'info') => {
      const id = Math.random().toString(36).slice(2);
      setToasts((prev) => [...prev, { id, message, variant }]);
      // Auto dismiss after 4 seconds
      setTimeout(() => dismiss(id), 4000);
    },
    [dismiss]
  );

  return (
    <ToastContext.Provider value={{ toasts, push, dismiss }}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

/* ---------- Viewport (rendered once, globally) ---------- */

function ToastViewport({
  toasts,
  onDismiss,
}: {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}) {
  if (toasts.length === 0) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-50 flex flex-col items-center gap-2 px-4">
      {toasts.map((t) => (
        <button
          key={t.id}
          onClick={() => onDismiss(t.id)}
          className={clsx(
            'pointer-events-auto w-full max-w-sm rounded-lg border px-4 py-3 text-sm shadow-md transition',
            'hover:opacity-90 text-left',
            t.variant === 'success' && 'border-green-200 bg-green-50 text-green-900',
            t.variant === 'error'   && 'border-red-200 bg-red-50 text-red-900',
            t.variant === 'info'    && 'border-gray-200 bg-white text-gray-900'
          )}
        >
          {t.message}
        </button>
      ))}
    </div>
  );
}
