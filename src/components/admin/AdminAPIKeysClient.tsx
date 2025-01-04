'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface APIKey {
  id: string;
  key: string;
  inUse: boolean;
  lastUsed?: string;
  totalUsage: number;
}

interface APIStats {
  totalKeys: number;
  activeKeys: number;
  totalUsage: number;
}

export default function AdminAPIKeysClient() {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();
  const [apiKeys, setApiKeys] = useState<APIKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState<APIStats | null>(null);

  useEffect(() => {
    if (sessionStatus === 'loading') return;
    
    if (!session) {
      router.push('/auth/signin');
      return;
    }

    const fetchData = async () => {
      try {
        const [keysRes, statsRes] = await Promise.all([
          fetch('/api/admin/api-keys'),
          fetch('/api/admin/api-keys/stats')
        ]);

        if (!keysRes.ok || !statsRes.ok) {
          throw new Error('Failed to fetch API keys data');
        }

        const [keysData, statsData] = await Promise.all([
          keysRes.json(),
          statsRes.json()
        ]);

        setApiKeys(keysData);
        setStats(statsData);
      } catch (err) {
        setError('Failed to load API keys data');
        console.error('API keys data fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [session, sessionStatus, router]);

  const refreshKey = async (keyId: string) => {
    try {
      const res = await fetch('/api/admin/api-keys/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyId })
      });

      if (!res.ok) {
        throw new Error('Failed to refresh key');
      }

      const data = await res.json();
      setApiKeys(keys => keys.map(k => k.id === keyId ? { ...k, key: data.key } : k));
    } catch (err) {
      console.error('Error refreshing key:', err);
      setError('Failed to refresh key');
    }
  };

  if (loading) {
    return (
      <div className="rounded-lg bg-white p-8 shadow-sm">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-3">
            <div className="h-5 bg-gray-200 rounded"></div>
            <div className="h-5 bg-gray-200 rounded"></div>
            <div className="h-5 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-white p-8 shadow-sm">
        <div className="text-red-600">
          <h3 className="text-lg font-semibold mb-2">Error Loading API Keys</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-sm font-medium text-gray-500">Total Keys</h3>
            <p className="mt-2 text-3xl font-semibold text-gray-900">{stats.totalKeys}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-sm font-medium text-gray-500">Active Keys</h3>
            <p className="mt-2 text-3xl font-semibold text-gray-900">{stats.activeKeys}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-sm font-medium text-gray-500">Total Usage</h3>
            <p className="mt-2 text-3xl font-semibold text-gray-900">{stats.totalUsage}</p>
          </div>
        </div>
      )}

      {/* API Keys Table */}
      <div className="bg-white shadow-sm rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h2 className="text-lg font-semibold mb-4">API Keys</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Key
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Used
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Usage
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {apiKeys.map((key) => (
                  <tr key={key.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-mono text-gray-900">{key.key}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        key.inUse ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {key.inUse ? 'In Use' : 'Available'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {key.lastUsed ? new Date(key.lastUsed).toLocaleString() : 'Never'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {key.totalUsage}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => refreshKey(key.id)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Refresh
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
