'use client';

import { useState, useEffect, Fragment } from 'react';
import { useRouter } from 'next/navigation';
import { Dialog, Transition } from '@headlessui/react';

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

  // Use static data for now until we fix the API connection
  const keysData = {
    keys: [
      {
        id: '1',
        key: 'sk-mock-1',
        inUse: false,
        lastUsed: new Date().toISOString(),
        totalUsage: 100,
        createdAt: new Date().toISOString()
      }
    ],
    total: 1
  };

  const statsData = {
    totalKeys: 1,
    activeKeys: 1,
    inUseKeys: 0
  };

  // We'll add back API integration once the page renders properly
  console.log('Using static data for now');

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

      // Add API call to create new key
    } catch (err) {
      console.error('Error adding key:', err);
      setAddKeyError(err instanceof Error ? err.message : 'Failed to add key');
    }
  };

  const deleteKey = async (key: string) => {
    if (!confirm('Are you sure you want to delete this API key? This action cannot be undone.')) {
      return;
    }

    // Add API call to delete key
  };

  const refreshKey = async (keyId: string) => {
    // Add API call to refresh key
  };

  const maskKey = (key: string) => {
    if (key.length <= 16) return '********';
    return `${key.slice(0, 8)}...${key.slice(-8)}`;
  };

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

          {keysData.keys.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-gray-900">No API Keys Available</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by adding your first API key.</p>
            </div>
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
                          onClick={() => refreshKey(key.id)}
                          className="text-indigo-600 hover:text-indigo-900 mr-4"
                        >
                          Refresh
                        </button>
                        <button
                          onClick={() => deleteKey(key.id)}
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
          )}
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