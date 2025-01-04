'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface KeyStatus {
  key: string;
  isInUse: boolean;
  currentSession?: string;
  lastUsed?: string;
}

export default function AdminKeysPage() {
  const [keys, setKeys] = useState<KeyStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [newKey, setNewKey] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  useEffect(() => {
    fetchKeys();
  }, []);

  const fetchKeys = async () => {
    try {
      const response = await fetch('/api/admin/groq-keys');
      if (!response.ok) {
        throw new Error('Failed to fetch keys');
      }
      const data = await response.json();
      setKeys(data.keys);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch keys');
    } finally {
      setLoading(false);
    }
  };

  const addKey = async () => {
    try {
      setIsAdding(true);
      setError(null);
      setSuccess(null);

      const response = await fetch('/api/admin/groq-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: newKey })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to add key');
      }

      setSuccess('Key added successfully');
      setNewKey('');
      fetchKeys();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add key');
    } finally {
      setIsAdding(false);
    }
  };

  const removeKey = async (key: string) => {
    try {
      setIsRemoving(true);
      setError(null);
      setSuccess(null);

      const response = await fetch('/api/admin/groq-keys', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to remove key');
      }

      setSuccess('Key removed successfully');
      setSelectedKey(null);
      fetchKeys();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove key');
    } finally {
      setIsRemoving(false);
    }
  };

  // Mask the API key, showing only first 4 and last 4 characters
  const maskKey = (key: string) => {
    if (key.length <= 8) return '****';
    return `${key.slice(0, 4)}...${key.slice(-4)}`;
  };

  return (
    <>
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="border-b border-gray-200 pb-5 mb-6">
              <h1 className="text-2xl font-semibold text-gray-900">Groq API Key Management</h1>
              <p className="mt-2 text-sm text-gray-500">
                Monitor and manage Groq API keys. Keys are stored in the GROQ_API_KEYS environment variable.
              </p>
            </div>

            {/* Add New Key Form */}
            <div className="bg-white shadow sm:rounded-lg mb-6">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium leading-6 text-gray-900">Add New API Key</h3>
                <div className="mt-2 max-w-xl text-sm text-gray-500">
                  <p>Enter a new Groq API key to add it to the pool.</p>
                </div>
                <form onSubmit={(e) => { e.preventDefault(); addKey(); }} className="mt-5 sm:flex sm:items-center">
                  <div className="w-full sm:max-w-xs">
                    <label htmlFor="newKey" className="sr-only">New API Key</label>
                    <input
                      type="text"
                      name="newKey"
                      id="newKey"
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      placeholder="Enter API key"
                      value={newKey}
                      onChange={(e) => setNewKey(e.target.value)}
                      disabled={isAdding}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={!newKey || isAdding}
                    className="mt-3 inline-flex w-full items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                  >
                    {isAdding ? 'Adding...' : 'Add Key'}
                  </button>
                </form>
              </div>
            </div>

            {error && (
              <div className="rounded-md bg-red-50 p-4 mb-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">{error}</h3>
                  </div>
                </div>
              </div>
            )}

            {success && (
              <div className="rounded-md bg-green-50 p-4 mb-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-green-800">{success}</h3>
                  </div>
                </div>
              </div>
            )}

            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              </div>
            ) : (
              <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                  {keys.map((key, index) => (
                    <li key={index} className="px-6 py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {maskKey(key.key)}
                            </p>
                            <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              key.isInUse ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {key.isInUse ? 'In Use' : 'Available'}
                            </span>
                          </div>
                          {key.currentSession && (
                            <p className="mt-1 text-sm text-gray-500">
                              Session: {key.currentSession}
                            </p>
                          )}
                          {key.lastUsed && (
                            <p className="mt-1 text-sm text-gray-500">
                              Last used: {new Date(key.lastUsed).toLocaleString()}
                            </p>
                          )}
                        </div>
                        {!key.isInUse && (
                          <button
                            onClick={() => {
                              setSelectedKey(key.key);
                              removeKey(key.key);
                            }}
                            disabled={isRemoving && selectedKey === key.key}
                            className="ml-4 inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                          >
                            {isRemoving && selectedKey === key.key ? 'Removing...' : 'Remove'}
                          </button>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-6 bg-gray-50 p-4 rounded-md border border-gray-200">
              <h3 className="text-sm font-medium text-gray-900">Note</h3>
              <p className="mt-1 text-sm text-gray-500">
                Keys are stored in the GROQ_API_KEYS environment variable. Adding or removing keys will update both the environment variable and the .env file.
                Keys that are currently in use cannot be removed.
              </p>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
