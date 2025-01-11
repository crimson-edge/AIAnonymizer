'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Dialog } from '@headlessui/react';
import UpgradeDialog from './UpgradeDialog';
import { subscriptionLimits } from '@/config/subscription-limits';
import { formatNumber } from '@/lib/utils';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface SubscriptionProps {
  currentTier: 'FREE' | 'BASIC' | 'PREMIUM';
  isActive: boolean;
  status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'PENDING_PAYMENT' | 'SCHEDULED_DOWNGRADE';
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  onPurchaseOverage: () => void;
  onPurchaseTokens: () => void;
  monthlyTokensUsed: number;
  totalAvailableTokens: number;
  currentMonthlyQuota: number;
  currentPeriodEnd?: Date;
}

export default function SubscriptionManager({ 
  currentTier, 
  isActive,
  status = 'ACTIVE',
  stripeCustomerId,
  stripeSubscriptionId,
  onPurchaseOverage,
  onPurchaseTokens,
  monthlyTokensUsed,
  totalAvailableTokens,
  currentMonthlyQuota,
  currentPeriodEnd
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
      const priceId = tier === 'BASIC' 
        ? process.env.NEXT_PUBLIC_STRIPE_BASIC_PRICE_ID 
        : process.env.NEXT_PUBLIC_STRIPE_PREMIUM_PRICE_ID;

      if (!priceId) {
        throw new Error('Invalid price ID for selected tier');
      }

      console.log('Using price ID:', priceId);

      // Create new subscription checkout
      const response = await fetch('/api/stripe/create-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create checkout session');
      }

      const { sessionId } = await response.json();
      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error('Stripe not initialized');
      }

      const { error: stripeError } = await stripe.redirectToCheckout({ sessionId });
      if (stripeError) {
        throw stripeError;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start upgrade process');
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
      // If downgrading to BASIC, create new subscription
      if (tier === 'BASIC') {
        const priceId = process.env.NEXT_PUBLIC_STRIPE_BASIC_PRICE_ID;
        if (!priceId) {
          throw new Error('Invalid price ID for Basic tier');
        }

        console.log('Using price ID:', priceId);

        const response = await fetch('/api/stripe/create-subscription', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ priceId })
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to create checkout session');
        }

        const { sessionId } = await response.json();
        const stripe = await stripePromise;
        if (!stripe) {
          throw new Error('Stripe not initialized');
        }

        const { error: stripeError } = await stripe.redirectToCheckout({ sessionId });
        if (stripeError) {
          throw stripeError;
        }
      } else {
        // For FREE tier, just update the subscription in the database
        const response = await fetch('/api/subscription/downgrade', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tier: 'FREE' })
        });

        if (!response.ok) {
          throw new Error('Failed to downgrade subscription');
        }

        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process downgrade');
      console.error('Downgrade error:', err);
    } finally {
      setLoading(false);
      setShowDowngradeConfirm(false);
    }
  };

  const handleManageSubscription = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/stripe/customer-portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create portal session');
      }

      const { url } = await response.json();
      window.location.href = url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to open customer portal');
      console.error('Customer portal error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900">
            Subscription Status
          </h3>
          <div className="mt-2 max-w-xl text-sm text-gray-500">
            <p>Current Plan: {currentTier}</p>
            <p>Status: {status}</p>
            {status === 'SCHEDULED_DOWNGRADE' && currentPeriodEnd && (
              <p className="text-yellow-600">
                Plan will change at the end of current billing period ({new Date(currentPeriodEnd).toLocaleDateString()})
              </p>
            )}
            {status === 'SUSPENDED' && (
              <p className="text-red-600">
                Your subscription is suspended due to a failed payment. Please update your payment method.
              </p>
            )}
            <p>Monthly Usage: {formatNumber(monthlyTokensUsed)} / {formatNumber(currentMonthlyQuota)} tokens</p>
            <p>Total Available Tokens: {formatNumber(totalAvailableTokens)}</p>
          </div>
          <div className="mt-5 space-x-3">
            {stripeCustomerId && (
              <button
                type="button"
                onClick={handleManageSubscription}
                disabled={loading}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Manage Payment Method
              </button>
            )}
            
            <button
              type="button"
              onClick={() => setShowUpgradeDialog(true)}
              disabled={loading || currentTier === 'PREMIUM' || status === 'SCHEDULED_DOWNGRADE'}
              className={`inline-flex items-center justify-center px-4 py-2 border border-transparent font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:text-sm ${
                loading || currentTier === 'PREMIUM' || status === 'SCHEDULED_DOWNGRADE'
                  ? 'opacity-50 cursor-not-allowed'
                  : ''
              }`}
            >
              {loading ? 'Processing...' : 'Upgrade Plan'}
            </button>
            
            {currentTier !== 'FREE' && (
              <button
                type="button"
                onClick={() => {
                  setTargetTier(currentTier === 'PREMIUM' ? 'BASIC' : 'FREE');
                  setShowDowngradeConfirm(true);
                }}
                disabled={loading || status === 'SCHEDULED_DOWNGRADE'}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {status === 'SCHEDULED_DOWNGRADE' ? 'Downgrade Scheduled' : 'Downgrade Plan'}
              </button>
            )}
            
            {currentTier === 'PREMIUM' && (
              <button
                type="button"
                onClick={onPurchaseTokens}
                disabled={loading}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Purchase Additional Tokens
              </button>
            )}
          </div>
          {error && (
            <div className="mt-2 text-sm text-red-600">{error}</div>
          )}
        </div>
      </div>

      <UpgradeDialog
        isOpen={showUpgradeDialog}
        onClose={() => setShowUpgradeDialog(false)}
        onUpgrade={handleUpgrade}
        currentTier={currentTier}
      />

      <Dialog
        open={showDowngradeConfirm}
        onClose={() => setShowDowngradeConfirm(false)}
        className="fixed inset-0 z-10 overflow-y-auto"
      >
        <div className="flex items-center justify-center min-h-screen">
          <div className="fixed inset-0 bg-black opacity-30" />
          <div className="relative bg-white rounded max-w-sm mx-auto p-6">
            <Dialog.Title className="text-lg font-medium">
              Confirm Downgrade
            </Dialog.Title>
            <div className="mt-2">
              <p className="text-sm text-gray-500">
                Are you sure you want to downgrade to the {targetTier} plan? This will take effect at the end of your current billing period.
              </p>
            </div>
            <div className="mt-4 space-x-3">
              <button
                type="button"
                className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-red-500"
                onClick={() => targetTier && handleDowngrade(targetTier)}
              >
                Yes, Downgrade
              </button>
              <button
                type="button"
                className="inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
                onClick={() => setShowDowngradeConfirm(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
