'use client';

import { useState } from 'react';

interface UpgradeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: (tier: 'BASIC' | 'PREMIUM') => void;
}

const tiers = {
  BASIC: {
    name: 'Basic',
    price: '$8/month',
    features: [
      '10,000 tokens/month',
      '15 requests/minute',
      'Email support',
      'Basic analytics'
    ]
  },
  PREMIUM: {
    name: 'Premium',
    price: '$15/month',
    features: [
      '100,000 tokens/month',
      '50 requests/minute',
      'Priority support',
      'Advanced analytics',
      'Additional token purchases'
    ]
  }
};

export default function UpgradeDialog({ isOpen, onClose, onUpgrade }: UpgradeDialogProps) {
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold">Choose Your Plan</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {Object.entries(tiers).map(([key, tier]) => (
            <div
              key={key}
              className="border rounded-lg p-6 flex flex-col"
            >
              <h4 className="text-lg font-semibold mb-2">{tier.name}</h4>
              <p className="text-2xl font-bold mb-4">{tier.price}</p>
              <ul className="space-y-2 mb-6 flex-grow">
                {tier.features.map((feature, index) => (
                  <li key={index} className="flex items-center text-gray-600">
                    <svg className="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => {
                  setLoading(true);
                  onUpgrade(key as 'BASIC' | 'PREMIUM');
                }}
                disabled={loading}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Processing...' : `Select ${tier.name}`}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
