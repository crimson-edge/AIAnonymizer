'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

interface APIKeyManagementProps {
  userId: string;
}

interface UserKey {
  key: string;
  isInUse: boolean;
  lastUsed?: Date | null;
}

export default function APIKeyManagement({ userId }: APIKeyManagementProps) {
  const [loading, setLoading] = useState(false);
  const [keys, setKeys] = useState<UserKey[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUserKeys();
  }, [userId]);

  const fetchUserKeys = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/users/${userId}/keys`);
      if (!response.ok) {
        throw new Error('Failed to fetch user keys');
      }
      const data = await response.json();
      setKeys(data);
    } catch (err) {
      setError('Failed to load API keys');
      console.error('Error fetching user keys:', err);
    } finally {
      setLoading(false);
    }
  };

  const addKey = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/users/${userId}/keys`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error('Failed to add key');
      }

      await fetchUserKeys();
      toast.success('API key added successfully');
    } catch (err) {
      console.error('Error adding key:', err);
      toast.error('Failed to add API key');
    } finally {
      setLoading(false);
    }
  };

  const removeKey = async (key: string) => {
    if (!confirm('Are you sure you want to remove this API key?')) {
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/admin/users/${userId}/keys/${encodeURIComponent(key)}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to remove key');
      }

      await fetchUserKeys();
      toast.success('API key removed successfully');
    } catch (err) {
      console.error('Error removing key:', err);
      toast.error('Failed to remove API key');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-600">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">API Keys</h3>
        <button
          onClick={addKey}
          disabled={loading}
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50"
        >
          Add New Key
        </button>
      </div>

      {keys.length === 0 ? (
        <p className="text-gray-500">No API keys found.</p>
      ) : (
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
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {keys.map((key, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-mono">
                      {key.key.slice(0, 8)}...{key.key.slice(-8)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      key.isInUse ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {key.isInUse ? 'In Use' : 'Available'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {key.lastUsed ? new Date(key.lastUsed).toLocaleString() : 'Never'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => removeKey(key.key)}
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
      )}
    </div>
  );
}
