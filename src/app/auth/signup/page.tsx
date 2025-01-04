'use client';

import Link from 'next/link';
import SignUpForm from '@/components/auth/SignUpForm';

export default function SignUp() {
  return (
    <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
        <h2 className="mb-6 text-center text-2xl font-semibold text-gray-900">
          Create your account
        </h2>
        <p className="mb-6 text-center text-sm text-gray-600">
          Or{' '}
          <Link href="/auth/signin" className="font-medium text-blue-600 hover:text-blue-500">
            sign in to your account
          </Link>
        </p>
        <SignUpForm />
      </div>
    </div>
  );
}
