import { prisma } from '@/lib/prisma';
import { GroqKey, KeyMetrics } from '../types/GroqTypes';
import { Prisma } from '@prisma/client';

export class KeyManager {
  private static instance: KeyManager;
  private readonly maxErrorThreshold = 5;
  private readonly keyLockDuration = 60 * 1000; // 1 minute

  private constructor() {}

  static getInstance(): KeyManager {
    if (!KeyManager.instance) {
      KeyManager.instance = new KeyManager();
    }
    return KeyManager.instance;
  }

  async getKey(userId: string): Promise<GroqKey | null> {
    const key = await prisma.groqKey.findFirst({
      where: {
        isInUse: false,
        errorCount: {
          lt: this.maxErrorThreshold
        }
      },
      orderBy: {
        lastUsed: 'asc'
      }
    });

    if (!key) {
      return null;
    }

    await prisma.groqKey.update({
      where: { id: key.id },
      data: {
        isInUse: true,
        currentSession: userId,
        lastUsed: new Date()
      }
    });

    return key;
  }

  async recordSuccess(key: string, userId: string, requestType: string, tokens: number): Promise<void> {
    const cost = new Prisma.Decimal(tokens * 0.0001);
    await prisma.groqKey.update({
      where: { key },
      data: {
        isInUse: false,
        currentSession: null,
        totalRequests: { increment: 1 },
        totalTokens: { increment: tokens },
        totalCost: { increment: cost },
        usageHistory: {
          create: {
            userId,
            requestType,
            tokens: tokens,
            cost,
            success: true,
            latency: 0 // Add required latency field
          }
        }
      }
    });
  }

  async recordError(key: string, userId: string, requestType: string, error: Error): Promise<void> {
    await prisma.groqKey.update({
      where: { key },
      data: {
        isInUse: false,
        currentSession: null,
        errorCount: { increment: 1 },
        usageHistory: {
          create: {
            userId,
            requestType,
            tokens: 0,
            cost: new Prisma.Decimal(0),
            success: false,
            latency: 0,
            errorType: error.message  // Changed to match schema's errorType field
          }
        }
      }
    });
  }
  async refreshKeyPool(): Promise<void> {
    const staleTimeout = new Date(Date.now() - this.keyLockDuration);
    await prisma.groqKey.updateMany({
      where: {
        isInUse: true,
        lastUsed: {
          lt: staleTimeout
        }
      },
      data: {
        isInUse: false,
        currentSession: null
      }
    });
  }

  async getKeyMetrics(): Promise<KeyMetrics[]> {
    const keys = await prisma.groqKey.findMany({
      include: {
        usageHistory: {
          orderBy: {
            timestamp: 'desc'
          },
          take: 10
        }
      }
    });

    return keys.map(key => {
      const successfulRequests = key.usageHistory.filter(h => h.success).length;
      return {
        id: key.id,
        isInUse: key.isInUse,
        lastUsed: key.lastUsed,
        totalRequests: key.totalRequests,
        totalTokens: Number(key.totalTokens),
        totalCost: Number(key.totalCost),
        errorCount: key.errorCount,
        currentSession: key.currentSession,
        lastRequest: key.usageHistory[0]?.timestamp || null,
        successRate: key.totalRequests > 0 ? (successfulRequests / key.totalRequests) * 100 : 0,
        lastNRequests: key.usageHistory.length, // This is already a number
        createdAt: key.createdAt,
        updatedAt: key.updatedAt,
        totalUsage: Number(key.totalTokens)
      };
    });
  }
  async addKey(key: string): Promise<void> {
    await prisma.groqKey.create({
      data: {
        key,
        isInUse: false,
        currentSession: null,
        totalRequests: 0,
        totalTokens: BigInt(0),
        totalCost: new Prisma.Decimal(0),
        errorCount: 0
      }
    });
  }

  async removeKey(key: string): Promise<void> {
    await prisma.groqKey.delete({
      where: { key }
    });
  }

  async getStats(): Promise<{
    totalKeys: number;
    activeKeys: number;
    totalRequests: number;
    totalTokens: number;
    totalCost: number;
    errorRate: number;
  }> {
    const keys = await prisma.groqKey.findMany();
    const activeKeys = keys.filter(k => k.isInUse).length;
    const totalRequests = keys.reduce((sum, k) => sum + k.totalRequests, 0);
    const totalTokens = Number(keys.reduce((sum, k) => sum + k.totalTokens, BigInt(0)));
    const totalCost = Number(keys.reduce((sum, k) => sum.plus(k.totalCost), new Prisma.Decimal(0)));
    const totalErrors = keys.reduce((sum, k) => sum + k.errorCount, 0);

    return {
      totalKeys: keys.length,
      activeKeys,
      totalRequests,
      totalTokens,
      totalCost,
      errorRate: totalRequests > 0 ? (totalErrors / totalRequests) * 100 : 0
    };
  }
  // ... (keep other methods)
}

export const keyManager = KeyManager.getInstance();