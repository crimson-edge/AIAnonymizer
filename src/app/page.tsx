import Navigation from '@/components/Navigation';
import Testimonials from '@/components/Testimonials';
import Link from 'next/link';

export default function Home() {
  return (
    <>
      <Navigation />
      <main>
        {/* Hero Section (Above the fold) */}
        <section className="pt-16 bg-white min-h-screen">
          <div className="mx-auto max-w-6xl px-4">
            <div className="text-center">
              <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
                Your Privacy Matters in the AI Era
              </h1>
              <p className="mt-6 text-lg leading-8 text-gray-600">
                Access AI language models securely and anonymously. Keep your queries private, data protected, and identity secure.
              </p>
              <div className="mt-10 flex items-center justify-center gap-x-6">
                <Link
                  href="/signup"
                  className="rounded-md bg-blue-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                >
                  Get started
                </Link>
                <Link href="/features" className="text-sm font-semibold leading-6 text-gray-900">
                  Learn more <span aria-hidden="true">→</span>
                </Link>
              </div>
            </div>

            {/* Video Section */}
            <div className="mt-16 flex justify-center">
              <div className="aspect-w-16 aspect-h-9 w-full max-w-4xl">
                <iframe
                  src="https://www.youtube.com/embed/rGW9tkXXwmg"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="rounded-xl shadow-2xl"
                ></iframe>
              </div>
            </div>

            {/* Features Grid */}
            <div className="mt-24 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {/* Complete Privacy */}
              <div className="rounded-xl border border-gray-200 p-8 shadow-sm">
                <h3 className="text-lg font-semibold">Complete Privacy</h3>
                <p className="mt-4 text-gray-600">Your queries are fully encrypted and anonymized.</p>
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
