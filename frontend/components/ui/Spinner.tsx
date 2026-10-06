import clsx from 'clsx';

export function Spinner({ className }: { className?: string }) {
  return (
    <span
      className={clsx(
        'inline-block h-5 w-5 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600',
        className
      )}
    />
  );
}

export function PageSpinner({ label = 'Loading\u2026' }: { label?: string }) {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 text-gray-500">
      <Spinner className="h-6 w-6" />
      <p className="text-sm">{label}</p>
    </div>
  );
}
