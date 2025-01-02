import Navigation from '@/components/Navigation';

const tiers = [
  {
    name: 'Basic',
    price: '$9',
    features: [
      'Access to GPT-3.5 Turbo',
      'Basic anonymization',
      '100 queries per month',
      'Email support',
      'Basic API access',
    ],
    cta: 'Start Basic',
    description: 'Perfect for individual users who need basic AI access with privacy.',
  },
  {
    name: 'Pro',
    price: '$29',
    features: [
      'Access to GPT-4',
      'Advanced anonymization',
      '1000 queries per month',
      'Priority support',
      'Full API access',
      'Custom rate limits',
    ],
    cta: 'Start Pro',
    description: 'Best for professionals who need advanced features and higher usage limits.',
    featured: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    features: [
      'Access to all AI models',
      'Enterprise-grade security',
      'Unlimited queries',
      '24/7 dedicated support',
      'Custom API integration',
      'SLA guarantees',
      'Custom features',
    ],
    cta: 'Contact Sales',
    description: 'For organizations that need maximum security and customization.',
  },
];

export default function PricingPage() {
  return (
    <>
      <Navigation />
      <main className="pt-24 pb-16 bg-gradient-to-b from-blue-50 to-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
              Simple, Transparent Pricing
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600 max-w-2xl mx-auto">
              Choose the plan that best fits your needs. All plans include our core privacy features.
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {tiers.map((tier) => (
              <div
                key={tier.name}
                className={`rounded-2xl p-8 ${
                  tier.featured
                    ? 'bg-blue-600 text-white ring-4 ring-blue-600'
                    : 'bg-white ring-1 ring-gray-200'
                }`}
              >
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

                <a
                  href={tier.name === 'Enterprise' ? '/contact' : '/auth/signin'}
                  className={`mt-8 block w-full rounded-lg px-4 py-2 text-center text-sm font-semibold ${
                    tier.featured
                      ? 'bg-white text-blue-600 hover:bg-blue-50'
                      : 'bg-blue-600 text-white hover:bg-blue-500'
                  }`}
                >
                  {tier.cta}
                </a>
              </div>
            ))}
          </div>

          {/* FAQ Section */}
          <div className="mt-24">
            <h2 className="text-3xl font-bold text-center text-gray-900">
              Frequently Asked Questions
            </h2>
            <dl className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <dt className="text-lg font-semibold text-gray-900">
                  How does the anonymization work?
                </dt>
                <dd className="mt-3 text-gray-600">
                  We use advanced encryption and data sanitization techniques to remove all personally identifiable information before processing your queries.
                </dd>
              </div>
              <div>
                <dt className="text-lg font-semibold text-gray-900">
                  Can I upgrade or downgrade my plan?
                </dt>
                <dd className="mt-3 text-gray-600">
                  Yes, you can change your plan at any time. Changes take effect at the start of your next billing cycle.
                </dd>
              </div>
              <div>
                <dt className="text-lg font-semibold text-gray-900">
                  What payment methods do you accept?
                </dt>
                <dd className="mt-3 text-gray-600">
                  We accept all major credit cards and support payment via PayPal for business accounts.
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </main>
    </>
  );
}
