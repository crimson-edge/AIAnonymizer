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

      {/* Usage Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Usage</h2>
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>{usage.used.toLocaleString()} tokens used</span>
            <span>{usage.total.toLocaleString()} tokens total</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className={`h-2.5 rounded-full ${
                isOverLimit ? 'bg-red-600' : 'bg-blue-600'
              }`}
              style={{ width: `${Math.min(usagePercentage, 100)}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Subscription Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Subscription</h2>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-lg font-medium">{currentTier} Plan</p>
              <p className="text-sm text-gray-500">
                {subscriptionData?.isActive ? 'Active' : 'Inactive'}
              </p>
            </div>
            {currentTier === 'PREMIUM' && (
              <button
                onClick={() => setShowTokenDialog(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Purchase Tokens
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Token Purchase Dialog */}
      <TokenPurchaseDialog
        isOpen={showTokenDialog}
        onClose={() => setShowTokenDialog(false)}
        onPurchase={handleTokenPurchase}
      />
    </div>
  );
}
