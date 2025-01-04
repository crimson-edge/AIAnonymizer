'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

export default function VerifyEmail() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'verifying' | 'error'>('verifying');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Missing verification token');
      return;
    }

    const verifyEmail = async () => {
      try {
        const response = await fetch(`/api/auth/verify?token=${token}`);
        const data = await response.json();
        
        if (response.ok && data.success) {
          // On success, immediately redirect to success page
          router.push('/auth/verify-success');
        } else {
          setStatus('error');
          setMessage(data.message || 'Error verifying email');
        }
      } catch (error) {
        setStatus('error');
        setMessage('Error verifying email');
      }
    };

    verifyEmail();
  }, [token, router]);

  // Only show error state, successful verifications redirect immediately
  if (status === 'error') {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Email Verification
          </h2>
          <div className="mt-8 bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <div className="text-center">
              <div className="text-red-600">
                <p className="text-lg">{message}</p>
                <button
                  onClick={() => router.push('/auth/signin')}
                  className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  Go to Sign In
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show loading state while verifying
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Email Verification
        </h2>
        <div className="mt-8 bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center">
            <div className="animate-pulse">
              <p className="text-lg text-gray-600">Verifying your email...</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
