'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Dialog } from '@headlessui/react';
import UpgradeDialog from './UpgradeDialog';
import { subscriptionLimits } from '@/config/subscription-limits';
import { formatNumber } from '@/lib/utils';

interface SubscriptionProps {
  currentTier: 'FREE' | 'BASIC' | 'PREMIUM';
  isActive: boolean;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  onPurchaseOverage: () => void;
  onPurchaseTokens: () => void;
  monthlyTokensUsed: number;
  totalAvailableTokens: number;
  currentMonthlyQuota: number;
}

export default function SubscriptionManager({ 
  currentTier, 
  isActive,
  stripeCustomerId,
  stripeSubscriptionId,
  onPurchaseOverage,
  onPurchaseTokens,
  monthlyTokensUsed,
  totalAvailableTokens,
  currentMonthlyQuota
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
      // If user has an existing subscription, cancel it first
      if (stripeSubscriptionId && isActive) {
        await fetch('/api/subscription/cancel', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ subscriptionId: stripeSubscriptionId })
        });
      }

      // Create new subscription checkout
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
      // Cancel current subscription in Stripe
      if (stripeSubscriptionId && isActive) {
        const response = await fetch('/api/subscription/cancel', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            subscriptionId: stripeSubscriptionId,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to cancel current subscription');
        }
      }

      // If downgrading to BASIC, create new subscription
      if (tier === 'BASIC') {
        const checkoutResponse = await fetch('/api/subscription/create-checkout-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tier: 'BASIC' })
        });

        const data = await checkoutResponse.json();
        if (data.url) {
          router.push(data.url);
          return;
        }
      }

      // For FREE tier, just update the database
      const response = await fetch('/api/subscription/downgrade', {
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

      router.refresh();
    } catch (err) {
      console.error('Error downgrading subscription:', err);
      setError('Failed to downgrade subscription. Please try again.');
    } finally {
      setLoading(false);
      setShowDowngradeConfirm(false);
    }
  };

  return (
    <>
      <div className="bg-white border rounded-lg p-6">
        {/* Plan Status */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-semibold mb-1">{currentTier} Plan</h3>
            <p className="text-gray-600">
              Status: {isActive ? 'Active' : 'Inactive'}
            </p>
          </div>
          <div className="flex gap-4">
            {(currentTier === 'FREE' || currentTier === 'BASIC') && (
              <button
                onClick={() => setShowUpgradeDialog(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                {currentTier === 'FREE' ? 'Upgrade Plan' : 'Upgrade to Premium'}
              </button>
            )}
            {currentTier === 'PREMIUM' && (
              <button
                onClick={onPurchaseTokens}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
              >
                Purchase Additional Tokens
              </button>
            )}
          </div>
        </div>

        {/* Usage Display */}
        <div className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Token Usage */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="mb-2">
                <p className="text-sm text-gray-600">Monthly Token Usage</p>
                <p className="text-2xl font-semibold">
                  {formatNumber(monthlyTokensUsed)} / {formatNumber(totalAvailableTokens)}
                </p>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className={`h-2.5 rounded-full ${monthlyTokensUsed >= totalAvailableTokens * 0.9 ? 'bg-red-600' : 'bg-blue-600'}`}
                  style={{ width: `${Math.min((monthlyTokensUsed / totalAvailableTokens) * 100, 100)}%` }}
                ></div>
              </div>
            </div>

            {/* Rate Limits */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">Current Limits</p>
              <ul className="text-sm space-y-1">
                <li className="flex justify-between">
                  <span>Per Request:</span>
                  <span className="font-medium">{formatNumber(subscriptionLimits[currentTier].maxTokensPerRequest)} tokens</span>
                </li>
                <li className="flex justify-between">
                  <span>Rate Limit:</span>
                  <span className="font-medium">{subscriptionLimits[currentTier].requestsPerMinute}/min</span>
                </li>
                <li className="flex justify-between">
                  <span>Total Available:</span>
                  <span className="font-medium">{formatNumber(totalAvailableTokens)} tokens</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {error && (
          <div className="text-red-600 mb-4">{error}</div>
        )}

        {/* Downgrade Option */}
        {(currentTier === 'BASIC' || currentTier === 'PREMIUM') && (
          <div className="mt-4 pt-4 border-t">
            <button
              onClick={() => {
                setTargetTier(currentTier === 'PREMIUM' ? 'BASIC' : 'FREE');
                setShowDowngradeConfirm(true);
              }}
              className="text-gray-600 hover:text-gray-800 underline"
            >
              Downgrade Plan
            </button>
          </div>
        )}
      </div>

      {/* Upgrade Dialog */}
      <UpgradeDialog
        isOpen={showUpgradeDialog}
        onClose={() => setShowUpgradeDialog(false)}
        onUpgrade={handleUpgrade}
        currentTier={currentTier}
      />

      {/* Downgrade Confirmation Dialog */}
      <Dialog
        open={showDowngradeConfirm}
        onClose={() => setShowDowngradeConfirm(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="mx-auto max-w-md bg-white rounded-xl shadow-lg p-6">
            <Dialog.Title className="text-xl font-semibold mb-4">
              Confirm Downgrade
            </Dialog.Title>
            
            <p className="text-gray-600 mb-6">
              Are you sure you want to downgrade to the {targetTier} plan? This will:
              <ul className="list-disc ml-6 mt-2">
                <li>Cancel your current subscription</li>
                <li>Reduce your monthly token quota to {formatNumber(subscriptionLimits[targetTier || 'FREE'].monthlyTokens)}</li>
                <li>Lower your rate limits</li>
                {currentTier === 'PREMIUM' && targetTier === 'FREE' && (
                  <li>Remove ability to purchase additional tokens</li>
                )}
              </ul>
            </p>

            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowDowngradeConfirm(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={() => targetTier && handleDowngrade(targetTier)}
                disabled={loading}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
              >
                {loading ? 'Processing...' : 'Confirm Downgrade'}
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </>
  );
}
