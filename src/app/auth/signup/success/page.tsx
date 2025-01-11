'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function SignupSuccess() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    if (!sessionId) {
      setStatus('error');
      return;
    }

    const checkStatus = async () => {
      try {
        const response = await fetch('/api/stripe/check-session?session_id=' + sessionId);
        const data = await response.json();

        if (data.status === 'complete') {
          setStatus('success');
        } else if (data.status === 'error') {
          setStatus('error');
        }
      } catch (error) {
        console.error('Error checking session status:', error);
        setStatus('error');
      }
    };

    // Check status immediately and then every 2 seconds
    checkStatus();
    const interval = setInterval(checkStatus, 2000);

    return () => clearInterval(interval);
  }, [sessionId]);

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <h2 className="mt-4 text-xl font-semibold">Processing your payment...</h2>
        <p className="mt-2 text-sm text-gray-600">This may take a few moments</p>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <div className="rounded-lg bg-red-50 p-8 text-center">
          <h2 className="text-xl font-semibold text-red-800">Something went wrong</h2>
          <p className="mt-2 text-sm text-red-600">
            We couldn't complete your signup. Please try again or contact support.
          </p>
          <a
            href="/pricing"
            className="mt-4 inline-block rounded bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
          >
            Return to Pricing
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div className="rounded-lg bg-green-50 p-8 text-center">
        <h2 className="text-xl font-semibold text-green-800">Payment Successful!</h2>
        <p className="mt-4 text-sm text-green-700">
          We've sent a verification email to your inbox. Please check your email and click the verification link to activate your account.
        </p>
        <p className="mt-2 text-sm text-green-600">
          Once verified, you can sign in to your account and start using our services.
        </p>
        <div className="mt-6 space-y-3">
          <a
            href="/auth/signin"
            className="block rounded bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
          >
            Go to Sign In
          </a>
          <a
            href="/pricing"
            className="block rounded border border-green-600 px-4 py-2 text-sm font-semibold text-green-600 hover:bg-green-50"
          >
            Return to Pricing
          </a>
        </div>
      </div>
    </div>
  );
}
