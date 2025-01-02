import Navigation from '@/components/Navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import Link from 'next/link';
import { useState } from 'react';

const tiers = [
  {
    name: 'Free Forever',
    price: '$0',
    tier: 'FREE',
    features: [
      'Access to GPT-3.5 Turbo',
      'Basic anonymization',
      '1,000 tokens per month',
      '5 requests per minute',
      'Chatbot support',
      'Public API access',
    ],
    cta: 'Get Started',
    description: 'Perfect for trying out AI with privacy.',
    href: '/auth/signin',
  },
  {
    name: 'Basic',
    price: '$8',
    tier: 'BASIC',
    features: [
      'Everything in Free',
      'Enhanced anonymization',
      '10,000 tokens per month',
      '15 requests per minute',
      'Priority support',
      'Private API access',
      'Priority queue',
    ],
    cta: 'Start Basic Plan',
    description: 'For individuals who need more power and privacy.',
    href: '/auth/signin?plan=basic',
    priceId: process.env.STRIPE_BASIC_PRICE_ID,
    featured: true,
  },
  {
    name: 'Premium',
    price: '$15',
    tier: 'PREMIUM',
    features: [
      'Everything in Basic',
      'Military-grade encryption',
      '100,000 tokens per month',
      '50 requests per minute',
      'Live Phone Priority support',
      'Import/Export conversations',
      'Behavioral assist',
      'Advanced data analytics',
      'Custom rate limits',
      'Early access to new features',
    ],
    cta: 'Start Premium Plan',
    description: 'For professionals who need the ultimate in privacy and performance.',
    href: '/auth/signin?plan=premium',
    priceId: process.env.STRIPE_PREMIUM_PRICE_ID,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    tier: 'ENTERPRISE',
    features: [
      'Custom token limits',
      'Custom rate limits',
      'Custom feature set',
      'Dedicated support team',
      'Custom SLA',
      'On-premise deployment',
      'Custom integrations',
      'Compliance assistance',
      'Training & onboarding',
      'Account management',
    ],
    cta: 'Contact Sales',
    description: 'For organizations that need a tailored solution.',
    href: '#enterprise-contact',
  },
];

export default function PricingPage() {
  const [showEnterpriseForm, setShowEnterpriseForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    message: '',
  });

  const handleEnterpriseContact = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would integrate with your admin notification system
    console.log('Enterprise contact:', formData);
    // Reset form and hide it
    setFormData({
      name: '',
      email: '',
      company: '',
      phone: '',
      message: '',
    });
    setShowEnterpriseForm(false);
    // Show success message
    alert('Thank you for your interest! Our team will contact you shortly.');
  };

  return (
    <>
      <Navigation />
      <main className="pt-24 pb-16 bg-gradient-to-b from-blue-50 to-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
              Choose Your Privacy Level
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600 max-w-2xl mx-auto">
              Start with our free tier and upgrade as your needs grow. All plans include our core privacy features.
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {tiers.map((tier) => (
              <div
                key={tier.name}
                className={`rounded-2xl p-8 ${
                  tier.featured
                    ? 'bg-blue-600 text-white ring-4 ring-blue-600'
                    : 'bg-white ring-1 ring-gray-200'
                } relative`}
              >
                {tier.featured && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-yellow-400 text-black px-4 py-1 rounded-full text-sm font-semibold">
                      Most Popular
                    </span>
                  </div>
                )}
                <h2 className="text-2xl font-bold">{tier.name}</h2>
                <p
                  className={`mt-4 text-sm ${
                    tier.featured ? 'text-blue-100' : 'text-gray-600'
                  }`}
                >
                  {tier.description}
                </p>
                <p className="mt-6">
                  <span className="text-4xl font-bold">{tier.price}</span>
                  {tier.price !== 'Custom' && (
                    <span
                      className={`text-sm ${
                        tier.featured ? 'text-blue-100' : 'text-gray-600'
                      }`}
                    >
                      /month
                    </span>
                  )}
                </p>

                <ul className="mt-8 space-y-3">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-x-2">
                      <svg
                        className={`h-5 w-5 ${
                          tier.featured ? 'text-white' : 'text-blue-600'
                        }`}
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span
                        className={`text-sm ${
                          tier.featured ? 'text-blue-100' : 'text-gray-600'
                        }`}
                      >
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                {tier.tier === 'ENTERPRISE' ? (
                  <button
                    onClick={() => setShowEnterpriseForm(true)}
                    className={`mt-8 block w-full rounded-lg px-4 py-2 text-center text-sm font-semibold bg-blue-600 text-white hover:bg-blue-500`}
                  >
                    {tier.cta}
                  </button>
                ) : (
                  <Link
                    href={tier.href}
                    className={`mt-8 block w-full rounded-lg px-4 py-2 text-center text-sm font-semibold ${
                      tier.featured
                        ? 'bg-white text-blue-600 hover:bg-blue-50'
                        : 'bg-blue-600 text-white hover:bg-blue-500'
                    }`}
                  >
                    {tier.cta}
                  </Link>
                )}
              </div>
            ))}
          </div>

          {/* Enterprise Contact Form Modal */}
          {showEnterpriseForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg p-8 max-w-md w-full">
                <h3 className="text-2xl font-bold mb-4">Contact Enterprise Sales</h3>
                <form onSubmit={handleEnterpriseContact} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <input
                      type="text"
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                      type="email"
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Company</label>
                    <input
                      type="text"
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                    <input
                      type="tel"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Message</label>
                    <textarea
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      rows={4}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    ></textarea>
                  </div>
                  <div className="flex justify-end space-x-4">
                    <button
                      type="button"
                      onClick={() => setShowEnterpriseForm(false)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-500"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-500"
                    >
                      Submit
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* FAQ Section */}
          <div className="mt-24">
            <h2 className="text-3xl font-bold text-center text-gray-900">
              Frequently Asked Questions
            </h2>
            <dl className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <dt className="text-lg font-semibold text-gray-900">
                  Can I change plans anytime?
                </dt>
                <dd className="mt-3 text-gray-600">
                  Yes, you can upgrade, downgrade, or cancel your plan at any time. Changes take effect at your next billing cycle.
                </dd>
              </div>
              <div>
                <dt className="text-lg font-semibold text-gray-900">
                  What happens if I exceed my monthly tokens?
                </dt>
                <dd className="mt-3 text-gray-600">
                  Free and Basic plans will be paused until the next billing cycle. Premium users get 100,000 tokens per month. Enterprise users get custom limits.
                </dd>
              </div>
              <div>
                <dt className="text-lg font-semibold text-gray-900">
                  What support options are available?
                </dt>
                <dd className="mt-3 text-gray-600">
                  Free tier includes chatbot support, Basic includes Priority support, Premium includes Live Phone Priority support, and Enterprise gets a dedicated support team.
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </main>
    </>
  );
}
