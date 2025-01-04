import { useState } from 'react';
import { Dialog } from '@headlessui/react';

interface OveragePurchaseDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onPurchase: () => Promise<void>;
}

export default function OveragePurchaseDialog({
  isOpen,
  onClose,
  onPurchase,
}: OveragePurchaseDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handlePurchase = async () => {
    try {
      setIsLoading(true);
      await onPurchase();
    } catch (error) {
      console.error('Error purchasing overage tokens:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="relative z-50"
    >
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-sm rounded-lg bg-white p-6">
          <Dialog.Title className="text-lg font-medium leading-6 text-gray-900 mb-4">
            Token Limit Reached
          </Dialog.Title>

          <div className="mt-2">
            <p className="text-sm text-gray-500 mb-4">
              You've reached your token limit. Purchase an additional 100,000 tokens for $10 to continue using the service.
            </p>

            <div className="bg-gray-50 p-4 rounded-md mb-4">
              <h4 className="text-sm font-medium text-gray-900">Package Details:</h4>
              <ul className="mt-2 text-sm text-gray-500">
                <li>• 100,000 additional tokens</li>
                <li>• $10 one-time payment</li>
                <li>• Instant activation</li>
                <li>• Valid for both input and output tokens</li>
              </ul>
            </div>
          </div>

          <div className="mt-4 flex justify-end gap-3">
            <button
              type="button"
              className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="button"
              className={`inline-flex justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${
                isLoading
                  ? 'bg-blue-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
              onClick={handlePurchase}
              disabled={isLoading}
            >
              {isLoading ? 'Processing...' : 'Purchase Tokens'}
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
