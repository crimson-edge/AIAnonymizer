import { useState } from 'react';
import OveragePurchaseDialog from './OveragePurchaseDialog';

interface TokenPurchaseButtonProps {
  tier: 'FREE' | 'BASIC' | 'PREMIUM';
  onPurchase?: () => void;
}

export default function TokenPurchaseButton({ tier, onPurchase }: TokenPurchaseButtonProps) {
  const [showDialog, setShowDialog] = useState(false);

  const handlePurchase = async () => {
    try {
      const response = await fetch('/api/billing/purchase-overage', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      console.error('Error purchasing overage tokens:', error);
    }
  };

  if (tier !== 'PREMIUM') {
    return null;
  }

  return (
    <>
      <button
        onClick={() => {
          setShowDialog(true);
          onPurchase?.();
        }}
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        Purchase Additional Tokens
      </button>

      <OveragePurchaseDialog
        isOpen={showDialog}
        onClose={() => setShowDialog(false)}
        onPurchase={handlePurchase}
      />
    </>
  );
}
