'use client';

import { useEffect, useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Service } from '@/types/service';
import { ApiException } from '@/types/api';
import { useToast } from '@/hooks/useToast';
import { useAuth } from '@/hooks/useAuth';
import { PageSpinner } from '@/components/ui/Spinner';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Button from '@/components/ui/Button';
import { ServicePicker, PickedItem } from '@/components/service/ServicePicker';
import { formatCurrency } from '@/lib/format';

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export default function NewOrderPage() {
  const router = useRouter();
  const toast = useToast();
  const { user } = useAuth();

  const today = new Date();
  const twoDaysLater = new Date(today.getTime() + 2 * 86400000);

  const [services, setServices] = useState<Service[]>([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const [picked, setPicked] = useState<PickedItem[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  const [values, setValues] = useState({
    pickup_address: user?.address ?? '',
    pickup_date: isoDate(today),
    pickup_time: '09:00',
    delivery_address: user?.address ?? '',
    delivery_date: isoDate(twoDaysLater),
    delivery_time: '16:00',
    special_notes: '',
  });

  const setField = (k: keyof typeof values, v: string) =>
    setValues((p) => ({ ...p, [k]: v }));

  useEffect(() => {
    api
      .listServices()
      .then((res) => setServices(res.services))
      .catch(() => toast.push('Could not load services', 'error'))
      .finally(() => setLoadingServices(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // If user info arrives after first render, prefill the addresses
  useEffect(() => {
    if (!user?.address) return;
    setValues((v) => ({
      ...v,
      pickup_address: v.pickup_address || user.address || '',
      delivery_address: v.delivery_address || user.address || '',
    }));
  }, [user?.address]);

  const runningTotal = picked.reduce(
    (sum, p) => sum + Number(p.service.unit_price) * p.quantity,
    0
  );

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setErrors({});

    if (picked.length === 0) {
      toast.push('Pick at least one item', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.createOrder({
        ...values,
        items: picked.map((p) => ({
          service_id: p.service.id,
          quantity: p.quantity,
        })),
      });
      toast.push('Order created!', 'success');
      router.push(`/orders/${res.order.id}`);
    } catch (err) {
      if (err instanceof ApiException) {
        setErrors(err.fieldErrors);
        toast.push(err.message, 'error');
      } else {
        toast.push('Unexpected error. Please try again.', 'error');
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (loadingServices) return <PageSpinner label="Loading services&hellip;" />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">New order</h1>
        <p className="mt-1 text-gray-600">
          Choose your items and schedule pickup &amp; delivery.
        </p>
      </div>

      <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-3">
        {/* Items + pickup + delivery */}
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader title="Items" subtitle="Tap +/&#8722; to add or remove" />
            <CardBody>
              <ServicePicker
                services={services}
                value={picked}
                onChange={setPicked}
              />
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Pickup" />
            <CardBody className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Input
                  label="Pickup address"
                  name="pickup_address"
                  value={values.pickup_address}
                  onChange={(e) => setField('pickup_address', e.target.value)}
                  error={errors.pickup_address?.[0]}
                  required
                />
              </div>
              <Input
                label="Pickup date"
                type="date"
                name="pickup_date"
                value={values.pickup_date}
                onChange={(e) => setField('pickup_date', e.target.value)}
                error={errors.pickup_date?.[0]}
                required
              />
              <Input
                label="Pickup time"
                type="time"
                name="pickup_time"
                value={values.pickup_time}
                onChange={(e) => setField('pickup_time', e.target.value)}
                error={errors.pickup_time?.[0]}
                required
              />
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Delivery" />
            <CardBody className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Input
                  label="Delivery address"
                  name="delivery_address"
                  value={values.delivery_address}
                  onChange={(e) => setField('delivery_address', e.target.value)}
                  error={errors.delivery_address?.[0]}
                  required
                />
              </div>
              <Input
                label="Delivery date"
                type="date"
                name="delivery_date"
                value={values.delivery_date}
                onChange={(e) => setField('delivery_date', e.target.value)}
                error={errors.delivery_date?.[0]}
                required
              />
              <Input
                label="Delivery time"
                type="time"
                name="delivery_time"
                value={values.delivery_time}
                onChange={(e) => setField('delivery_time', e.target.value)}
                error={errors.delivery_time?.[0]}
                required
              />
              <div className="sm:col-span-2">
                <Textarea
                  label="Special notes (optional)"
                  name="special_notes"
                  rows={2}
                  value={values.special_notes}
                  onChange={(e) => setField('special_notes', e.target.value)}
                  placeholder="e.g. no bleach, delicate fabrics"
                />
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Sticky summary */}
        <div className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          <Card>
            <CardHeader title="Order summary" />
            <CardBody className="space-y-3">
              {picked.length === 0 ? (
                <p className="text-sm text-gray-500">No items selected yet.</p>
              ) : (
                <ul className="space-y-2 text-sm">
                  {picked.map((p) => (
                    <li
                      key={p.service.id}
                      className="flex items-center justify-between"
                    >
                      <span className="truncate pr-2 text-gray-700">
                        {p.service.name} &times; {p.quantity}
                      </span>
                      <span className="font-medium text-gray-900">
                        {formatCurrency(
                          Number(p.service.unit_price) * p.quantity
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
              )}

              <div className="flex items-center justify-between border-t border-gray-100 pt-3">
                <span className="text-sm font-medium text-gray-700">Total</span>
                <span className="text-base font-semibold text-gray-900">
                  {formatCurrency(runningTotal)}
                </span>
              </div>

              <Button
                type="submit"
                fullWidth
                loading={submitting}
                disabled={picked.length === 0}
              >
                Place order
              </Button>
            </CardBody>
          </Card>
        </div>
      </form>
    </div>
  );
}
