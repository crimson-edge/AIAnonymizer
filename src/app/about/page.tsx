import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'About AI Anonymizer - Protecting Your Privacy in the AI Era',
  description: 'Learn why AI privacy matters and how AI Anonymizer protects your sensitive data while interacting with AI language models.',
  keywords: [
    'AI privacy',
    'data protection',
    'AI security',
    'anonymous AI',
    'secure AI interactions',
    'AI data privacy',
    'confidential computing',
  ],
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-blue-50 to-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl lg:text-6xl font-bold tracking-tight text-gray-900">
              Protecting Your Future in the AI Revolution
            </h1>
            <p className="mt-6 text-lg md:text-xl leading-8 text-gray-600 max-w-3xl mx-auto px-4">
              In an era where AI shapes our world, your privacy isn't just a right—it's a necessity.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="px-4 sm:px-0">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Our Mission</h2>
              <p className="mt-4 text-base md:text-lg text-gray-600">
                At AI Anonymizer, we believe that innovation shouldn't come at the cost of privacy. 
                Our mission is to empower individuals and organizations to harness the full potential 
                of AI while maintaining complete control over their sensitive data.
              </p>
              <p className="mt-4 text-base md:text-lg text-gray-600">
                Every query you make to an AI system contains valuable information about your thoughts, 
                projects, and intellectual property. Without proper protection, this data becomes 
                vulnerable to exploitation, competitive analysis, and privacy breaches.
              </p>
            </div>
            <div className="relative h-64 sm:h-96 rounded-xl overflow-hidden shadow-xl">
              <Image
                src="https://images.unsplash.com/photo-1633265486064-086b219458ec"
                alt="Secure data visualization"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* Why It Matters Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Why AI Privacy Matters
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
            <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm">
              <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-3 md:mb-4">
                Intellectual Property Protection
              </h3>
              <p className="text-gray-600">
                Your AI queries often contain proprietary information, trade secrets, and innovative 
                ideas. Without anonymization, this valuable IP is exposed to potential competitors.
              </p>
            </div>
            <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm">
              <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-3 md:mb-4">
                Data Mining Prevention
              </h3>
              <p className="text-gray-600">
                AI providers can analyze your queries to build detailed profiles about your business 
                strategy, research directions, and competitive advantages. We prevent this data mining.
              </p>
            </div>
            <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm">
              <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-3 md:mb-4">
                Regulatory Compliance
              </h3>
              <p className="text-gray-600">
                With increasing privacy regulations like GDPR and CCPA, ensuring your AI interactions 
                are privacy-compliant is not just good practice—it's a legal requirement.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How We Protect You Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            How We Protect Your Privacy
          </h2>
          <div className="space-y-12">
            <div className="flex flex-col md:flex-row gap-8 items-center">
              <div className="flex-1">
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                  Advanced Encryption
                </h3>
                <p className="text-lg text-gray-600">
                  Every query is encrypted using military-grade encryption before it leaves your 
                  device. Your sensitive information remains private, even from us.
                </p>
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                  Zero-Knowledge Architecture
                </h3>
                <p className="text-lg text-gray-600">
                  Our unique architecture ensures that your data is anonymized and sanitized before 
                  reaching any AI provider. We maintain zero logs of your interactions.
                </p>
              </div>
            </div>
            <div className="flex flex-col md:flex-row gap-8 items-center">
              <div className="flex-1">
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                  Real-time Sanitization
                </h3>
                <p className="text-lg text-gray-600">
                  Our AI-powered sanitization engine removes identifying information in real-time, 
                  ensuring your queries maintain their meaning while removing sensitive details.
                </p>
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                  Secure Infrastructure
                </h3>
                <p className="text-lg text-gray-600">
                  Built on enterprise-grade infrastructure with multiple layers of security, 
                  regular security audits, and compliance with international privacy standards.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-8">
            Take Control of Your AI Privacy Today
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Join thousands of users who trust AI Anonymizer to protect their privacy while 
            leveraging the power of AI technology.
          </p>
          <div className="flex justify-center gap-4">
            <Link
              href="/pricing"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-blue-700 bg-white hover:bg-blue-50"
            >
              Get Started
            </Link>
            <Link
              href="/blog/protecting-your-privacy-in-the-age-of-ai"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-500 hover:bg-blue-400"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
