import { useState, useEffect } from 'react';

interface TokenManagementProps {
  userId: string;
  onSuccess?: () => void;
}

interface Usage {
  id: string;
  tokens: number;
  type: string;
  createdAt: string;
  cost: number;
}

interface TokenData {
  user: {
    email: string;
    subscription: {
      tier: string;
      tokenLimit: number;
      monthlyLimit: number;
    };
    monthlyUsage: number;
    usageHistory: Usage[];
  };
}

export default function TokenManagement({ userId, onSuccess }: TokenManagementProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [tokenData, setTokenData] = useState<TokenData | null>(null);
  const [tokenAmount, setTokenAmount] = useState('');
  const [showHistory, setShowHistory] = useState(false);

  const fetchTokenData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/tokens?userId=${userId}`);
      if (!res.ok) throw new Error('Failed to fetch token data');
      const data = await res.json();
      setTokenData(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTokenAction = async (action: 'add' | 'set' | 'reset') => {
    try {
      setLoading(true);
      setError('');

      const amount = action === 'reset' ? 0 : parseInt(tokenAmount);
      if (action !== 'reset' && isNaN(amount)) {
        throw new Error('Please enter a valid number');
      }

      const res = await fetch('/api/admin/tokens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, action, amount }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update tokens');
      }

      await fetchTokenData();
      setTokenAmount('');
      if (onSuccess) {
        onSuccess(); // Call the onSuccess callback to refresh parent
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch token data on mount
  useEffect(() => {
    fetchTokenData();
  }, [userId]);

  if (loading && !tokenData) {
    return (
      <div className="flex justify-center items-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!tokenData) {
    return (
      <div className="p-4 text-red-600">
        {error || 'Failed to load token data'}
      </div>
    );
  }

  const { user } = tokenData;
  const usagePercentage = (user.monthlyUsage / user.subscription.monthlyLimit) * 100;

  return (
    <div className="space-y-6">
      {/* Token Usage Overview */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Token Usage Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-gray-50 rounded-md">
            <p className="text-sm text-gray-500">Monthly Usage</p>
            <p className="text-2xl font-semibold">{user.monthlyUsage.toLocaleString()}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-md">
            <p className="text-sm text-gray-500">Monthly Limit</p>
            <p className="text-2xl font-semibold">{user.subscription.monthlyLimit.toLocaleString()}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-md">
            <p className="text-sm text-gray-500">Token Balance</p>
            <p className="text-2xl font-semibold">{user.subscription.tokenLimit.toLocaleString()}</p>
          </div>
        </div>

        {/* Usage Progress Bar */}
        <div className="mt-4">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Monthly Usage</span>
            <span>{usagePercentage.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className={`h-2.5 rounded-full ${
                usagePercentage > 90 ? 'bg-red-600' : usagePercentage > 75 ? 'bg-yellow-400' : 'bg-green-600'
              }`}
              style={{ width: `${Math.min(usagePercentage, 100)}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Token Management */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Token Management</h3>
        
        {error && (
          <div className="mb-4 p-4 text-red-700 bg-red-100 rounded-md">
            {error}
          </div>
        )}

        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <label htmlFor="tokenAmount" className="block text-sm font-medium text-gray-700">
              Token Amount
            </label>
            <input
              type="number"
              id="tokenAmount"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              value={tokenAmount}
              onChange={(e) => setTokenAmount(e.target.value)}
              placeholder="Enter amount"
            />
          </div>
          
          <div className="flex gap-2 items-end">
            <button
              onClick={() => handleTokenAction('add')}
              disabled={loading}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              Add Tokens
            </button>
            <button
              onClick={() => handleTokenAction('set')}
              disabled={loading}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              Set Limit
            </button>
            <button
              onClick={() => handleTokenAction('reset')}
              disabled={loading}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Usage History */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Usage History</h3>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="text-sm text-blue-600 hover:text-blue-500"
          >
            {showHistory ? 'Hide History' : 'Show History'}
          </button>
        </div>

        {showHistory && (
          <div className="mt-4">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tokens
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cost
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {user.usageHistory.map((usage) => (
                    <tr key={usage.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(usage.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {usage.type}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {usage.tokens.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ${usage.cost.toFixed(4)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
