'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import SubscriptionManager from '@/components/dashboard/SubscriptionManager';
import OveragePurchaseDialog from '@/components/dashboard/OveragePurchaseDialog';
import TokenPurchaseButton from '@/components/dashboard/TokenPurchaseButton';
import { useSession } from 'next-auth/react';

interface UsageStats {
  totalTokens: number;
  monthlyLimit: number;
  tokenLimit: number;
  requestsToday: number;
  costToday: number;
}

interface UserSubscription {
  tier: 'FREE' | 'BASIC' | 'PREMIUM';
  isActive: boolean;
  endDate?: string;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [usage, setUsage] = useState<UsageStats | null>(null);
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [showOverageDialog, setShowOverageDialog] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Fetch usage statistics
        const usageRes = await fetch('/api/dashboard/usage');
        const usageData = await usageRes.json();
        
        // Fetch subscription status
        const subRes = await fetch('/api/dashboard/subscription');
        const subData = await subRes.json();

        setUsage(usageData);
        setSubscription(subData);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (session?.user) {
      fetchDashboardData();
    }
  }, [session]);

  if (loading || !usage || !subscription) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Usage Statistics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-medium text-gray-500">Total Tokens Used</h3>
            <p className="mt-1 text-2xl font-semibold text-gray-900">{usage.totalTokens.toLocaleString()}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-medium text-gray-500">Monthly Limit</h3>
            <p className="mt-1 text-2xl font-semibold text-gray-900">{usage.monthlyLimit.toLocaleString()}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-medium text-gray-500">Requests Today</h3>
            <p className="mt-1 text-2xl font-semibold text-gray-900">{usage.requestsToday}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-medium text-gray-500">Cost Today</h3>
            <p className="mt-1 text-2xl font-semibold text-gray-900">${usage.costToday.toFixed(2)}</p>
          </div>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Subscription</h2>
          {subscription.tier === 'PREMIUM' && (
            <TokenPurchaseButton onPurchase={() => setShowOverageDialog(true)} />
          )}
        </div>
        <SubscriptionManager subscription={subscription} />
      </div>

      <OveragePurchaseDialog
        isOpen={showOverageDialog}
        onClose={() => setShowOverageDialog(false)}
        onPurchase={async () => {
          try {
            const response = await fetch('/api/billing/purchase-overage', {
              method: 'POST',
            });
            if (!response.ok) throw new Error('Failed to create checkout session');
            const { url } = await response.json();
            window.location.href = url;
          } catch (error) {
            console.error('Error purchasing overage tokens:', error);
          }
        }}
      />
    </div>
  );
}
