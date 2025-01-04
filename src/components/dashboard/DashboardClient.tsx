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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showOverageDialog, setShowOverageDialog] = useState(false);
  const [showTokenDialog, setShowTokenDialog] = useState(false);

  useEffect(() => {
    if (status === 'loading') return;
    
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/dashboard/data');
        if (!response.ok) {
          throw new Error('Failed to fetch dashboard data');
        }
        const data = await response.json();
        setUsage(data.usage);
        setSubscriptionData(data.subscription);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [status]);

  if (status === 'loading' || loading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
    </div>;
  }

  if (error) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="text-red-500">Error: {error}</div>
    </div>;
  }

  const usagePercentage = (usage.used / usage.total) * 100;
  const isOverLimit = usage.used > usage.total;

  const handleOveragePurchase = async () => {
    try {
      const response = await fetch('/api/billing/purchase-overage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to initiate overage purchase');
      }

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Error purchasing overage:', error);
      setError('Failed to initiate overage purchase');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      
      <div className="grid gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Usage</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600">Used: {usage.used.toLocaleString()}</p>
              <p className="text-gray-600">Total: {usage.total.toLocaleString()}</p>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className={`h-2.5 rounded-full ${
                  isOverLimit ? 'bg-red-500' : usagePercentage > 90 ? 'bg-yellow-500' : 'bg-blue-500'
                }`}
                style={{ width: `${Math.min(usagePercentage, 100)}%` }}
              ></div>
            </div>
          </div>
          {isOverLimit && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              You have exceeded your API usage limit. Please purchase additional capacity.
            </div>
          )}
          {usagePercentage > 90 && !isOverLimit && (
            <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
              You are approaching your API usage limit.
            </div>
          )}
          <div className="flex gap-4">
            <button
              onClick={() => setShowOverageDialog(true)}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Purchase Additional Capacity
            </button>
            <button
              onClick={() => setShowTokenDialog(true)}
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
            >
              Purchase Tokens
            </button>
          </div>
        </div>

        <SubscriptionManager
          subscription={subscriptionData}
          onPurchaseOverage={() => setShowOverageDialog(true)}
          onPurchaseTokens={() => setShowTokenDialog(true)}
        />
      </div>

      {showOverageDialog && (
        <OveragePurchaseDialog
          open={showOverageDialog}
          onClose={() => setShowOverageDialog(false)}
          onPurchase={handleOveragePurchase}
        />
      )}

      {showTokenDialog && (
        <TokenPurchaseDialog
          open={showTokenDialog}
          onClose={() => setShowTokenDialog(false)}
        />
      )}
    </div>
  );
}
