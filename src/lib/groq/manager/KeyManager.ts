import { prisma } from '@/lib/prisma';
import { ApiKey, KeyMetrics } from '../types/GroqTypes';
import { Prisma } from '@prisma/client';

export class KeyManager {
  private static instance: KeyManager;
  private readonly maxUsageThreshold = 1000000; // 1M tokens

  private constructor() {}

  static getInstance(): KeyManager {
    if (!KeyManager.instance) {
      KeyManager.instance = new KeyManager();
    }
    return KeyManager.instance;
  }

  async getKey(userId: string): Promise<ApiKey | null> {
    const key = await prisma.apiKey.findFirst({
      where: {
        isActive: true,
        totalUsage: {
          lt: this.maxUsageThreshold
        }
      },
      orderBy: {
        totalUsage: 'asc'
      }
    });

    if (!key) {
      return null;
    }

    await prisma.apiKey.update({
      where: { id: key.id },
      data: {
        totalUsage: {
          increment: 1
        },
        updatedAt: new Date()
      }
    });

    return key;
  }

  async recordUsage(keyId: string, userId: string, requestType: string, tokens: number): Promise<void> {
    // Update key usage
    await prisma.apiKey.update({
      where: { id: keyId },
      data: {
        totalUsage: {
          increment: tokens
        },
        updatedAt: new Date()
      }
    });

    // Record usage
    await prisma.usage.create({
      data: {
        userId,
        type: 'groq',
        amount: 1,
        tokens,
        cost: 0 // Calculate based on your pricing
      }
    });
  }

  async releaseKey(keyId: string): Promise<void> {
    await prisma.apiKey.update({
      where: { id: keyId },
      data: {
        totalUsage: 0,
        updatedAt: new Date()
      }
    });
  }

  async getKeyMetrics(keyId: string): Promise<KeyMetrics | null> {
    const key = await prisma.apiKey.findUnique({
      where: { id: keyId }
    });

    if (!key) {
      return null;
    }

    // Get usage history from the usage table
    const usageHistory = await prisma.usage.findMany({
      where: {
        type: 'groq',
        userId: key.userId
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 100
    });

    // Calculate success rate based on cost - assume non-zero cost means success
    const successRate = usageHistory.length > 0 
      ? usageHistory.filter(log => log.cost > 0).length / usageHistory.length
      : 1;

    return {
      id: key.id,
      isActive: key.isActive,
      totalUsage: key.totalUsage,
      createdAt: key.createdAt,
      updatedAt: key.updatedAt,
      successRate
    };
  }

  async addKey(key: string, userId: string): Promise<void> {
    await prisma.apiKey.create({
      data: {
        key,
        isActive: true,
        totalUsage: 0,
        userId,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });
  }

  async removeKey(key: string): Promise<void> {
    await prisma.apiKey.delete({
      where: { key }
    });
  }

  async getStats(): Promise<{
    totalKeys: number;
    activeKeys: number;
    totalUsage: number;
    errorRate: number;
  }> {
    const keys = await prisma.apiKey.findMany();
    const activeKeys = keys.filter(k => k.isActive).length;
    const totalUsage = keys.reduce((sum, k) => sum + k.totalUsage, 0);

    // Get error rate from usage history
    const usageHistory = await prisma.usage.findMany({
      where: {
        type: 'groq'
      }
    });

    // Calculate error rate based on cost - assume zero cost means error
    const errorRate = usageHistory.length > 0
      ? usageHistory.filter(log => log.cost === 0).length / usageHistory.length
      : 0;

    return {
      totalKeys: keys.length,
      activeKeys,
      totalUsage,
      errorRate
    };
  }
}

export const keyManager = KeyManager.getInstance();