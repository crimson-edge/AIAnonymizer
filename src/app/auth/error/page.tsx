import Link from 'next/link';

export default function AuthError() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="text-center text-3xl font-extrabold text-white mb-4">
          Authentication Error
        </h2>
        <p className="text-center text-xl text-gray-300 mb-8">
          There was a problem signing you in.
        </p>
        <div className="flex justify-center space-x-4">
          <Link
            href="/auth/signin"
            className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Try Again
          </Link>
          <Link
            href="/"
            className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-gray-600 hover:bg-gray-700"
          >
            Return Home
          </Link>
        </div>
      </div>
    </div>
  );
}
