'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import SubscriptionManager from '@/components/dashboard/SubscriptionManager';
import OveragePurchaseDialog from '@/components/dashboard/OveragePurchaseDialog';
import TokenPurchaseDialog from '@/components/dashboard/TokenPurchaseDialog';
import { useSession } from 'next-auth/react';

interface UsageData {
  used: number;
  total: number;
}

interface SubscriptionData {
  tier: 'FREE' | 'BASIC' | 'PREMIUM';
  isActive: boolean;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  monthlyLimit?: number;
}

interface UsageDataExtended {
  monthlyTokensUsed: number;
  totalAvailableTokens: number;
  currentMonthlyQuota: number;
}

export default function DashboardClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      router.push('/auth/signin');
    },
  });

  const [usage, setUsage] = useState<UsageData>({ used: 0, total: 0 });
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData | null>(null);
  const [usageData, setUsageData] = useState<UsageDataExtended>({
    monthlyTokensUsed: 0,
    totalAvailableTokens: 0,
    currentMonthlyQuota: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showTokenDialog, setShowTokenDialog] = useState(false);

  useEffect(() => {
    if (status === 'loading') return;

    const fetchUsage = async () => {
      try {
        const res = await fetch('/api/dashboard/usage');
        if (!res.ok) throw new Error('Failed to fetch usage data');
        const data = await res.json();
        setUsageData({
          monthlyTokensUsed: data.monthlyTokensUsed,
          totalAvailableTokens: data.totalAvailableTokens,
          currentMonthlyQuota: data.currentMonthlyQuota
        });
        setUsage({
          used: data.monthlyTokensUsed,
          total: data.currentMonthlyQuota
        });
      } catch (err) {
        console.error('Error fetching usage:', err);
        setError('Failed to fetch usage data');
      }
    };

    const fetchSubscription = async () => {
      try {
        const res = await fetch('/api/dashboard/subscription');
        if (!res.ok) throw new Error('Failed to fetch subscription data');
        const data = await res.json();
        setSubscriptionData({
          tier: data.tier,
          isActive: data.isActive,
          stripeCustomerId: data.stripeCustomerId,
          stripeSubscriptionId: data.stripeSubscriptionId,
          monthlyLimit: data.monthlyLimit
        });
      } catch (err) {
        console.error('Error fetching subscription:', err);
        setError('Failed to fetch subscription data');
      }
    };

    Promise.all([fetchUsage(), fetchSubscription()])
      .finally(() => setLoading(false));
  }, [status]);

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  const usagePercentage = (usage.used / usage.total) * 100;
  const isOverLimit = usage.used > usage.total;
  const currentTier = subscriptionData?.tier || 'FREE';

  const handleTokenPurchase = async () => {
    try {
      const response = await fetch('/api/billing/purchase-tokens', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to initiate token purchase');
      }

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Error purchasing tokens:', error);
      setError('Failed to initiate token purchase');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

      {/* Subscription and Usage Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Subscription & Usage</h2>
        <SubscriptionManager
          currentTier={currentTier}
          isActive={subscriptionData?.isActive || false}
          stripeCustomerId={subscriptionData?.stripeCustomerId}
          stripeSubscriptionId={subscriptionData?.stripeSubscriptionId}
          onPurchaseOverage={() => setShowTokenDialog(true)}
          onPurchaseTokens={() => setShowTokenDialog(true)}
          monthlyTokensUsed={usageData.monthlyTokensUsed}
          totalAvailableTokens={usageData.totalAvailableTokens}
          currentMonthlyQuota={usageData.currentMonthlyQuota}
        />
      </div>

      {/* Token Purchase Dialog */}
      {showTokenDialog && (
        <TokenPurchaseDialog
          isOpen={showTokenDialog}
          onClose={() => setShowTokenDialog(false)}
          onPurchase={handleTokenPurchase}
        />
      )}
    </div>
  );
}
