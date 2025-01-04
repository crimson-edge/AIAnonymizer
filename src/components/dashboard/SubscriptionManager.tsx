'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface SubscriptionProps {
  currentTier: 'FREE' | 'BASIC' | 'PREMIUM';
  isActive: boolean;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  onPurchaseOverage: () => void;
  onPurchaseTokens: () => void;
}

const tiers = {
  FREE: { price: '$0', features: ['1,000 tokens/month', '5 requests/minute'] },
  BASIC: { price: '$8', features: ['10,000 tokens/month', '15 requests/minute'] },
  PREMIUM: { price: '$15', features: ['100,000 tokens/month', '50 requests/minute'] }
};

export default function SubscriptionManager({ 
  currentTier, 
  isActive,
  stripeCustomerId,
  stripeSubscriptionId,
  onPurchaseOverage,
  onPurchaseTokens
}: SubscriptionProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showUpgradeOptions, setShowUpgradeOptions] = useState(false);
  const [showConfirmDowngrade, setShowConfirmDowngrade] = useState(false);

  const handleUpgrade = async (tier: 'BASIC' | 'PREMIUM') => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/subscription/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier })
      });

      const data = await response.json();
      if (data.url) {
        router.push(data.url);
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (err) {
      setError('Failed to start upgrade process. Please try again.');
      console.error('Upgrade error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchaseTokens = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/subscription/create-token-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: 100000 })
      });

      const data = await response.json();
      if (data.url) {
        router.push(data.url);
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (err) {
      setError('Failed to start token purchase. Please try again.');
      console.error('Token purchase error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDowngrade = async (targetTier: 'FREE' | 'BASIC') => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/subscription/downgrade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetTier })
      });

      if (response.ok) {
        router.refresh();
      } else {
        throw new Error('Failed to downgrade subscription');
      }
    } catch (err) {
      setError('Failed to downgrade subscription. Please try again.');
      console.error('Downgrade error:', err);
    } finally {
      setLoading(false);
      setShowConfirmDowngrade(false);
    }
  };

  // Render upgrade options dialog
  const renderUpgradeOptions = () => {
    if (!showUpgradeOptions) return null;

    const getUpgradeOptions = () => {
      switch (currentTier) {
        case 'FREE':
          return (
            <>
              <div className="space-y-4">
                <div className="border rounded-lg p-4 hover:border-blue-500 cursor-pointer"
                     onClick={() => handleUpgrade('BASIC')}>
                  <h4 className="text-lg font-semibold">Basic Plan - {tiers.BASIC.price}/month</h4>
                  <ul className="mt-2 space-y-2">
                    {tiers.BASIC.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-sm text-gray-600">
                        <svg className="h-4 w-4 text-blue-500 mr-2" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                          <path d="M5 13l4 4L19 7"></path>
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="border rounded-lg p-4 hover:border-blue-500 cursor-pointer"
                     onClick={() => handleUpgrade('PREMIUM')}>
                  <h4 className="text-lg font-semibold">Premium Plan - {tiers.PREMIUM.price}/month</h4>
                  <ul className="mt-2 space-y-2">
                    {tiers.PREMIUM.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-sm text-gray-600">
                        <svg className="h-4 w-4 text-blue-500 mr-2" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                          <path d="M5 13l4 4L19 7"></path>
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </>
          );
        case 'BASIC':
          return (
            <div className="border rounded-lg p-4 hover:border-blue-500 cursor-pointer"
                 onClick={() => handleUpgrade('PREMIUM')}>
              <h4 className="text-lg font-semibold">Premium Plan - {tiers.PREMIUM.price}/month</h4>
              <ul className="mt-2 space-y-2">
                {tiers.PREMIUM.features.map((feature, index) => (
                  <li key={index} className="flex items-center text-sm text-gray-600">
                    <svg className="h-4 w-4 text-blue-500 mr-2" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                      <path d="M5 13l4 4L19 7"></path>
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          );
        default:
          return (
            <div className="space-y-4">
              <div className="border rounded-lg p-4 hover:border-blue-500 cursor-pointer"
                   onClick={() => handleUpgrade('BASIC')}>
                <h4 className="text-lg font-semibold">Basic Plan - {tiers.BASIC.price}/month</h4>
                <ul className="mt-2 space-y-2">
                  {tiers.BASIC.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-sm text-gray-600">
                      <svg className="h-4 w-4 text-blue-500 mr-2" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                        <path d="M5 13l4 4L19 7"></path>
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="border rounded-lg p-4 hover:border-blue-500 cursor-pointer"
                   onClick={() => handleUpgrade('PREMIUM')}>
                <h4 className="text-lg font-semibold">Premium Plan - {tiers.PREMIUM.price}/month</h4>
                <ul className="mt-2 space-y-2">
                  {tiers.PREMIUM.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-sm text-gray-600">
                      <svg className="h-4 w-4 text-blue-500 mr-2" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                        <path d="M5 13l4 4L19 7"></path>
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full">
          <h3 className="text-xl font-semibold mb-4">Choose Your Plan</h3>
          {getUpgradeOptions()}
          <button
            onClick={() => setShowUpgradeOptions(false)}
            className="mt-6 w-full py-2 px-4 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  };

  // Render downgrade confirmation dialog
  const renderDowngradeConfirmation = () => {
    if (!showConfirmDowngrade) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg p-6 max-w-md w-full">
          <h3 className="text-lg font-semibold mb-4">Choose Your Plan</h3>
          <p className="text-gray-600 mb-4">
            Select the plan you want to downgrade to. Changes will take effect at the end of your current billing period.
          </p>
          <div className="space-y-4">
            {currentTier === 'PREMIUM' && (
              <button
                onClick={() => handleDowngrade('BASIC')}
                disabled={loading}
                className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                Downgrade to Basic - {tiers.BASIC.price}/month
                <div className="text-sm mt-1 text-white opacity-80">
                  {tiers.BASIC.features.join(' • ')}
                </div>
              </button>
            )}
            <button
              onClick={() => handleDowngrade('FREE')}
              disabled={loading}
              className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              Downgrade to Free - {tiers.FREE.price}/month
              <div className="text-sm mt-1 text-white opacity-80">
                {tiers.FREE.features.join(' • ')}
              </div>
            </button>
          </div>
          <button
            onClick={() => setShowConfirmDowngrade(false)}
            className="mt-4 w-full py-2 px-4 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  };

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Main subscription action button */}
      {currentTier === 'PREMIUM' ? (
        <button
          onClick={handlePurchaseTokens}
          disabled={loading}
          className="w-full sm:w-auto py-2 px-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Processing...' : 'Purchase Additional Tokens'}
        </button>
      ) : (
        <button
          onClick={() => setShowUpgradeOptions(true)}
          disabled={loading}
          className="w-full sm:w-auto py-2 px-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Processing...' : 'Upgrade Your Plan'}
        </button>
      )}

      {/* Downgrade link - only show if on BASIC or PREMIUM plan */}
      {(currentTier === 'BASIC' || currentTier === 'PREMIUM') && (
        <div className="mt-4 text-sm">
          <button
            onClick={() => setShowConfirmDowngrade(true)}
            className="text-gray-600 hover:text-gray-800 underline"
          >
            Downgrade Subscription
          </button>
        </div>
      )}

      {/* Render dialogs */}
      {renderUpgradeOptions()}
      {renderDowngradeConfirmation()}
    </div>
  );
}
