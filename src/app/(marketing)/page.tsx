import Navigation from '@/components/Navigation';
import Testimonials from '@/components/Testimonials';
import Link from 'next/link';
import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';

export default async function MarketingPage() {
  const session = await getServerSession();

  // If user is logged in, redirect to appropriate page
  if (session?.user) {
    if (session.user.role === 'admin') {
      redirect('/admin/api-keys');
    } else {
      redirect('/dashboard');
    }
  }

  return (
    <>
      <Navigation />
      <main>
        {/* Hero Section */}
        <section className="bg-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
                Your Privacy Matters in the AI Era
              </h1>
              <p className="mt-6 text-lg leading-8 text-gray-600 max-w-2xl mx-auto">
                Access AI language models securely and anonymously. Keep your queries private, data protected, and identity secure.
              </p>
              <div className="mt-10 flex items-center justify-center gap-x-6">
                <Link
                  href="/auth/signin"
                  className="rounded-md bg-blue-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                >
                  Get started
                </Link>
                <Link href="/features" className="text-sm font-semibold leading-6 text-gray-900">
                  Learn more <span aria-hidden="true">→</span>
                </Link>
              </div>
            </div>

            {/* Features Grid */}
            <div className="mt-24 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {/* Complete Privacy */}
              <div className="rounded-xl border border-gray-200 p-8 shadow-sm">
                <h3 className="text-lg font-semibold">Complete Privacy</h3>
                <p className="mt-4 text-gray-600">Your queries are fully encrypted and anonymized, private even from the AI providers.</p>
              </div>

              {/* Zero Logs */}
              <div className="rounded-xl border border-gray-200 p-8 shadow-sm">
                <h3 className="text-lg font-semibold">Zero Logs Policy</h3>
                <p className="mt-4 text-gray-600">We never store your data or interaction history.</p>
              </div>

              {/* Lightning Fast */}
              <div className="rounded-xl border border-gray-200 p-8 shadow-sm">
                <h3 className="text-lg font-semibold">Lightning Fast</h3>
                <p className="mt-4 text-gray-600">Optimized infrastructure for rapid response times.</p>
              </div>

              {/* Multiple Models */}
              <div className="rounded-xl border border-gray-200 p-8 shadow-sm">
                <h3 className="text-lg font-semibold">Multiple AI Models</h3>
                <p className="mt-4 text-gray-600">Access various AI models through one secure interface.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <Testimonials />
      </main>
    </>
  );
}