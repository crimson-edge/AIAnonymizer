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

  // Show upgrade banner for FREE tier
  if (currentTier === 'FREE') {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">Upgrade Your Plan</h3>
        <p className="text-blue-700 mb-4">
          Upgrade to Basic or Premium to unlock more features and higher usage limits.
        </p>
        <div className="flex gap-4">
          <button
            onClick={() => handleUpgrade('BASIC')}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Upgrade to Basic
          </button>
          <button
            onClick={() => handleUpgrade('PREMIUM')}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
          >
            Upgrade to Premium
          </button>
        </div>
      </div>
    );
  }

  // Only show token purchase for Premium tier
  const showTokenPurchase = currentTier === 'PREMIUM';

  return (
    <div className="bg-white border rounded-lg p-6 mb-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-semibold mb-1">Current Plan: {currentTier}</h3>
          <p className="text-gray-600">
            Status: {isActive ? 'Active' : 'Inactive'}
          </p>
        </div>
        <div className="flex gap-4">
          {currentTier === 'BASIC' && (
            <button
              onClick={() => handleUpgrade('PREMIUM')}
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
            >
              Upgrade to Premium
            </button>
          )}
          {showTokenPurchase && (
            <button
              onClick={onPurchaseTokens}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Purchase Additional Tokens
            </button>
          )}
        </div>
      </div>
      {error && (
        <div className="text-red-600 mb-4">{error}</div>
      )}
    </div>
  );
}
