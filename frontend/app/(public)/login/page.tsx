import Link from 'next/link';
import { LoginForm } from '@/components/forms/LoginForm';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';

export default function LoginPage() {
  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-16">
      <Card>
        <CardHeader title="Welcome back" subtitle="Sign in to your account" />
        <CardBody>
          <LoginForm />
          <p className="mt-4 text-center text-sm text-gray-600">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="font-medium text-blue-700">
              Create one
            </Link>
          </p>
        </CardBody>
      </Card>
    </div>
  );
}
