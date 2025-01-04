'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import UpgradeDialog from './UpgradeDialog';

interface SubscriptionProps {
  currentTier: 'FREE' | 'BASIC' | 'PREMIUM';
  isActive: boolean;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  onPurchaseOverage: () => void;
  onPurchaseTokens: () => void;
}

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
  const [showDowngradeConfirm, setShowDowngradeConfirm] = useState(false);
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const [targetTier, setTargetTier] = useState<'FREE' | 'BASIC' | null>(null);

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
      setShowUpgradeDialog(false);
    }
  };

  const handleDowngrade = async (tier: 'FREE' | 'BASIC') => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/billing/downgrade', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tier,
          stripeSubscriptionId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to downgrade subscription');
      }

      // Refresh the page to show updated subscription
      router.refresh();
    } catch (err) {
      console.error('Error downgrading subscription:', err);
      setError('Failed to downgrade subscription. Please try again.');
    } finally {
      setLoading(false);
      setShowDowngradeConfirm(false);
    }
  };

  // Show upgrade banner for FREE tier
  if (currentTier === 'FREE') {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">Upgrade Your Plan</h3>
        <p className="text-blue-700 mb-4">
          Upgrade to unlock more features and higher usage limits.
        </p>
        <button
          onClick={() => setShowUpgradeDialog(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          View Plans
        </button>
        <UpgradeDialog
          isOpen={showUpgradeDialog}
          onClose={() => setShowUpgradeDialog(false)}
          onUpgrade={handleUpgrade}
        />
      </div>
    );
  }

  return (
    <>
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
                onClick={() => setShowUpgradeDialog(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                View Premium Plan
              </button>
            )}
            {currentTier === 'PREMIUM' && (
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
        {(currentTier === 'BASIC' || currentTier === 'PREMIUM') && (
          <div className="mt-4 border-t pt-4">
            <p className="text-sm text-gray-600">
              Need to change your plan?{' '}
              <button
                onClick={() => {
                  setTargetTier(currentTier === 'PREMIUM' ? 'BASIC' : 'FREE');
                  setShowDowngradeConfirm(true);
                }}
                className="text-blue-600 hover:text-blue-800 underline"
              >
                Downgrade subscription
              </button>
            </p>
          </div>
        )}
      </div>

      {/* Upgrade Dialog */}
      <UpgradeDialog
        isOpen={showUpgradeDialog}
        onClose={() => setShowUpgradeDialog(false)}
        onUpgrade={handleUpgrade}
      />

      {/* Downgrade Confirmation Dialog */}
      {showDowngradeConfirm && targetTier && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Confirm Downgrade</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to downgrade to the {targetTier} plan? This will take effect at the end of your current billing period.
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowDowngradeConfirm(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDowngrade(targetTier)}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Processing...' : 'Confirm Downgrade'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
