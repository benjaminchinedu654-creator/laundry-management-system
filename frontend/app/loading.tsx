import { PageSpinner } from '@/components/ui/Spinner';

export default function GlobalLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <PageSpinner label="Loading…" />
    </div>
  );
}