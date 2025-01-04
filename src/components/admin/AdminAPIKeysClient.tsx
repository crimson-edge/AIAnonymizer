'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function AdminAPIKeysClient() {
  const { data: session } = useSession();
  const router = useRouter();
  const [apiKeys, setApiKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    if (session === null) {
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
  }, [session, router]);

  const refreshKey = async (keyId: string) => {
    try {
      const res = await fetch(`/api/admin/api-keys/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyId }),
      });

      if (!res.ok) {
        throw new Error('Failed to refresh API key');
      }

      const updatedKey = await res.json();
      setApiKeys(keys => keys.map(key => 
        key.id === keyId ? updatedKey : key
      ));
    } catch (err) {
      console.error('Error refreshing API key:', err);
      setError('Failed to refresh API key');
    }
  };

  if (!session) {
    return null;
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">API Key Management</h1>

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-700">Total Keys</h3>
            <p className="text-3xl font-bold text-blue-600">{stats.totalKeys}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-700">Active Keys</h3>
            <p className="text-3xl font-bold text-green-600">{stats.activeKeys}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-700">Total Usage</h3>
            <p className="text-3xl font-bold text-purple-600">{stats.totalUsage.toLocaleString()}</p>
          </div>
        </div>
      )}

      {/* API Keys Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Key ID
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Usage
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {apiKeys.map((key: any) => (
              <tr key={key.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-mono text-gray-900">{key.id}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{key.user.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    key.active
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {key.active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {key.usage.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(key.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => refreshKey(key.id)}
                    className="text-indigo-600 hover:text-indigo-900 mr-4"
                  >
                    Refresh
                  </button>
                  <button
                    onClick={() => {/* Handle revoke */}}
                    className="text-red-600 hover:text-red-900"
                  >
                    Revoke
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
