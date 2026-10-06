'use client';

import { useState, FormEvent } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { ApiException } from '@/types/api';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Button from '@/components/ui/Button';

export function RegisterForm() {
  const { register, submitting } = useAuth();
  const toast = useToast();

  const [values, setValues] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '',
    password_confirmation: '',
    address: '',
  });
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);

  const setField = (k: keyof typeof values, v: string) =>
    setValues((p) => ({ ...p, [k]: v }));

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setErrors({});
    setGeneralError(null);

    try {
      await register({
        full_name: values.full_name,
        email: values.email,
        phone: values.phone,
        password: values.password,
        password_confirmation: values.password_confirmation,
        address: values.address || undefined,
      });

      // Set cookie for middleware
      const token = window.localStorage.getItem('customer_token');
      if (token) {
        document.cookie = `customer_token=${token}; path=/; max-age=${60 * 60 * 24}; samesite=lax`;
      }

      toast.push('Account created!', 'success');
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
        label="Full name"
        name="full_name"
        value={values.full_name}
        onChange={(e) => setField('full_name', e.target.value)}
        error={errors.full_name?.[0]}
        required
      />

      <Input
        label="Email"
        type="email"
        name="email"
        value={values.email}
        onChange={(e) => setField('email', e.target.value)}
        error={errors.email?.[0]}
        required
      />

      <Input
        label="Phone"
        name="phone"
        placeholder="08012345678"
        value={values.phone}
        onChange={(e) => setField('phone', e.target.value)}
        error={errors.phone?.[0]}
        required
      />

      <Textarea
        label="Address (optional)"
        name="address"
        rows={2}
        value={values.address}
        onChange={(e) => setField('address', e.target.value)}
        error={errors.address?.[0]}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Password"
          type="password"
          name="password"
          value={values.password}
          onChange={(e) => setField('password', e.target.value)}
          error={errors.password?.[0]}
          required
        />
        <Input
          label="Confirm password"
          type="password"
          name="password_confirmation"
          value={values.password_confirmation}
          onChange={(e) => setField('password_confirmation', e.target.value)}
          error={errors.password_confirmation?.[0]}
          required
        />
      </div>

      <Button type="submit" loading={submitting} fullWidth>
        Create account
      </Button>
    </form>
  );
}
