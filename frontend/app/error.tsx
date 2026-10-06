'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to the console in dev; in production you'd send to Sentry/etc.
    // eslint-disable-next-line no-console
    console.error('Global error boundary:', error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 text-center">
      <p className="text-5xl font-bold text-red-600">Oops</p>
      <h1 className="mt-4 text-2xl font-bold text-gray-900">
        Something went wrong
      </h1>
      <p className="mt-2 max-w-md text-sm text-gray-600">
        We hit an unexpected error. You can try again, or head back home.
      </p>
      <div className="mt-6 flex gap-3">
        <Button variant="outline" onClick={() => reset()}>
          Try again
        </Button>
        <Link href="/">
          <Button>Go home</Button>
        </Link>
      </div>
    </div>
  );
}