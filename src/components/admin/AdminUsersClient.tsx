'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import TokenManagement from '@/components/admin/TokenManagement';
import APIKeyManagement from '@/components/admin/APIKeyManagement';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isAdmin: boolean;
  status: string;
  createdAt: string;
  subscription?: {
    tier: string;
    monthlyLimit: number;
    tokenLimit: number;
  };
  apiKeys?: {
    id: string;
    isActive: boolean;
  }[];
  usage?: {
    monthly: number;
    total: number;
  };
  activity?: {
    id: string;
    action: string;
    timestamp: string;
  }[];
}

interface PaginationData {
  total: number;
  pages: number;
  currentPage: number;
  perPage: number;
}

interface Filters {
  search: string;
  status: string;
  tier: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

interface TokenDialogState {
  isOpen: boolean;
  userId: string | null;
  userName: string;
}

export default function AdminUsersClient() {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState<PaginationData>({
    total: 0,
    pages: 1,
    currentPage: 1,
    perPage: 10
  });
  const [filters, setFilters] = useState<Filters>({
    search: '',
    status: '',
    tier: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });
  const [tokenDialog, setTokenDialog] = useState<TokenDialogState>({
    isOpen: false,
    userId: null,
    userName: ''
  });
  const [addTokensAmount, setAddTokensAmount] = useState<number>(0);

  const fetchUsers = async (page = 1) => {
    try {
      setLoading(true);
      const searchParams = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(filters.search && { search: filters.search }),
        ...(filters.status && { status: filters.status }),
        ...(filters.tier && { tier: filters.tier }),
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder
      });

      const res = await fetch(`/api/admin/users?${searchParams.toString()}`);
      if (!res.ok) {
        throw new Error('Failed to fetch users');
      }
      const data = await res.json();
      setUsers(data.users);
      setPagination(data.pagination);
      if (data.users.length > 0 && !selectedUserId) {
        setSelectedUserId(data.users[0].id);
      }
    } catch (err) {
      setError('Failed to load users');
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (sessionStatus === 'loading') return;
    
    if (!session) {
      router.push('/auth/signin');
      return;
    }

    fetchUsers();
  }, [session, sessionStatus, router, filters]);

  const handleSearch = (value: string) => {
    setFilters(prev => ({ ...prev, search: value }));
  };

  const handleStatusFilter = (value: string) => {
    setFilters(prev => ({ ...prev, status: value }));
  };

  const handleTierFilter = (value: string) => {
    setFilters(prev => ({ ...prev, tier: value }));
  };

  const handleSort = (field: string) => {
    setFilters(prev => ({
      ...prev,
      sortBy: field,
      sortOrder: prev.sortBy === field && prev.sortOrder === 'desc' ? 'asc' : 'desc'
    }));
  };

  const handleAddTokens = async () => {
    if (!tokenDialog.userId || addTokensAmount <= 0) {
      setError('Please enter a valid token amount');
      return;
    }

    try {
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: tokenDialog.userId,
          addTokens: addTokensAmount
        })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to add tokens');
      }

      setTokenDialog({ isOpen: false, userId: null, userName: '' });
      setAddTokensAmount(0);
      setError('');
      fetchUsers(pagination.currentPage);
    } catch (err) {
      console.error('Error adding tokens:', err);
      setError(err instanceof Error ? err.message : 'Failed to add tokens');
    }
  };

  const toggleUserStatus = async (userId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          status: newStatus
        })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to update user status');
      }

      fetchUsers(pagination.currentPage);
    } catch (err) {
      console.error('Error updating user status:', err);
      setError(err instanceof Error ? err.message : 'Failed to update user status');
    }
  };

  const toggleAdminStatus = async (userId: string, currentIsAdmin: boolean) => {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          isAdmin: !currentIsAdmin
        })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to update admin status');
      }

      fetchUsers(pagination.currentPage);
    } catch (err) {
      console.error('Error updating admin status:', err);
      setError(err instanceof Error ? err.message : 'Failed to update admin status');
    }
  };

  const deleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/users?userId=${userId}`, {
        method: 'DELETE'
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to delete user');
      }

      fetchUsers(pagination.currentPage);
    } catch (err) {
      console.error('Error deleting user:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete user');
    }
  };

  if (loading) {
    return (
      <div className="rounded-lg bg-white p-8 shadow-sm">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-3">
            <div className="h-5 bg-gray-200 rounded"></div>
            <div className="h-5 bg-gray-200 rounded"></div>
            <div className="h-5 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-white p-8 shadow-sm">
        <div className="text-red-600">
          <h3 className="text-lg font-semibold mb-2">Error</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg bg-white shadow-sm">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">User Management</h2>
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="Search users..."
              value={filters.search}
              onChange={(e) => handleSearch(e.target.value)}
              className="px-3 py-2 border rounded-md"
            />
            <select
              value={filters.status}
              onChange={(e) => handleStatusFilter(e.target.value)}
              className="px-3 py-2 border rounded-md"
            >
              <option value="">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="SUSPENDED">Suspended</option>
              <option value="PENDING_VERIFICATION">Pending Verification</option>
            </select>
            <select
              value={filters.tier}
              onChange={(e) => handleTierFilter(e.target.value)}
              className="px-3 py-2 border rounded-md"
            >
              <option value="">All Tiers</option>
              <option value="FREE">Free</option>
              <option value="BASIC">Basic</option>
              <option value="PREMIUM">Premium</option>
            </select>
          </div>
        </div>
        
        <div className="grid grid-cols-12 gap-6">
          {/* User List Table - 7 columns */}
          <div className="col-span-7 overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('email')}
                  >
                    User
                    {filters.sortBy === 'email' && (
                      <span className="ml-1">{filters.sortOrder === 'desc' ? '↓' : '↑'}</span>
                    )}
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('status')}
                  >
                    Status
                    {filters.sortBy === 'status' && (
                      <span className="ml-1">{filters.sortOrder === 'desc' ? '↓' : '↑'}</span>
                    )}
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('subscription.tier')}
                  >
                    Plan
                    {filters.sortBy === 'subscription.tier' && (
                      <span className="ml-1">{filters.sortOrder === 'desc' ? '↓' : '↑'}</span>
                    )}
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('createdAt')}
                  >
                    Joined
                    {filters.sortBy === 'createdAt' && (
                      <span className="ml-1">{filters.sortOrder === 'desc' ? '↓' : '↑'}</span>
                    )}
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Admin
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr 
                    key={user.id} 
                    onClick={() => setSelectedUserId(user.id)}
                    className={`cursor-pointer transition-colors ${
                      selectedUserId === user.id ? 'bg-indigo-50' : 'hover:bg-gray-50'
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {user.firstName} {user.lastName}
                          </div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 
                        user.status === 'PENDING_VERIFICATION' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {user.status === 'PENDING_VERIFICATION' ? 'Pending Verification' : user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div>
                        <div>{user.subscription?.tier || 'FREE'}</div>
                        <div className="text-xs text-gray-400">
                          Tokens: {user.subscription?.tokenLimit?.toLocaleString() || 0}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button
                        onClick={() => toggleAdminStatus(user.id, user.isAdmin)}
                        className={`px-2 py-1 rounded ${
                          user.isAdmin ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                        } hover:opacity-75`}
                      >
                        {user.isAdmin ? 'Yes' : 'No'}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => toggleUserStatus(user.id, user.status)}
                        className={`text-sm px-2 py-1 rounded ${
                          user.status === 'ACTIVE' 
                            ? 'bg-red-100 text-red-800 hover:bg-red-200' 
                            : 'bg-green-100 text-green-800 hover:bg-green-200'
                        }`}
                      >
                        {user.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                      </button>
                      <button
                        onClick={() => setTokenDialog({
                          isOpen: true,
                          userId: user.id,
                          userName: `${user.firstName} ${user.lastName}`
                        })}
                        className="text-sm px-2 py-1 rounded bg-indigo-100 text-indigo-800 hover:bg-indigo-200"
                      >
                        Add Tokens
                      </button>
                      <button
                        onClick={() => deleteUser(user.id)}
                        className="text-sm px-2 py-1 rounded bg-red-100 text-red-800 hover:bg-red-200"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* User Details Panel - 5 columns */}
          <div className="col-span-5">
            {selectedUserId && users.find(u => u.id === selectedUserId) ? (
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  User Activity & Resources
                </h3>
                <div className="space-y-6">
                  {(() => {
                    const user = users.find(u => u.id === selectedUserId)!;
                    return (
                      <>
                        {/* API Key Usage */}
                        <div>
                          <h4 className="text-sm font-medium text-gray-500 mb-2">Current API Key</h4>
                          <div className="bg-gray-50 rounded-md p-3">
                            {user.apiKeys?.find(key => key.isActive) ? (
                              <div className="text-sm">
                                <p className="font-medium text-gray-900">Active Key</p>
                                <p className="text-gray-500 mt-1">Key ID: {user.apiKeys.find(key => key.isActive)?.id}</p>
                              </div>
                            ) : (
                              <p className="text-sm text-gray-500">No active API key</p>
                            )}
                          </div>
                        </div>

                        {/* Usage Statistics */}
                        <div>
                          <h4 className="text-sm font-medium text-gray-500 mb-2">Usage Statistics</h4>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="bg-gray-50 rounded-md p-3">
                              <p className="text-xs text-gray-500">Monthly Usage</p>
                              <p className="text-lg font-medium text-gray-900">
                                {user.usage?.monthly?.toLocaleString() || 0} / {user.subscription?.monthlyLimit?.toLocaleString() || 0}
                              </p>
                              <div className="mt-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-blue-500"
                                  style={{
                                    width: `${Math.min(
                                      ((user.usage?.monthly || 0) / (user.subscription?.monthlyLimit || 1)) * 100,
                                      100
                                    )}%`,
                                  }}
                                />
                              </div>
                            </div>
                            <div className="bg-gray-50 rounded-md p-3">
                              <p className="text-xs text-gray-500">Total Usage</p>
                              <p className="text-lg font-medium text-gray-900">
                                {user.usage?.total?.toLocaleString() || 0}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Recent Activity */}
                        <div>
                          <h4 className="text-sm font-medium text-gray-500 mb-2">Recent Activity</h4>
                          <div className="space-y-3">
                            {user.activity?.length > 0 ? (
                              user.activity.map((item, index) => (
                                <div key={index} className="bg-gray-50 rounded-md p-3">
                                  <p className="text-sm font-medium text-gray-900">{item.action}</p>
                                  <p className="text-xs text-gray-500 mt-1">
                                    {new Date(item.timestamp).toLocaleDateString()}
                                  </p>
                                </div>
                              ))
                            ) : (
                              <div className="bg-gray-50 rounded-md p-3">
                                <p className="text-sm text-gray-500">No recent activity</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 text-center text-gray-500">
                Select a user to view activity and usage details
              </div>
            )}
          </div>
        </div>

        {/* Pagination Controls */}
        <div className="flex items-center justify-between mt-4">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => fetchUsers(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => fetchUsers(pagination.currentPage + 1)}
              disabled={pagination.currentPage === pagination.pages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{(pagination.currentPage - 1) * pagination.perPage + 1}</span> to{' '}
                <span className="font-medium">
                  {Math.min(pagination.currentPage * pagination.perPage, pagination.total)}
                </span>{' '}
                of <span className="font-medium">{pagination.total}</span> results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => fetchUsers(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                {/* Page numbers */}
                {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => fetchUsers(page)}
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
                  onClick={() => fetchUsers(pagination.currentPage + 1)}
                  disabled={pagination.currentPage === pagination.pages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* Add Tokens Dialog */}
      <Transition appear show={tokenDialog.isOpen} as={Fragment}>
        <Dialog
          as="div"
          className="fixed inset-0 z-10 overflow-y-auto"
          onClose={() => {
            setTokenDialog({ isOpen: false, userId: null, userName: '' });
            setAddTokensAmount(0);
            setError('');
          }}
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
                  Add Tokens for {tokenDialog.userName}
                </Dialog.Title>
                <div className="mt-4">
                  <label htmlFor="tokenAmount" className="block text-sm font-medium text-gray-700">
                    Number of Tokens
                  </label>
                  <input
                    type="number"
                    id="tokenAmount"
                    min="1"
                    value={addTokensAmount}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      setAddTokensAmount(value >= 0 ? value : 0);
                      if (error) setError('');
                    }}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                  {error && (
                    <p className="mt-2 text-sm text-red-600">{error}</p>
                  )}
                </div>

                <div className="mt-4 flex justify-end space-x-2">
                  <button
                    type="button"
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                    onClick={() => {
                      setTokenDialog({ isOpen: false, userId: null, userName: '' });
                      setAddTokensAmount(0);
                      setError('');
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
                    onClick={handleAddTokens}
                  >
                    Add Tokens
                  </button>
                </div>
              </div>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>

      {selectedUserId && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6">
          <div className="bg-white shadow sm:rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Token Management</h2>
            <TokenManagement userId={selectedUserId} onSuccess={() => fetchUsers(pagination.currentPage)} />
          </div>

          <div className="bg-white shadow sm:rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">API Key Management</h2>
            <APIKeyManagement userId={selectedUserId} />
          </div>
        </div>
      )}
    </div>
  );
}
