'use client';

import { useEffect, useState, FormEvent } from 'react';
import { api } from '@/lib/api';
import { Payment, PaymentMethod, PaymentState } from '@/types/payment';
import { ApiException } from '@/types/api';
import { useToast } from '@/hooks/useToast';
import { Card, CardBody } from '@/components/ui/Card';
import { PageSpinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import { formatCurrency, formatDate } from '@/lib/format';

const statusColors: Record<PaymentState, string> = {
  pending:  'border-amber-200 bg-amber-100 text-amber-800',
  success:  'border-green-200 bg-green-100 text-green-800',
  failed:   'border-red-200 bg-red-100 text-red-800',
  refunded: 'border-gray-200 bg-gray-100 text-gray-700',
};

export default function AdminPaymentsPage() {
  const toast = useToast();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [totals, setTotals] = useState({ all_time: 0, today: 0 });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [methodFilter, setMethodFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({
    order_id: '',
    amount: '',
    method: 'cash' as PaymentMethod,
    status: 'success' as PaymentState,
    reference: '',
  });
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    api
      .adminListPayments({
        status: statusFilter || undefined,
        method: methodFilter || undefined,
        per_page: 30,
      })
      .then((res) => {
        setPayments(res.payments);
        setTotals(res.totals);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, methodFilter]);

  async function onRecordPayment(e: FormEvent) {
    e.preventDefault();
    setErrors({});
    setSaving(true);
    try {
      await api.adminCreatePayment({
        order_id: Number(form.order_id),
        amount: Number(form.amount),
        method: form.method,
        status: form.status,
        reference: form.reference || undefined,
      });
      toast.push('Payment recorded', 'success');
      setModalOpen(false);
      setForm({ order_id: '', amount: '', method: 'cash', status: 'success', reference: '' });
      load();
    } catch (err) {
      if (err instanceof ApiException) {
        setErrors(err.fieldErrors);
        toast.push(err.message, 'error');
      }
    } finally {
      setSaving(false);
    }
  }

  async function changeStatus(p: Payment, next: PaymentState) {
    try {
      const res = await api.adminUpdatePaymentStatus(p.id, next);
      setPayments((prev) => prev.map((x) => (x.id === p.id ? res.payment : x)));
      toast.push('Payment status updated', 'success');
    } catch (err) {
      if (err instanceof ApiException) toast.push(err.message, 'error');
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
          <p className="mt-1 text-gray-600">
            Record payments and manage their statuses.
          </p>
        </div>
        <Button onClick={() => setModalOpen(true)}>+ Record payment</Button>
      </div>

      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardBody>
            <p className="text-xs uppercase tracking-wide text-gray-500">
              Revenue &mdash; today
            </p>
            <p className="mt-2 text-xl font-bold text-gray-900">
              {formatCurrency(totals.today)}
            </p>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <p className="text-xs uppercase tracking-wide text-gray-500">
              Revenue &mdash; all time
            </p>
            <p className="mt-2 text-xl font-bold text-gray-900">
              {formatCurrency(totals.all_time)}
            </p>
          </CardBody>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardBody className="grid gap-3 sm:grid-cols-2">
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            placeholder="All statuses"
            options={[
              { value: 'pending',  label: 'Pending' },
              { value: 'success',  label: 'Success' },
              { value: 'failed',   label: 'Failed' },
              { value: 'refunded', label: 'Refunded' },
            ]}
          />
          <Select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            placeholder="All methods"
            options={[
              { value: 'cash',     label: 'Cash' },
              { value: 'card',     label: 'Card' },
              { value: 'transfer', label: 'Transfer' },
            ]}
          />
        </CardBody>
      </Card>

      {loading ? (
        <PageSpinner />
      ) : payments.length === 0 ? (
        <EmptyState
          title="No payments found"
          description="Record a payment or adjust your filters."
        />
      ) : (
        <Card>
          <CardBody className="overflow-x-auto p-0">
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead className="bg-gray-50">
                <tr className="text-xs uppercase tracking-wide text-gray-500">
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Order</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Method</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Change</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p.id} className="border-t border-gray-100">
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {formatDate(p.created_at)}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {p.order_code}
                    </td>
                    <td className="px-4 py-3 text-gray-700">{p.user_name}</td>
                    <td className="px-4 py-3 text-gray-800">
                      {formatCurrency(p.amount)}
                    </td>
                    <td className="px-4 py-3 capitalize text-gray-700">
                      {p.method}
                    </td>
                    <td className="px-4 py-3">
                      <Badge className={statusColors[p.status]}>{p.status}</Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Select
                        value={p.status}
                        onChange={(e) =>
                          changeStatus(p, e.target.value as PaymentState)
                        }
                        options={[
                          { value: 'pending',  label: 'Pending' },
                          { value: 'success',  label: 'Success' },
                          { value: 'failed',   label: 'Failed' },
                          { value: 'refunded', label: 'Refunded' },
                        ]}
                        className="!w-32 !py-1 !text-xs"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardBody>
        </Card>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Record a payment"
      >
        <form onSubmit={onRecordPayment} className="space-y-4">
          <Input
            label="Order ID"
            type="number"
            value={form.order_id}
            onChange={(e) => setForm((f) => ({ ...f, order_id: e.target.value }))}
            error={errors.order_id?.[0]}
            required
          />
          <Input
            label="Amount"
            type="number"
            step="0.01"
            min="0"
            value={form.amount}
            onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
            error={errors.amount?.[0]}
            required
          />
          <Select
            label="Method"
            value={form.method}
            onChange={(e) =>
              setForm((f) => ({ ...f, method: e.target.value as PaymentMethod }))
            }
            options={[
              { value: 'cash',     label: 'Cash' },
              { value: 'card',     label: 'Card' },
              { value: 'transfer', label: 'Transfer' },
            ]}
          />
          <Select
            label="Status"
            value={form.status}
            onChange={(e) =>
              setForm((f) => ({ ...f, status: e.target.value as PaymentState }))
            }
            options={[
              { value: 'pending', label: 'Pending' },
              { value: 'success', label: 'Success' },
              { value: 'failed',  label: 'Failed' },
            ]}
          />
          <Input
            label="Reference (optional)"
            value={form.reference}
            onChange={(e) =>
              setForm((f) => ({ ...f, reference: e.target.value }))
            }
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" loading={saving}>
              Record payment
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
