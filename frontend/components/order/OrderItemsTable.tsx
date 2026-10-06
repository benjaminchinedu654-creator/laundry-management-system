import { OrderItem } from '@/types/order';
import { formatCurrency } from '@/lib/format';

export function OrderItemsTable({ items }: { items: OrderItem[] }) {
  if (!items.length) {
    return <p className="text-sm text-gray-500">No items.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[520px] text-left text-sm">
        <thead>
          <tr className="border-b border-gray-100 text-xs uppercase tracking-wide text-gray-500">
            <th className="py-2 pr-4">Item</th>
            <th className="py-2 pr-4">Category</th>
            <th className="py-2 pr-4">Qty</th>
            <th className="py-2 pr-4">Unit</th>
            <th className="py-2 text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          {items.map((it) => (
            <tr key={it.id} className="border-b border-gray-50">
              <td className="py-3 pr-4 font-medium text-gray-800">
                {it.service_name}
              </td>
              <td className="py-3 pr-4 text-gray-600">{it.category}</td>
              <td className="py-3 pr-4 text-gray-600">{it.quantity}</td>
              <td className="py-3 pr-4 text-gray-600">
                {formatCurrency(it.unit_price)}
              </td>
              <td className="py-3 text-right font-medium text-gray-900">
                {formatCurrency(it.line_total)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
