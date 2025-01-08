'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface Pagination {
  currentPage: number;
  perPage: number;
  total: number;
  pages: number;
}

interface APIKey {
  id: string;
  key: string;
  status: string;
  totalTokensUsed: number;
  lastUsed: string | null;
  createdAt: string;
}

export default function AdminAPIKeysClient() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [keys, setKeys] = useState<APIKey[]>([]);
  const [newKey, setNewKey] = useState('');
  const [isAddKeyModalOpen, setIsAddKeyModalOpen] = useState(false);
  const [pagination, setPagination] = useState<Pagination>({
    currentPage: 1,
    perPage: 10,
    total: 0,
    pages: 1
  });

  const fetchKeys = async (page = pagination.currentPage) => {
    setLoading(true);
    setError(null);
    try {
      const searchParams = new URLSearchParams({
        page: page.toString(),
        limit: pagination.perPage.toString()
      });

      const res = await fetch(`/api/admin/api-keys?${searchParams}`, {
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
      setKeys(data.keys);
      setPagination(prev => ({
        ...prev,
        total: data.total,
        pages: Math.ceil(data.total / prev.perPage)
      }));
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch keys');
    } finally {
      setLoading(false);
    }
  };

  const addKey = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!newKey.trim()) {
        setError('API key is required');
        return;
      }

      const res = await fetch('/api/admin/api-keys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ key: newKey.trim() }),
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to add key');
      }

      await fetchKeys();
      setIsAddKeyModalOpen(false);
      setNewKey('');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to add key');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user) {
      fetchKeys();
    }
  }, [session, pagination.currentPage]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">API Keys Management</h1>
        <button
          onClick={() => setIsAddKeyModalOpen(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Add New Key
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Key
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Tokens Used
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Used
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {keys.map((key) => (
              <tr key={key.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {key.key}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {key.status}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {key.totalTokensUsed.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {key.lastUsed ? new Date(key.lastUsed).toLocaleString() : 'Never'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-4 flex items-center justify-between">
        <div className="flex-1 flex justify-between sm:hidden">
          <button
            onClick={() => setPagination(prev => ({ ...prev, currentPage: Math.max(1, prev.currentPage - 1) }))}
            disabled={pagination.currentPage === 1}
            className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Previous
          </button>
          <button
            onClick={() => setPagination(prev => ({ ...prev, currentPage: Math.min(prev.pages, prev.currentPage + 1) }))}
            disabled={pagination.currentPage === pagination.pages}
            className="ml-3 relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Next
          </button>
        </div>
        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Showing page <span className="font-medium">{pagination.currentPage}</span> of{' '}
              <span className="font-medium">{pagination.pages}</span>
            </p>
          </div>
          <div>
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
              {[...Array(pagination.pages)].map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setPagination(prev => ({ ...prev, currentPage: idx + 1 }))}
                  className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                    pagination.currentPage === idx + 1
                      ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                      : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  {idx + 1}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* Add Key Modal */}
      {isAddKeyModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Add New API Key</h2>
            <input
              type="text"
              value={newKey}
              onChange={(e) => setNewKey(e.target.value)}
              placeholder="Enter API key"
              className="w-full p-2 border rounded mb-4"
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setIsAddKeyModalOpen(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={addKey}
                disabled={loading}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
              >
                {loading ? 'Adding...' : 'Add Key'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}