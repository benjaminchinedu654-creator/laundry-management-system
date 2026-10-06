import { Badge } from '@/components/ui/Badge';
import { OrderStatus } from '@/types/order';
import { ORDER_STATUS_COLORS } from '@/lib/constants';
import { humanStatus } from '@/lib/format';

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <Badge className={ORDER_STATUS_COLORS[status]}>{humanStatus(status)}</Badge>
  );
}
