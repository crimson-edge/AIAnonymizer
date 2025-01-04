'use client';

interface TokenPurchaseDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TokenPurchaseDialog({ isOpen, onClose }: TokenPurchaseDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h2 className="text-xl font-bold mb-4">Purchase Tokens</h2>
        <p className="text-gray-600 mb-4">
          Purchase additional tokens to increase your usage capacity.
        </p>
        <div className="flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Purchase
          </button>
        </div>
      </div>
    </div>
  );
}
