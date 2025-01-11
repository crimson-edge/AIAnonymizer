'use client';

import { useState } from 'react';
import Link from 'next/link';

const tiers = [
  {
    name: 'Free Forever',
    price: '$0',
    tier: 'FREE',
    features: [
      'Access to Meta LLama 3.3 70B and other LLM models',
      'Basic anonymization',
      '10,000 tokens per month',
      '2 requests per minute',
      '20 requests per hour',
      '100 requests per day',
      'Max 1,000 tokens per request',
      'Public API access',
      'Basic support',
    ],
    cta: 'Get Started',
    description: 'Perfect for trying out AI with privacy.',
    href: '/auth/signup',
  },
  {
    name: 'Basic',
    price: '$8',
    tier: 'BASIC',
    features: [
      'Everything in Free, plus:',
      'Enhanced anonymization',
      '100,000 tokens per month',
      '10 requests per minute',
      '100 requests per hour',
      '1,000 requests per day',
      'Max 4,000 tokens per request',
      'Priority support',
      'Private API access',
      '2 concurrent requests',
    ],
    cta: 'Start Basic Plan',
    description: 'For individuals who need more power and privacy.',
    href: '/auth/signup?plan=basic',
    priceId: process.env.NEXT_PUBLIC_STRIPE_BASIC_PRICE_ID,
    featured: true,
  },
  {
    name: 'Premium',
    price: '$15',
    tier: 'PREMIUM',
    features: [
      'Everything in Basic, plus:',
      'Military-grade encryption',
      '500,000 tokens per month',
      '30 requests per minute',
      '300 requests per hour',
      '3,000 requests per day',
      'Max 10,000 tokens per request',
      'Priority phone support',
      'Import/Export conversations',
      '5 concurrent requests',
      'Advanced analytics',
      'Early access features',
    ],
    cta: 'Start Premium Plan',
    description: 'For professionals who need the ultimate in privacy and performance.',
    href: '/auth/signup?plan=premium',
    priceId: process.env.NEXT_PUBLIC_STRIPE_PREMIUM_PRICE_ID,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    tier: 'ENTERPRISE',
    features: [
      'Everything in Premium, plus:',
      'Unlimited tokens per month',
      '120 requests per minute',
      '1,200 requests per hour',
      '12,000 requests per day',
      'Max 10,000 tokens per request',
      '20 concurrent requests',
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

export default function PricingUI() {
  const [showEnterpriseForm, setShowEnterpriseForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    message: '',
  });

  const handleEnterpriseContact = (e: React.MouseEvent) => {
    e.preventDefault();
    // Wait for Kommunicate to be available
    const checkKommunicate = setInterval(() => {
      if ((window as any).Kommunicate) {
        clearInterval(checkKommunicate);
        (window as any).Kommunicate.launchConversation();
        setTimeout(() => {
          (window as any).Kommunicate.sendMessage({
            message: "Hi, I'm interested in learning more about the Enterprise plan. Could you please provide more information about custom solutions and pricing?"
          });
        }, 1000);
      }
    }, 100);
  };

  return (
    <div className="py-12">
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {tiers.map((tier) => (
          <div
            key={tier.name}
            className={`relative flex flex-col rounded-2xl border p-8 shadow-sm ${
              tier.featured ? 'border-blue-600 shadow-blue-100' : 'border-gray-200'
            }`}
          >
            {tier.featured && (
              <div className="absolute -top-4 left-0 right-0 mx-auto w-32 rounded-full bg-blue-600 px-3 py-1 text-sm font-medium text-white">
                Most Popular
              </div>
            )}
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-gray-900">{tier.name}</h3>
              <p className="mt-4 flex items-baseline text-gray-900">
                <span className="text-4xl font-bold tracking-tight">{tier.price}</span>
                {tier.price !== 'Custom' && <span className="ml-1 text-sm font-semibold">/month</span>}
              </p>
              <p className="mt-6 text-gray-500">{tier.description}</p>

              <ul role="list" className="mt-6 space-y-6">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex">
                    <svg
                      className="h-6 w-6 flex-shrink-0 text-blue-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    <span className="ml-3 text-gray-500">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {tier.tier === 'ENTERPRISE' ? (
              <button
                onClick={handleEnterpriseContact}
                className="mt-8 block w-full rounded-md bg-blue-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              >
                {tier.cta}
              </button>
            ) : (
              <Link
                href={tier.href}
                className={`mt-8 block w-full rounded-md px-3 py-2 text-center text-sm font-semibold shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
                  tier.featured
                    ? 'bg-blue-600 text-white hover:bg-blue-700 focus-visible:outline-blue-600'
                    : 'bg-white text-blue-600 ring-1 ring-inset ring-blue-200 hover:ring-blue-300 focus-visible:outline-blue-600'
                }`}
              >
                {tier.cta}
              </Link>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
