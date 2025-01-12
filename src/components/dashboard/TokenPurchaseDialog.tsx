import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface TokenPurchaseDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onPurchase: () => void;
}

export default function TokenPurchaseDialog({ isOpen, onClose, onPurchase }: TokenPurchaseDialogProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handlePurchase = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/stripe/create-token-purchase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create purchase session');
      }

      const { sessionId } = await response.json();
      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error('Stripe not initialized');
      }

      const { error: stripeError } = await stripe.redirectToCheckout({ sessionId });
      if (stripeError) {
        throw stripeError;
      }
    } catch (error) {
      console.error('Error purchasing tokens:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to purchase tokens',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg">
        <h2 className="text-lg font-semibold mb-4">Purchase Tokens</h2>
        <p className="mb-4">Would you like to purchase 500,000 additional tokens?</p>
        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={handlePurchase}
            disabled={loading}
            className={`px-4 py-2 ${loading ? 'bg-gray-400' : 'bg-blue-600'} text-white rounded hover:bg-blue-700`}
          >
            {loading ? 'Processing...' : 'Purchase'}
          </button>
        </div>
      </div>
    </div>
  );
}
