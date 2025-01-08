'use client';

import { useState, useEffect, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { useSession } from 'next-auth/react';

export default function AdminAPIKeysClient() {
  const { data: session } = useSession();
  const [apiResponse, setApiResponse] = useState<{ keys: any[]; total: number }>({ keys: [], total: 0 });
  const [isAddKeyModalOpen, setIsAddKeyModalOpen] = useState(false);
  const [newKey, setNewKey] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [addKeyError, setAddKeyError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/admin/api-keys', {
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
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users');
      if (!res.ok) {
        throw new Error('Failed to fetch users');
      }
      const data = await res.json();
      setUsers(data.users);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  useEffect(() => {
    if (session?.user) {
      fetchData();
      fetchUsers();
    }
  }, [session]);

  const addKey = async () => {
    try {
      setIsLoading(true);
      setAddKeyError('');
      
      if (!newKey.trim()) {
        setAddKeyError('API key is required');
        return;
      }

      if (!selectedUserId) {
        setAddKeyError('Please select a user');
        return;
      }

      const res = await fetch('/api/admin/api-keys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          key: newKey.trim(),
          userId: selectedUserId,
        }),
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to add key');
      }

      await fetchData();
      setIsAddKeyModalOpen(false);
      setNewKey('');
      setSelectedUserId('');
    } catch (error) {
      console.error('Error adding key:', error);
      setAddKeyError(error instanceof Error ? error.message : 'Failed to add key');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteKey = async (key: string) => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/admin/api-keys', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ key }),
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to delete key');
      }

      await fetchData();
    } catch (error) {
      console.error('Error deleting key:', error);
      alert('Failed to delete key');
    } finally {
      setIsLoading(false);
    }
  };

  const refreshData = async () => {
    await fetchData();
  };

  if (!session?.user) {
    return null;
  }

  return (
    <div className="p-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900">Total Keys</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">{apiResponse.total || 0}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900">Active Keys</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">{apiResponse.total || 0}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900">Total Usage</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">0</p>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-900">API Keys</h2>
          <button
            onClick={() => setIsAddKeyModalOpen(true)}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50"
          >
            Add New Key
          </button>
        </div>

        <div className="border-t border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">KEY</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">STATUS</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">USER</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">LAST USED</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">TOTAL USAGE</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {apiResponse.keys.map((key) => (
                <tr key={key.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {maskKey(key.key)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {key.isActive ? 'Available' : 'Revoked'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {key.user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(key.createdAt).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {key.totalUsage || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button
                      onClick={refreshData}
                      disabled={isLoading}
                      className="text-indigo-600 hover:text-indigo-900 mr-4 disabled:opacity-50"
                    >
                      Refresh
                    </button>
                    <button
                      onClick={() => deleteKey(key.key)}
                      disabled={isLoading}
                      className="text-red-600 hover:text-red-900 disabled:opacity-50"
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

      <Transition appear show={isAddKeyModalOpen} as={Fragment}>
        <Dialog as="div" className="fixed inset-0 z-10 overflow-y-auto" onClose={() => setIsAddKeyModalOpen(false)}>
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
              <div className="fixed inset-0 bg-black/30" />
            </Transition.Child>

            <span className="inline-block h-screen align-middle" aria-hidden="true">&#8203;</span>

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
                <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                  Add New API Key
                </Dialog.Title>
                <div className="mt-2">
                  <input
                    type="text"
                    value={newKey}
                    onChange={(e) => setNewKey(e.target.value)}
                    disabled={isLoading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 mb-4"
                    placeholder="Enter API key"
                  />
                  <select
                    value={selectedUserId}
                    onChange={(e) => setSelectedUserId(e.target.value)}
                    disabled={isLoading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">Select a user</option>
                    {users.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.email} ({user.name || 'No name'})
                      </option>
                    ))}
                  </select>
                  {addKeyError && (
                    <p className="mt-2 text-sm text-red-600">{addKeyError}</p>
                  )}
                </div>

                <div className="mt-4 flex justify-end space-x-2">
                  <button
                    type="button"
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50"
                    onClick={() => setIsAddKeyModalOpen(false)}
                    disabled={isLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50"
                    onClick={addKey}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Adding...' : 'Add Key'}
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

function maskKey(key: string) {
  if (key.length <= 16) return '********';
  return `${key.slice(0, 8)}...${key.slice(-8)}`;
}