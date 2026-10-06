'use client';

import { useState, FormEvent } from 'react';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { useToast } from '@/hooks/useToast';
import { ApiException } from '@/types/api';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';

export default function AdminLoginPage() {
  const { login, submitting } = useAdminAuth();
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
      toast.push('Welcome back, admin', 'success');
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
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-blue-700">
            LaundryApp &middot; Admin
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Sign in to the management dashboard
          </p>
        </div>

        <Card>
          <CardHeader title="Admin login" />
          <CardBody>
            <form onSubmit={onSubmit} className="space-y-4">
              {generalError && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {generalError}
                </div>
              )}
              <Input
                label="Email"
                type="email"
                value={values.email}
                onChange={(e) => setField('email', e.target.value)}
                error={errors.email?.[0]}
                required
              />
              <Input
                label="Password"
                type="password"
                value={values.password}
                onChange={(e) => setField('password', e.target.value)}
                error={errors.password?.[0]}
                required
              />
              <Button type="submit" loading={submitting} fullWidth>
                Sign in
              </Button>
            </form>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
