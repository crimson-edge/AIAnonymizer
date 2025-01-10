import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { subscriptionLimits } from '@/config/subscription-limits';
import { formatNumber } from '@/lib/utils';

export interface UpgradeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: (tier: 'BASIC' | 'PREMIUM') => Promise<void>;
  currentTier: 'FREE' | 'BASIC' | 'PREMIUM';
}

export default function UpgradeDialog({
  isOpen,
  onClose,
  onUpgrade,
  currentTier,
}: UpgradeDialogProps) {
  const plans = [
    {
      name: 'BASIC',
      price: '$10/month',
      features: [
        `${formatNumber(subscriptionLimits.BASIC.monthlyTokens)} tokens/month`,
        `${subscriptionLimits.BASIC.requestsPerMinute} requests/minute`,
        `${formatNumber(subscriptionLimits.BASIC.maxTokensPerRequest)} tokens per request`,
      ],
      disabled: currentTier === 'BASIC' || currentTier === 'PREMIUM',
    },
    {
      name: 'PREMIUM',
      price: '$50/month',
      features: [
        `${formatNumber(subscriptionLimits.PREMIUM.monthlyTokens)} tokens/month`,
        `${subscriptionLimits.PREMIUM.requestsPerMinute} requests/minute`,
        `${formatNumber(subscriptionLimits.PREMIUM.maxTokensPerRequest)} tokens per request`,
        'Purchase additional tokens',
      ],
      disabled: currentTier === 'PREMIUM',
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Upgrade Your Plan</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className="border rounded-lg p-6 space-y-4 relative"
            >
              <div className="text-xl font-semibold">{plan.name}</div>
              <div className="text-2xl font-bold">{plan.price}</div>
              <ul className="space-y-2">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <svg
                      className="w-5 h-5 text-green-500 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => onUpgrade(plan.name as 'BASIC' | 'PREMIUM')}
                disabled={plan.disabled}
                className={`w-full mt-4 py-2 px-4 rounded ${
                  plan.disabled
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {plan.disabled
                  ? currentTier === plan.name
                    ? 'Current Plan'
                    : 'Not Available'
                  : `Upgrade to ${plan.name}`}
              </button>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
