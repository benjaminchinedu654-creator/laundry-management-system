'use client';

import { useState, FormEvent } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { ApiException } from '@/types/api';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

export function LoginForm() {
  const { login, submitting } = useAuth();
  const toast = useToast();

  const [values, setValues] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);

  const setField = (k: keyof typeof values, v: string) =>
    setValues((p) => ({ ...p, [k]: v }));

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setErrors({});
    setGeneralError(null);

    try {
      await login(values);

      // Set a cookie alongside localStorage so middleware can read it
      const token = window.localStorage.getItem('customer_token');
      if (token) {
        document.cookie = `customer_token=${token}; path=/; max-age=${60 * 60 * 24}; samesite=lax`;
      }

      toast.push('Welcome back!', 'success');
    } catch (err) {
      if (err instanceof ApiException) {
        setErrors(err.fieldErrors);
        setGeneralError(err.message);
        toast.push(err.message, 'error');
      } else {
        toast.push('Unexpected error. Please try again.', 'error');
      }
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {generalError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {generalError}
        </div>
      )}

      <Input
        label="Email"
        type="email"
        name="email"
        placeholder="you@example.com"
        value={values.email}
        onChange={(e) => setField('email', e.target.value)}
        error={errors.email?.[0]}
        required
      />

      <Input
        label="Password"
        type="password"
        name="password"
        placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
        value={values.password}
        onChange={(e) => setField('password', e.target.value)}
        error={errors.password?.[0]}
        required
      />

      <Button type="submit" loading={submitting} fullWidth>
        Sign in
      </Button>
    </form>
  );
}
