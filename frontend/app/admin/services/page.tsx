'use client';

import { useEffect, useState, FormEvent } from 'react';
import clsx from 'clsx';
import { api } from '@/lib/api';
import { Service } from '@/types/service';
import { ApiException } from '@/types/api';
import { useToast } from '@/hooks/useToast';
import { Card, CardBody } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import { Modal } from '@/components/ui/Modal';
import { PageSpinner } from '@/components/ui/Spinner';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatCurrency } from '@/lib/format';

interface FormState {
  id?: number;
  name: string;
  category: string;
  unit_price: string;
  description: string;
  is_available: 0 | 1;
}

const emptyForm: FormState = {
  name: '',
  category: '',
  unit_price: '',
  description: '',
  is_available: 1,
};

export default function AdminServicesPage() {
  const toast = useToast();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const load = () => {
    setLoading(true);
    api
      .adminListServices()
      .then((res) => setServices(res.services))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setForm(emptyForm);
    setErrors({});
    setModalOpen(true);
  };

  const openEdit = (s: Service) => {
    setForm({
      id: s.id,
      name: s.name,
      category: s.category,
      unit_price: String(s.unit_price),
      description: s.description ?? '',
      is_available: s.is_available,
    });
    setErrors({});
    setModalOpen(true);
  };

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setErrors({});
    try {
      const payload = {
        name: form.name.trim(),
        category: form.category.trim(),
        unit_price: Number(form.unit_price),
        description: form.description.trim() || undefined,
        is_available: form.is_available,
      };
      if (form.id) {
        await api.adminUpdateService(form.id, payload);
        toast.push('Service updated', 'success');
      } else {
        await api.adminCreateService(payload);
        toast.push('Service created', 'success');
      }
      setModalOpen(false);
      load();
    } catch (err) {
      if (err instanceof ApiException) {
        setErrors(err.fieldErrors);
        toast.push(err.message, 'error');
      } else {
        toast.push('Something went wrong', 'error');
      }
    } finally {
      setSaving(false);
    }
  }

  async function toggleAvailability(s: Service) {
    try {
      const res = await api.adminSetServiceAvailability(
        s.id,
        s.is_available ? 0 : 1
      );
      setServices((prev) => prev.map((x) => (x.id === s.id ? res.service : x)));
    } catch (err) {
      if (err instanceof ApiException) toast.push(err.message, 'error');
    }
  }

  async function onDelete(s: Service) {
    if (!confirm(`Delete "${s.name}" (${s.category})?`)) return;
    setDeletingId(s.id);
    try {
      await api.adminDeleteService(s.id);
      toast.push('Service deleted', 'success');
      setServices((prev) => prev.filter((x) => x.id !== s.id));
    } catch (err) {
      if (err instanceof ApiException) toast.push(err.message, 'error');
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Services</h1>
          <p className="mt-1 text-gray-600">
            Manage services, prices, and availability.
          </p>
        </div>
        <Button onClick={openCreate}>+ Add service</Button>
      </div>

      {loading ? (
        <PageSpinner />
      ) : services.length === 0 ? (
        <EmptyState
          title="No services yet"
          description="Add your first service to start accepting orders."
          action={<Button onClick={openCreate}>Add service</Button>}
        />
      ) : (
        <Card>
          <CardBody className="overflow-x-auto p-0">
            <table className="w-full min-w-[780px] text-left text-sm">
              <thead className="bg-gray-50">
                <tr className="text-xs uppercase tracking-wide text-gray-500">
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Price</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {services.map((s) => (
                  <tr key={s.id} className="border-t border-gray-100">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{s.name}</div>
                      {s.description && (
                        <div className="text-xs text-gray-500">
                          {s.description}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-700">{s.category}</td>
                    <td className="px-4 py-3 text-gray-800">
                      {formatCurrency(s.unit_price)}
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => toggleAvailability(s)}>
                        <Badge
                          className={clsx(
                            s.is_available
                              ? 'border-green-200 bg-green-100 text-green-800'
                              : 'border-gray-200 bg-gray-100 text-gray-600'
                          )}
                        >
                          {s.is_available ? 'Available' : 'Disabled'}
                        </Badge>
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEdit(s)}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          loading={deletingId === s.id}
                          onClick={() => onDelete(s)}
                        >
                          Delete
                        </Button>
                      </div>
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
        title={form.id ? 'Edit service' : 'New service'}
      >
        <form onSubmit={onSubmit} className="space-y-4">
          <Input
            label="Name"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            error={errors.name?.[0]}
            required
          />
          <Input
            label="Category"
            value={form.category}
            onChange={(e) =>
              setForm((f) => ({ ...f, category: e.target.value }))
            }
            error={errors.category?.[0]}
            placeholder="e.g. Wash &amp; Iron"
            required
          />
          <Input
            label="Unit price"
            type="number"
            step="0.01"
            min="0"
            value={form.unit_price}
            onChange={(e) =>
              setForm((f) => ({ ...f, unit_price: e.target.value }))
            }
            error={errors.unit_price?.[0]}
            required
          />
          <Textarea
            label="Description (optional)"
            rows={2}
            value={form.description}
            onChange={(e) =>
              setForm((f) => ({ ...f, description: e.target.value }))
            }
          />
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={form.is_available === 1}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  is_available: e.target.checked ? 1 : 0,
                }))
              }
            />
            Available for ordering
          </label>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" loading={saving}>
              {form.id ? 'Save changes' : 'Create service'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
