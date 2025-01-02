'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface ApiKeyStats {
  total: number;
  inUse: number;
  available: number;
}

interface ApiKey {
  key: string;
  isInUse: boolean;
  currentSession: string | null;
  lastUsed: string | null;
  totalUses: number;
}

export default function AdminApiKeysPage() {
  const [stats, setStats] = useState<ApiKeyStats | null>(null);
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newKey, setNewKey] = useState('');
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!session?.user?.isAdmin) {
      router.push('/');
      return;
    }
    fetchData();
  }, [session]);

  const fetchData = async () => {
    try {
      const [statsRes, keysRes] = await Promise.all([
        fetch('/api/admin/api-keys/stats'),
        fetch('/api/admin/api-keys'),
      ]);

      if (!statsRes.ok || !keysRes.ok) {
        throw new Error('Failed to fetch API key data');
      }

      const [statsData, keysData] = await Promise.all([
        statsRes.json(),
        keysRes.json(),
      ]);

      setStats(statsData);
      setKeys(keysData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddKey = async () => {
    if (!newKey.trim()) {
      setError('Please enter a valid API key');
      return;
    }

    try {
      const response = await fetch('/api/admin/api-keys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ key: newKey }),
      });

      if (!response.ok) {
        throw new Error('Failed to add API key');
      }

      setNewKey('');
      await fetchData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleRemoveKey = async (key: string) => {
    try {
      const response = await fetch(`/api/admin/api-keys?key=${encodeURIComponent(key)}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to remove API key');
      }

      await fetchData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleRefreshPool = async () => {
    try {
      const response = await fetch('/api/admin/api-keys/refresh', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to refresh API key pool');
      }

      await fetchData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold mb-8">Loading...</h1>
        </div>
      </div>
    );
  }

  if (!session?.user?.isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">API Key Management</h1>
          <button
            onClick={handleRefreshPool}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Refresh Pool
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-2">Total Keys</h3>
              <p className="text-3xl font-bold">{stats.total}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-2">In Use</h3>
              <p className="text-3xl font-bold">{stats.inUse}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-2">Available</h3>
              <p className="text-3xl font-bold">{stats.available}</p>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow mb-8">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Add New API Key</h2>
            <div className="flex gap-4">
              <input
                type="text"
                value={newKey}
                onChange={(e) => setNewKey(e.target.value)}
                placeholder="Enter API key"
                className="flex-1 px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleAddKey}
                className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Add Key
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">API Keys</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Key
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Current Session
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Used
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Uses
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {keys.map((key) => (
                    <tr key={key.key}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {key.key}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {key.isInUse ? (
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                            In Use
                          </span>
                        ) : (
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                            Available
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {key.currentSession || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {key.lastUsed ? new Date(key.lastUsed).toLocaleString() : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {key.totalUses}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button
                          onClick={() => handleRemoveKey(key.key)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Remove
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
    </div>
  );
}
