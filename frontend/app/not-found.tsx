import Link from 'next/link';
import Button from '@/components/ui/Button';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 text-center">
      <p className="text-6xl font-bold text-brand-700">404</p>
      <h1 className="mt-4 text-2xl font-bold text-gray-900">Page not found</h1>
      <p className="mt-2 max-w-md text-sm text-gray-600">
        The page you're looking for doesn't exist or may have been moved.
      </p>
      <div className="mt-6 flex gap-3">
        <Link href="/">
          <Button variant="outline">Go home</Button>
        </Link>
        <Link href="/dashboard">
          <Button>Go to dashboard</Button>
        </Link>
      </div>
    </div>
  );
}