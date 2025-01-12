'use client';

import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface TokenPurchaseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function TokenPurchaseDialog({ open, onOpenChange }: TokenPurchaseDialogProps) {
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

      const { url } = await response.json();
      if (url) {
        window.location.href = url;
      } else {
        throw new Error('No checkout URL returned');
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Purchase Additional Tokens</DialogTitle>
          <DialogDescription>
            Add 500,000 tokens to your account for $12
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <div className="rounded-lg border p-4">
            <div className="flex flex-col">
              <span className="text-lg font-medium">500,000 Tokens</span>
              <span className="text-sm text-muted-foreground">Additional tokens for AI text anonymization</span>
              <span className="mt-2 text-lg font-medium">$12</span>
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handlePurchase} disabled={loading}>
            {loading ? 'Processing...' : 'Purchase'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
