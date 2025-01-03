'use client';

import { useState } from 'react';
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

export default function PricingUI() {
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
    <div className="mt-16">
      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8 px-4 sm:px-6">
        {tiers.map((tier) => (
          <div
            key={tier.name}
            className={`relative rounded-2xl p-6 md:p-8 shadow-sm ring-1 ${
              tier.featured
                ? 'ring-2 ring-blue-600 scale-105 md:scale-105 z-10 bg-white'
                : 'ring-1 ring-gray-200 bg-white'
            }`}
          >
            <h3 className="text-lg md:text-xl font-semibold leading-8 text-gray-900">
              {tier.name}
            </h3>
            <p className="mt-4 text-sm leading-6 text-gray-600">{tier.description}</p>
            <div className="mt-6 flex items-baseline gap-x-1">
              <span className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900">
                {tier.price}
              </span>
              {tier.price !== 'Custom' && (
                <span className="text-sm font-semibold leading-6 text-gray-600">/month</span>
              )}
            </div>

            {/* Features */}
            <ul role="list" className="mt-8 space-y-3 text-sm leading-6 text-gray-600">
              {tier.features.map((feature) => (
                <li key={feature} className="flex gap-x-3">
                  <svg
                    className="h-6 w-5 flex-none text-blue-600"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>

            <Link
              href={tier.href}
              onClick={(e) => {
                if (tier.tier === 'ENTERPRISE') {
                  e.preventDefault();
                  setShowEnterpriseForm(true);
                }
              }}
              className={`mt-8 block w-full rounded-md px-3 py-2 text-center text-sm font-semibold leading-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
                tier.featured
                  ? 'bg-blue-600 text-white hover:bg-blue-500 focus-visible:outline-blue-600'
                  : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
              }`}
            >
              {tier.cta}
            </Link>
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
    </div>
  );
}
