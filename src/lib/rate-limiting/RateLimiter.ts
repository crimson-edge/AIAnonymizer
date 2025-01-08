import { PrismaClient, SubscriptionTier } from '@prisma/client'
import { subscriptionLimits, TierLimits } from '@/config/subscription-limits'

export class RateLimiter {
  private prisma: PrismaClient
  private static instance: RateLimiter

  private constructor() {
    this.prisma = new PrismaClient()
  }

  static getInstance(): RateLimiter {
    if (!RateLimiter.instance) {
      RateLimiter.instance = new RateLimiter()
    }
    return RateLimiter.instance
  }

  private getExpirationTime(type: string): Date {
    const now = new Date()
    switch (type) {
      case 'minute':
        return new Date(now.getTime() + 60000)
      case 'hour':
        return new Date(now.getTime() + 3600000)
      case 'day':
        return new Date(now.getTime() + 86400000)
      case 'month':
        return new Date(now.getFullYear(), now.getMonth() + 1, 1)
      default:
        throw new Error(`Invalid rate limit type: ${type}`)
    }
  }

  private async getTokenBalance(userId: string, tier: SubscriptionTier): Promise<{
    baseLimit: number;
    extraTokens: number;
  }> {
    const balance = await this.prisma.tokenBalance.findUnique({
      where: { userId }
    });
    
    return {
      baseLimit: subscriptionLimits[tier].monthlyTokens,
      extraTokens: balance?.extraTokens || 0
    };
  }

  async checkRateLimit(
    userId: string,
    tier: SubscriptionTier,
    estimatedTokens: number
  ): Promise<{ allowed: boolean; reason?: string }> {
    const limits = subscriptionLimits[tier]
    const now = new Date()

    // Clean up expired entries
    await this.prisma.rateLimit.deleteMany({
      where: {
        expiresAt: {
          lt: now
        }
      }
    })

    // Check and update all limits in a transaction
    try {
      return await this.prisma.$transaction(async (tx) => {
        // Check token limits first
        const { baseLimit, extraTokens } = await this.getTokenBalance(userId, tier);
        const monthlyUsage = await this.updateLimit(tx, userId, 'month', estimatedTokens)
        
        if (monthlyUsage > (baseLimit + extraTokens)) {
          return { allowed: false, reason: 'Token limit exceeded' }
        }

        // Check per-minute limit
        const minuteLimit = await this.updateLimit(tx, userId, 'minute', 1)
        if (minuteLimit > limits.requestsPerMinute) {
          return { allowed: false, reason: 'Too many requests per minute' }
        }

        // Check hourly limit
        const hourLimit = await this.updateLimit(tx, userId, 'hour', 1)
        if (hourLimit > limits.requestsPerHour) {
          return { allowed: false, reason: 'Too many requests per hour' }
        }

        // Check daily limit
        const dayLimit = await this.updateLimit(tx, userId, 'day', 1)
        if (dayLimit > limits.requestsPerDay) {
          return { allowed: false, reason: 'Too many requests per day' }
        }

        if (estimatedTokens > limits.maxTokensPerRequest) {
          return { allowed: false, reason: 'Request exceeds maximum tokens allowed' }
        }

        return { allowed: true }
      })
    } catch (error) {
      console.error('Rate limit check failed:', error)
      return { allowed: false, reason: 'Rate limit check failed' }
    }
  }

  private async updateLimit(
    tx: any,
    userId: string,
    type: string,
    increment: number
  ): Promise<number> {
    const now = new Date()
    const expiresAt = this.getExpirationTime(type)

    const result = await tx.rateLimit.upsert({
      where: {
        userId_type: {
          userId,
          type
        }
      },
      update: {
        count: {
          increment
        },
        expiresAt
      },
      create: {
        userId,
        type,
        count: increment,
        expiresAt
      }
    })

    return result.count
  }

  async getRemainingLimits(userId: string, tier: SubscriptionTier): Promise<{
    requestsPerMinute: number
    requestsPerHour: number
    requestsPerDay: number
    remainingTokens: number
  }> {
    const limits = subscriptionLimits[tier]
    const now = new Date()

    const [currentLimits, tokenBalance] = await Promise.all([
      this.prisma.rateLimit.findMany({
        where: {
          userId,
          expiresAt: {
            gt: now
          }
        }
      }),
      this.getTokenBalance(userId, tier)
    ]);

    const getCurrent = (type: string) => 
      currentLimits.find(l => l.type === type)?.count || 0

    const monthlyUsage = getCurrent('month')
    const totalTokenLimit = tokenBalance.baseLimit + tokenBalance.extraTokens

    return {
      requestsPerMinute: limits.requestsPerMinute - getCurrent('minute'),
      requestsPerHour: limits.requestsPerHour - getCurrent('hour'),
      requestsPerDay: limits.requestsPerDay - getCurrent('day'),
      remainingTokens: totalTokenLimit - monthlyUsage
    }
  }

  // Token management methods
  async addExtraTokens(userId: string, amount: number): Promise<void> {
    await this.prisma.tokenBalance.upsert({
      where: { userId },
      update: {
        extraTokens: {
          increment: amount
        }
      },
      create: {
        userId,
        baseTokens: 0,
        extraTokens: amount
      }
    });
  }
}

export const rateLimiter = RateLimiter.getInstance()