import Navigation from '@/components/Navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import Link from 'next/link';

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
      'Community support',
      'Public API access',
    ],
    cta: 'Get Started',
    description: 'Perfect for trying out AI with privacy.',
    href: '/auth/signin',
  },
  {
    name: 'Basic',
    price: '$9',
    tier: 'BASIC',
    features: [
      'Everything in Free',
      'Enhanced anonymization',
      '10,000 tokens per month',
      '15 requests per minute',
      'Email support',
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
    price: '$29',
    tier: 'PREMIUM',
    features: [
      'Everything in Basic',
      'Military-grade encryption',
      '100,000 tokens per month',
      '50 requests per minute',
      'Priority support',
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
];

export default async function PricingPage() {
  const session = await getServerSession(authOptions);

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
                  <span
                    className={`text-sm ${
                      tier.featured ? 'text-blue-100' : 'text-gray-600'
                    }`}
                  >
                    /month
                  </span>
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
                  Free and Basic plans will be paused until the next billing cycle. Premium users get 100,000 tokens per month.
                </dd>
              </div>
              <div>
                <dt className="text-lg font-semibold text-gray-900">
                  What are the rate limits?
                </dt>
                <dd className="mt-3 text-gray-600">
                  Free tier: 5/min, Basic: 15/min, Premium: 50/min. Premium users also get custom rate limit options.
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </main>
    </>
  );
}
