'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { PlusIcon, KeyIcon, TrashIcon } from '@heroicons/react/24/outline';

interface APIKey {
  id: string;
  key: string;
  createdAt: string;
  isInUse: boolean;
  currentSession: string | null;
  lastUsed: string | null;
  updatedAt: string;
  totalUsage: number;
}

interface Pagination {
  total: number;
  pages: number;
  currentPage: number;
  perPage: number;
}

interface APIKeyManagementProps {
  initialPage?: number;
}

export default function APIKeyManagement({ initialPage = 1 }: APIKeyManagementProps) {
  const [keys, setKeys] = useState<APIKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [keyInput, setKeyInput] = useState('');
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    pages: 1,
    currentPage: initialPage,
    perPage: 10
  });
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [search, setSearch] = useState('');

  const fetchKeys = async (page = pagination.currentPage) => {
    try {
      setLoading(true);
      setError(null);
      
      const searchParams = new URLSearchParams({
        page: page.toString(),
        limit: pagination.perPage.toString(),
        sortBy,
        sortOrder,
        ...(search && { search })
      });

      const response = await fetch(`/api/admin/api-keys?${searchParams}`);
      if (!response.ok) {
        throw new Error('Failed to fetch API keys');
      }

      const data = await response.json();
      if (!data || !Array.isArray(data.keys)) {
        throw new Error('Invalid response format');
      }

      setKeys(data.keys);
      setPagination(prev => ({
        ...prev,
        total: data.total || 0,
        pages: Math.ceil((data.total || 0) / pagination.perPage),
        currentPage: page
      }));
    } catch (err) {
      console.error('Error fetching keys:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch API keys');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKeys();
  }, [sortBy, sortOrder, search]);

  const handleAddKey = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/api-keys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ key: keyInput }),
      });

      if (!response.ok) {
        throw new Error('Failed to add API key');
      }

      await fetchKeys(pagination.currentPage); // Refresh the current page
      setKeyInput('');
      toast.success('API key added successfully');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to add API key';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteKey = async (keyId: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/api-keys?key=${keyId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete API key');
      }

      await fetchKeys(pagination.currentPage); // Refresh the current page
      toast.success('API key deleted successfully');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete API key';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  if (loading && keys.length === 0) {
    return <div className="text-center py-4">Loading...</div>;
  }

  if (error && keys.length === 0) {
    return <div className="text-center text-red-600 py-4">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">API Keys</h3>
        <button
          onClick={() => setKeyInput('')}
          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <PlusIcon className="h-4 w-4 mr-1" />
          Add Key
        </button>
      </div>

      {keyInput !== '' && (
        <div className="bg-gray-50 p-4 rounded-md space-y-4">
          <div>
            <label htmlFor="keyInput" className="block text-sm font-medium text-gray-700">
              API Key
            </label>
            <input
              type="text"
              id="keyInput"
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              placeholder="Enter your API key"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setKeyInput('')}
              className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleAddKey}
              disabled={!keyInput.trim()}
              className="px-3 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
              Add Key
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-col">
        <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
            <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Key ID
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Usage
                    </th>
                    <th scope="col" className="relative px-6 py-3">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {keys.map((key) => (
                    <tr key={key.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        <div className="flex items-center">
                          <KeyIcon className="h-5 w-5 text-gray-400 mr-2" />
                          <span>{key.id}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(key.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          key.isInUse ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {key.isInUse ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {key.totalUsage} requests
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleDeleteKey(key.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <TrashIcon className="h-5 w-5" />
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

      {pagination.pages > 1 && (
        <div className="flex justify-between items-center">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => fetchKeys(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => fetchKeys(pagination.currentPage + 1)}
              disabled={pagination.currentPage === pagination.pages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing{' '}
                <span className="font-medium">
                  {(pagination.currentPage - 1) * pagination.perPage + 1}
                </span>{' '}
                to{' '}
                <span className="font-medium">
                  {Math.min(pagination.currentPage * pagination.perPage, pagination.total)}
                </span>{' '}
                of <span className="font-medium">{pagination.total}</span> results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => fetchKeys(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => fetchKeys(page)}
                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                      page === pagination.currentPage
                        ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => fetchKeys(pagination.currentPage + 1)}
                  disabled={pagination.currentPage === pagination.pages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
