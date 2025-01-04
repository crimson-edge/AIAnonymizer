'use client';

import Testimonials from '@/components/Testimonials';
import Link from 'next/link';

export default function MarketingContent() {
  return (
    <main className="pt-16">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-blue-50 to-white py-16">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Your Privacy Matters in the AI Era
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600 max-w-2xl mx-auto">
              Access AI language models securely and anonymously. Keep your queries private, data protected, and identity secure.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link
                href="/pricing"
                className="rounded-md bg-blue-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              >
                Get Started For Free
              </Link>
              <Link 
                href="/blog"
                className="text-sm font-semibold leading-6 text-gray-900"
              >
                Learn more <span aria-hidden="true">→</span>
              </Link>
            </div>

            {/* Video Section */}
            <div className="mt-16 relative max-w-2xl mx-auto aspect-video">
              <iframe
                className="w-full h-full rounded-lg shadow-xl"
                src="https://www.youtube.com/embed/rGW9tkXXwmg?rel=0&showinfo=0&modestbranding=1"
                title="AI Anonymizer Demo"
                allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                frameBorder="0"
              />
            </div>
          </div>

          {/* Features Grid */}
          <div id="features" className="mt-24 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {/* Complete Privacy */}
            <div className="rounded-xl border border-gray-200 p-8 shadow-sm bg-white">
              <h3 className="text-lg font-semibold">Complete Privacy</h3>
              <p className="mt-4 text-gray-600">Your queries are fully encrypted and anonymized, private even from the AI providers.</p>
              <Link
                href="/pricing"
                className="mt-4 inline-flex items-center text-sm font-semibold text-blue-600 hover:text-blue-500"
              >
                Get Started For Free <span aria-hidden="true">→</span>
              </Link>
            </div>

            {/* Zero Logs */}
            <div className="rounded-xl border border-gray-200 p-8 shadow-sm bg-white">
              <h3 className="text-lg font-semibold">Zero Logs Policy</h3>
              <p className="mt-4 text-gray-600">We never store your data or interaction history.</p>
              <Link
                href="/pricing"
                className="mt-4 inline-flex items-center text-sm font-semibold text-blue-600 hover:text-blue-500"
              >
                Get Started For Free <span aria-hidden="true">→</span>
              </Link>
            </div>

            {/* Lightning Fast */}
            <div className="rounded-xl border border-gray-200 p-8 shadow-sm bg-white">
              <h3 className="text-lg font-semibold">Lightning Fast</h3>
              <p className="mt-4 text-gray-600">Optimized infrastructure for rapid response times.</p>
              <Link
                href="/pricing"
                className="mt-4 inline-flex items-center text-sm font-semibold text-blue-600 hover:text-blue-500"
              >
                Get Started For Free <span aria-hidden="true">→</span>
              </Link>
            </div>

            {/* Multiple Models */}
            <div className="rounded-xl border border-gray-200 p-8 shadow-sm bg-white">
              <h3 className="text-lg font-semibold">Multiple AI Models</h3>
              <p className="mt-4 text-gray-600">Access various AI models through one secure interface.</p>
              <Link
                href="/pricing"
                className="mt-4 inline-flex items-center text-sm font-semibold text-blue-600 hover:text-blue-500"
              >
                Get Started For Free <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <Testimonials />
    </main>
  );
}