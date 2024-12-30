import Navigation from '@/components/Navigation';
import Link from 'next/link';

export default function Home() {
  return (
    <>
      <Navigation />
      <main>
        {/* Hero Section (Above the fold) */}
        <section className="pt-16 bg-white min-h-screen">
          <div className="mx-auto max-w-6xl px-4">
            <div className="grid lg:grid-cols-2 gap-8 items-start pt-8">
              {/* Welcome Video */}
              <div className="aspect-video rounded-lg overflow-hidden shadow-lg bg-gray-900">
                <iframe
                  className="w-full h-full"
                  src="https://www.youtube.com/embed/rGW9tkXXwmg?rel=0&modestbranding=1&playsinline=1&enablejsapi=1"
                  title="AI Anonymizer Welcome Video"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>

              {/* Key Features */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="flex gap-3 items-start">
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-[rgb(var(--facebook-blue))] flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Complete Privacy</h3>
                    <p className="mt-1 text-sm text-gray-600">Your identity remains anonymous with our secure VPN tunnel</p>
                  </div>
                </div>
                <div className="flex gap-3 items-start">
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-[rgb(var(--facebook-blue))] flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Zero Logs Policy</h3>
                    <p className="mt-1 text-sm text-gray-600">We never store your conversations or personal data</p>
                  </div>
                </div>
                <div className="flex gap-3 items-start">
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-[rgb(var(--facebook-blue))] flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Lightning Fast</h3>
                    <p className="mt-1 text-sm text-gray-600">Optimized infrastructure for rapid AI responses</p>
                  </div>
                </div>
                <div className="flex gap-3 items-start">
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-[rgb(var(--facebook-blue))] flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14v6m-3-3h6M6 10h2a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v2a2 2 0 002 2zm10 0h2a2 2 0 002-2V6a2 2 0 00-2-2h-2a2 2 0 00-2 2v2a2 2 0 002 2zM6 20h2a2 2 0 002-2v-2a2 2 0 00-2-2H6a2 2 0 00-2 2v2a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Multiple AI Models</h3>
                    <p className="mt-1 text-sm text-gray-600">Access ChatGPT, Claude, and other leading AI models</p>
                  </div>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="mt-8 text-center">
              <Link
                href="/signup"
                className="inline-flex items-center px-6 py-3 text-base font-medium text-white bg-[rgb(var(--facebook-blue))] rounded-lg hover:bg-[rgb(var(--facebook-blue-hover))]"
              >
                Start Using AI Anonymously
                <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </section>

        {/* Additional content below the fold */}
        <section className="py-20 bg-gray-50">
          <div className="mx-auto max-w-6xl px-4">
            <h2 className="text-3xl font-bold text-center text-gray-900">Why Choose AI Anonymizer?</h2>
            {/* Add more content here */}
          </div>
        </section>
      </main>
    </>
  );
}
