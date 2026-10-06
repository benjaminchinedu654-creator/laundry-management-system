const CURRENCY = process.env.NEXT_PUBLIC_CURRENCY || '₦';

/**
 * Format a numeric string or number as currency.
 * Handles PHP's DECIMAL strings.
 */
export function formatCurrency(value: string | number | null | undefined): string {
  const n = typeof value === 'string' ? Number(value) : value ?? 0;
  if (isNaN(Number(n))) return `${CURRENCY}0.00`;
  return `${CURRENCY}${Number(n).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Format a YYYY-MM-DD date for display.
 */
export function formatDate(value: string | null | undefined): string {
  if (!value) return '—';
  const d = new Date(value);
  if (isNaN(d.getTime())) return value;
  return d.toLocaleDateString(undefined, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Format HH:MM:SS (or HH:MM) as 12-hour time.
 */
export function formatTime(value: string | null | undefined): string {
  if (!value) return '—';
  const [hStr, mStr] = value.split(':');
  const h = Number(hStr);
  const m = Number(mStr);
  if (isNaN(h) || isNaN(m)) return value;
  const suffix = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${hour}:${String(m).padStart(2, '0')} ${suffix}`;
}

/**
 * Human-friendly "created X ago".
 */
export function formatRelative(value: string | null | undefined): string {
  if (!value) return '—';
  const then = new Date(value).getTime();
  if (isNaN(then)) return value;

  const diff = Math.floor((Date.now() - then) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return formatDate(value);
}

/**
 * Sentence-case a snake_case status string.
 * e.g. "out_for_delivery" → "Out for delivery"
 */
export function humanStatus(status: string): string {
  return status.replace(/_/g, ' ').replace(/^./, (c) => c.toUpperCase());
}
