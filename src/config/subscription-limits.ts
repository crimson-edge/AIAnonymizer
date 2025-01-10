import { SubscriptionTier } from '@prisma/client'

export interface TierLimits {
  monthlyTokens: number
  requestsPerMinute: number
  requestsPerHour: number
  requestsPerDay: number
  maxTokensPerRequest: number
  concurrentRequests: number
}

export const subscriptionLimits: Record<SubscriptionTier, TierLimits> = {
  FREE: {
    monthlyTokens: 10000,
    requestsPerMinute: 2,
    requestsPerHour: 20,
    requestsPerDay: 100,
    maxTokensPerRequest: 1000,
    concurrentRequests: 1
  },
  BASIC: {
    monthlyTokens: 100000,
    requestsPerMinute: 10,
    requestsPerHour: 100,
    requestsPerDay: 1000,
    maxTokensPerRequest: 4000,
    concurrentRequests: 2
  },
  PREMIUM: {
    monthlyTokens: 500000,
    requestsPerMinute: 30,
    requestsPerHour: 300,
    requestsPerDay: 3000,
    maxTokensPerRequest: 8000,
    concurrentRequests: 5
  },
  ENTERPRISE: {
    monthlyTokens: Infinity,
    requestsPerMinute: 120,
    requestsPerHour: 1200,
    requestsPerDay: 12000,
    maxTokensPerRequest: 32000,
    concurrentRequests: 20
  }
}