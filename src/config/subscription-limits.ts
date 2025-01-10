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
    monthlyTokens: 10000,  // 10k tokens per month for free tier
    requestsPerMinute: 2,
    requestsPerHour: 20,
    requestsPerDay: 100,
    maxTokensPerRequest: 1000,  // Max 1k tokens per request
    concurrentRequests: 1
  },
  BASIC: {
    monthlyTokens: 100000,  // 100k tokens per month for basic tier
    requestsPerMinute: 10,
    requestsPerHour: 100,
    requestsPerDay: 1000,
    maxTokensPerRequest: 4000,  // Max 4k tokens per request
    concurrentRequests: 2
  },
  PREMIUM: {
    monthlyTokens: 500000,  // 500k tokens per month for premium tier
    requestsPerMinute: 30,
    requestsPerHour: 300,
    requestsPerDay: 3000,
    maxTokensPerRequest: 10000,  // Max 10k tokens per request
    concurrentRequests: 5
  },
  ENTERPRISE: {
    monthlyTokens: Infinity,  // Unlimited tokens for enterprise
    requestsPerMinute: 120,
    requestsPerHour: 1200,
    requestsPerDay: 12000,
    maxTokensPerRequest: 10000,  // Max 10k tokens per request
    concurrentRequests: 20
  }
}