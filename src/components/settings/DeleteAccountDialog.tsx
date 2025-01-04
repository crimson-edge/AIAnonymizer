'use client';

import { useState } from 'react';
import { signOut } from 'next-auth/react';

interface DeleteAccountDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DeleteAccountDialog({ isOpen, onClose }: DeleteAccountDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [confirmText, setConfirmText] = useState('');

  const handleDelete = async () => {
    if (confirmText !== 'DELETE') {
      setError('Please type DELETE to confirm');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/user/delete', {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete account');
      }

      // Sign out the user
      await signOut({ callbackUrl: '/' });
    } catch (err) {
      console.error('Error deleting account:', err);
      setError('Failed to delete account. Please try again.');
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h3 className="text-xl font-bold text-red-600 mb-4">Delete Account</h3>
        <div className="space-y-4">
          <p className="text-gray-700">
            Are you sure you want to delete your account? This action cannot be undone and will:
          </p>
          <ul className="list-disc list-inside text-gray-600 space-y-2">
            <li>Permanently delete your account and all associated data</li>
            <li>Cancel any active subscriptions</li>
            <li>Remove all API keys</li>
            <li>Delete all usage history</li>
          </ul>
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type DELETE to confirm:
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="Type DELETE"
            />
          </div>
          {error && (
            <p className="text-red-600 text-sm">{error}</p>
          )}
          <div className="flex justify-end gap-4 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={loading || confirmText !== 'DELETE'}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
            >
              {loading ? 'Deleting...' : 'Delete Account'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
