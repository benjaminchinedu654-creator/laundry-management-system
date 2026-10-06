'use client';

import { useMemo, useState } from 'react';
import { Service } from '@/types/service';
import { formatCurrency } from '@/lib/format';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

export interface PickedItem {
  service: Service;
  quantity: number;
}

interface ServicePickerProps {
  services: Service[];
  value: PickedItem[];
  onChange: (v: PickedItem[]) => void;
}

export function ServicePicker({ services, value, onChange }: ServicePickerProps) {
  const [search, setSearch] = useState('');

  const grouped = useMemo(() => {
    const g: Record<string, Service[]> = {};
    const q = search.trim().toLowerCase();
    for (const s of services) {
      if (
        q &&
        !s.name.toLowerCase().includes(q) &&
        !s.category.toLowerCase().includes(q)
      ) {
        continue;
      }
      (g[s.category] ||= []).push(s);
    }
    return g;
  }, [services, search]);

  const getQty = (id: number) =>
    value.find((v) => v.service.id === id)?.quantity ?? 0;

  const setQty = (svc: Service, qty: number) => {
    const next = value.filter((v) => v.service.id !== svc.id);
    if (qty > 0) next.push({ service: svc, quantity: qty });
    onChange(next);
  };

  const inc = (svc: Service) => setQty(svc, getQty(svc.id) + 1);
  const dec = (svc: Service) => setQty(svc, Math.max(0, getQty(svc.id) - 1));

  const runningTotal = value.reduce(
    (sum, v) => sum + Number(v.service.unit_price) * v.quantity,
    0
  );

  return (
    <div className="space-y-4">
      <Input
        placeholder="Search by name or category&hellip;"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="max-h-[380px] space-y-6 overflow-y-auto pr-1">
        {Object.keys(grouped).length === 0 && (
          <p className="text-sm text-gray-500">No matching services.</p>
        )}

        {Object.entries(grouped).map(([category, list]) => (
          <div key={category}>
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
              {category}
            </h4>
            <div className="space-y-2">
              {list.map((s) => {
                const qty = getQty(s.id);
                return (
                  <div
                    key={s.id}
                    className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 bg-white px-3 py-2"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-gray-900">
                        {s.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatCurrency(s.unit_price)} / item
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => dec(s)}
                        disabled={qty === 0}
                      >
                        &minus;
                      </Button>
                      <span className="w-6 text-center text-sm font-semibold text-gray-900">
                        {qty}
                      </span>
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => inc(s)}
                      >
                        +
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between rounded-lg border border-blue-100 bg-blue-50 px-3 py-2">
        <span className="text-sm font-medium text-blue-800">Running total</span>
        <span className="text-sm font-semibold text-blue-900">
          {formatCurrency(runningTotal)}
        </span>
      </div>
    </div>
  );
}
