import Link from 'next/link';
import { RegisterForm } from '@/components/forms/RegisterForm';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';

export default function RegisterPage() {
  return (
    <div className="mx-auto flex max-w-lg flex-col px-4 py-16">
      <Card>
        <CardHeader title="Create your account" subtitle="It only takes a minute" />
        <CardBody>
          <RegisterForm />
          <p className="mt-4 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-blue-700">
              Sign in
            </Link>
          </p>
        </CardBody>
      </Card>
    </div>
  );
}
