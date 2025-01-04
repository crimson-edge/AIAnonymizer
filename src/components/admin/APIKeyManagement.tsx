import { useState, useEffect } from 'react';
import { PlusIcon, KeyIcon, TrashIcon } from '@heroicons/react/24/outline';

interface APIKey {
  id: string;
  key: string;
  name: string;
  createdAt: string;
  lastUsed: string | null;
  isActive: boolean;
}

interface APIKeyManagementProps {
  userId: string;
}

export default function APIKeyManagement({ userId }: APIKeyManagementProps) {
  const [loading, setLoading] = useState(false);
  const [keys, setKeys] = useState<APIKey[]>([]);
  const [error, setError] = useState('');
  const [isAddingKey, setIsAddingKey] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');

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
      setError('');
    } catch (err) {
      setError('Failed to load API keys');
      console.error('Error fetching user keys:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddKey = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/users/${userId}/keys`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newKeyName || 'API Key' }),
      });

      if (!response.ok) {
        throw new Error('Failed to create API key');
      }

      const newKey = await response.json();
      setKeys([newKey, ...keys]);
      setIsAddingKey(false);
      setNewKeyName('');
      setError('');
    } catch (err) {
      setError('Failed to create API key');
      console.error('Error creating API key:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteKey = async (keyId: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/users/${userId}/keys`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ keyId }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete API key');
      }

      setKeys(keys.filter(k => k.id !== keyId));
      setError('');
    } catch (err) {
      setError('Failed to delete API key');
      console.error('Error deleting API key:', err);
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-md">
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  if (loading && !keys.length) {
    return (
      <div className="animate-pulse">
        <div className="h-10 bg-gray-200 rounded w-full mb-4"></div>
        <div className="h-10 bg-gray-200 rounded w-3/4"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">API Keys</h3>
        <button
          onClick={() => setIsAddingKey(true)}
          className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          New API Key
        </button>
      </div>

      {isAddingKey && (
        <div className="bg-gray-50 p-4 rounded-md space-y-4">
          <div>
            <label htmlFor="keyName" className="block text-sm font-medium text-gray-700">
              Key Name
            </label>
            <div className="mt-1 flex rounded-md shadow-sm">
              <input
                type="text"
                name="keyName"
                id="keyName"
                className="flex-1 min-w-0 block w-full px-3 py-2 rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="Enter key name"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
              />
            </div>
          </div>
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setIsAddingKey(false)}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleAddKey}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Create Key
            </button>
          </div>
        </div>
      )}

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {keys.map((key) => (
            <li key={key.id} className="px-4 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <KeyIcon className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{key.name}</p>
                    <p className="text-sm text-gray-500">{key.key}</p>
                    <p className="text-xs text-gray-400">
                      Created {new Date(key.createdAt).toLocaleDateString()}
                      {key.lastUsed && ` • Last used ${new Date(key.lastUsed).toLocaleDateString()}`}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteKey(key.id)}
                  className="inline-flex items-center p-1.5 border border-transparent rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-500"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>
            </li>
          ))}
          {!keys.length && !loading && (
            <li className="px-4 py-6 text-center text-sm text-gray-500">
              No API keys found
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
