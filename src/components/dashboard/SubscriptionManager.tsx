import { useRouter } from 'next/navigation';
import { Dialog } from '@headlessui/react';
import { useEffect, useState } from 'react';
import { SubscriptionTier } from '@prisma/client';
import { Button } from '@/components/ui/button';
import { subscriptionLimits } from '@/config/subscription-limits';
import { formatNumber } from '@/lib/utils';
import { loadStripe } from '@stripe/stripe-js';
import { useToast } from '@/components/ui/use-toast';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface SubscriptionManagerProps {
  currentTier: SubscriptionTier;
  monthlyUsage: number;
  totalTokens: number;
}

export default function SubscriptionManager({
  currentTier,
  monthlyUsage,
  totalTokens,
}: SubscriptionManagerProps) {
  const [showDowngradeConfirm, setShowDowngradeConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleDowngrade = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/subscription/downgrade', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tier: currentTier === 'PREMIUM' ? 'BASIC' : 'FREE'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to downgrade subscription');
      }

      const data = await response.json();
      const endDate = new Date(data.currentPeriodEnd).toLocaleDateString();
      
      toast({
        title: 'Subscription Update',
        description: `Your subscription will be downgraded to ${data.newTier} tier on ${endDate}. You'll continue to have access to your current features until then.`,
        variant: 'default',
      });

      setShowDowngradeConfirm(false);
      // Refresh the page to show updated subscription status
      window.location.reload();
    } catch (error) {
      console.error('Error downgrading subscription:', error);
      toast({
        title: 'Error',
        description: 'Failed to downgrade subscription. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">Subscription Status</h2>
      <div className="space-y-2 mb-6">
        <p>Current Plan: {currentTier}</p>
        <p>Status: ACTIVE</p>
        <p>Monthly Usage: {formatNumber(monthlyUsage)} / {formatNumber(subscriptionLimits[currentTier].monthlyTokens)} tokens</p>
        <p>Total Available Tokens: {formatNumber(totalTokens)}</p>
      </div>

      <div className="space-x-4">
        {currentTier !== 'FREE' && (
          <Button
            onClick={() => setShowDowngradeConfirm(true)}
            variant="outline"
          >
            Downgrade Plan
          </Button>
        )}
      </div>

      <Dialog
        open={showDowngradeConfirm}
        onClose={() => !loading && setShowDowngradeConfirm(false)}
        className="fixed inset-0 z-10 overflow-y-auto"
      >
        <div className="flex items-center justify-center min-h-screen">
          <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

          <div className="relative bg-white rounded-lg p-6 max-w-md mx-auto">
            <Dialog.Title className="text-lg font-medium mb-4">
              Confirm Downgrade
            </Dialog.Title>

            <p className="mb-4">
              Are you sure you want to downgrade to the {currentTier === 'PREMIUM' ? 'BASIC' : 'FREE'} plan? 
              This will take effect at the end of your current billing period.
            </p>

            <div className="flex justify-end space-x-4">
              <Button
                onClick={() => setShowDowngradeConfirm(false)}
                variant="outline"
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleDowngrade}
                variant="destructive"
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Yes, Downgrade'}
              </Button>
            </div>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
