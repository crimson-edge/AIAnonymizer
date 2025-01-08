'use client';

import { useState, useEffect, useMemo, Fragment } from 'react';
import { useRouter } from 'next/navigation';
import { Dialog, Transition } from '@headlessui/react';
import { useSession } from 'next-auth/react';

interface APIKey {
  id: string;
  key: string;
  inUse: boolean;
  lastUsed: string;
  totalUsage: number;
  createdAt: string;
}

interface APIStats {
  totalKeys: number;
  activeKeys: number;
  inUseKeys: number;
}

export default function AdminAPIKeysClient() {
  const router = useRouter();
  const { data: session } = useSession();
  const [apiResponse, setApiResponse] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/admin/api-keys`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          cache: 'no-store'
        });

        if (!res.ok) {
          throw new Error('Failed to fetch');
        }

        const data = await res.json();
        setApiResponse(data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [session]);

  // Default data structure
  const defaultData = {
    keys: [],
    total: 0
  };

  // Transform API response to match our working data structure
  const keysData = useMemo(() => {
    // If we have API data, use it
    if (apiResponse?.keys) {
      return {
        keys: apiResponse.keys.map((k: any) => ({
          id: k.id || k.key || 'unknown',
          key: k.key || '',
          inUse: k.isInUse || false,
          lastUsed: k.lastUsed || new Date().toISOString(),
          totalUsage: k.totalUsage || 0,
          createdAt: k.createdAt || new Date().toISOString()
        })),
        total: apiResponse.total || apiResponse.keys.length || 0
      };
    }
    // Otherwise use default empty data
    return defaultData;
  }, [apiResponse]);

  // Calculate stats from keysData
  const statsData = useMemo(() => ({
    totalKeys: keysData?.total || 0,
    activeKeys: keysData?.keys?.length || 0,
    inUseKeys: keysData?.keys?.filter(k => k.inUse)?.length || 0
  }), [keysData]);

  const [isAddKeyModalOpen, setIsAddKeyModalOpen] = useState(false);
  const [newKey, setNewKey] = useState('');
  const [addKeyError, setAddKeyError] = useState('');

  const addKey = async () => {
    try {
      setAddKeyError('');
      if (!newKey.trim()) {
        setAddKeyError('API key is required');
        return;
      }

      const res = await fetch(`/api/admin/api-keys`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ key: newKey }),
        cache: 'no-store'
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to add key');
      }

      // Refresh the data
      const updatedRes = await fetch(`/api/admin/api-keys`, {
        cache: 'no-store'
      });
      const updatedData = await updatedRes.json();
      setApiResponse(updatedData);

      // Close modal and reset form
      setIsAddKeyModalOpen(false);
      setNewKey('');
    } catch (error) {
      console.error('Error adding key:', error);
      setAddKeyError(error instanceof Error ? error.message : 'Failed to add key');
    }
  };

  const deleteKey = async (key: string) => {
    try {
      const res = await fetch(`/api/admin/api-keys`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ key }),
        cache: 'no-store'
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to delete key');
      }

      // Refresh the data
      const updatedRes = await fetch(`/api/admin/api-keys`, {
        cache: 'no-store'
      });
      const updatedData = await updatedRes.json();
      setApiResponse(updatedData);
    } catch (error) {
      console.error('Error deleting key:', error);
      alert('Failed to delete key');
    }
  };

  const refreshKey = async () => {
    try {
      const res = await fetch(`/api/admin/api-keys`, {
        cache: 'no-store'
      });
      if (!res.ok) throw new Error('Failed to refresh');
      const data = await res.json();
      setApiResponse(data);
    } catch (error) {
      console.error('Error refreshing:', error);
      alert('Failed to refresh');
    }
  };

  const maskKey = (key: string) => {
    if (key.length <= 16) return '********';
    return `${key.slice(0, 8)}...${key.slice(-8)}`;
  };

  if (!session?.user) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-red-800">Not authenticated</h3>
        <p className="mt-1 text-sm text-gray-500">Please sign in to view API keys.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-sm font-medium text-gray-500">Total Keys</h3>
          <p className="mt-2 text-3xl font-semibold text-gray-900">{statsData.totalKeys}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-sm font-medium text-gray-500">Active Keys</h3>
          <p className="mt-2 text-3xl font-semibold text-gray-900">{statsData.activeKeys}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-sm font-medium text-gray-500">Total Usage</h3>
          <p className="mt-2 text-3xl font-semibold text-gray-900">
            {statsData.inUseKeys?.toLocaleString() || 0}
          </p>
        </div>
      </div>

      {/* API Keys Section */}
      <div className="bg-white shadow-sm rounded-lg">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-medium text-gray-900">API Keys</h2>
            <button
              onClick={() => setIsAddKeyModalOpen(true)}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
            >
              Add New Key
            </button>
          </div>

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
                {keysData.keys.map((key) => (
                  <tr key={key.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-mono text-gray-900">
                        {maskKey(key.key)}
                      </div>
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
                      {key.totalUsage?.toLocaleString() || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button
                        onClick={() => refreshKey()}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        Refresh
                      </button>
                      <button
                        onClick={() => deleteKey(key.key)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Key Modal */}
      <Transition appear show={isAddKeyModalOpen} as={Fragment}>
        <Dialog
          as="div"
          className="fixed inset-0 z-10 overflow-y-auto"
          onClose={() => setIsAddKeyModalOpen(false)}
        >
          <div className="min-h-screen px-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
            </Transition.Child>

            <span
              className="inline-block h-screen align-middle"
              aria-hidden="true"
            >
              &#8203;
            </span>

            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900"
                >
                  Add New API Key
                </Dialog.Title>
                <div className="mt-2">
                  <input
                    type="text"
                    value={newKey}
                    onChange={(e) => setNewKey(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Enter API key"
                  />
                  {addKeyError && (
                    <p className="mt-2 text-sm text-red-600">{addKeyError}</p>
                  )}
                </div>

                <div className="mt-4 flex justify-end space-x-2">
                  <button
                    type="button"
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                    onClick={() => setIsAddKeyModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
                    onClick={addKey}
                  >
                    Add Key
                  </button>
                </div>
              </div>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
}