import { prisma } from '../prisma';
import { initializeGroqKeyPool, listAllGroqKeys } from '../../utils/groq-key-pool';

export interface ApiKeyStats {
  total: number;
  inUse: number;
  available: number;
}

export class GroqKeyManager {
  static async initialize(): Promise<void> {
    await initializeGroqKeyPool();
  }

  static async getStats(): Promise<ApiKeyStats> {
    const keys = await listAllGroqKeys();
    const inUse = keys.filter(key => key.isInUse).length;
    
    return {
      total: keys.length,
      inUse,
      available: keys.length - inUse,
    };
  }

  static async getKeyUsage(): Promise<Array<{
    key: string;
    isInUse: boolean;
    currentSession: string | null;
    lastUsed: Date | null;
    totalUses: number;
  }>> {
    const keys = await prisma.groqKey.findMany({
      include: {
        _count: {
          select: {
            usageHistory: true,
          },
        },
      },
      orderBy: {
        lastUsed: 'desc',
      },
    });

    return keys.map(key => ({
      key: this.maskApiKey(key.key),
      isInUse: key.isInUse,
      currentSession: key.currentSession,
      lastUsed: key.lastUsed,
      totalUses: key._count.usageHistory,
    }));
  }

  static async refreshKeyPool(): Promise<void> {
    await initializeGroqKeyPool();
  }

  private static maskApiKey(key: string): string {
    if (key.length <= 8) return '********';
    return `${key.slice(0, 4)}...${key.slice(-4)}`;
  }

  static async addKeyToPool(key: string): Promise<void> {
    const currentKeys = process.env.GROQ_API_KEYS 
      ? JSON.parse(process.env.GROQ_API_KEYS)
      : [];
    
    if (!currentKeys.includes(key)) {
      currentKeys.push(key);
      process.env.GROQ_API_KEYS = JSON.stringify(currentKeys);
      await initializeGroqKeyPool();
    }
  }

  static async removeKeyFromPool(key: string): Promise<void> {
    const currentKeys = process.env.GROQ_API_KEYS 
      ? JSON.parse(process.env.GROQ_API_KEYS)
      : [];
    
    const index = currentKeys.indexOf(key);
    if (index > -1) {
      currentKeys.splice(index, 1);
      process.env.GROQ_API_KEYS = JSON.stringify(currentKeys);
      await initializeGroqKeyPool();
    }
  }
}
