import { prisma } from '@/lib/prisma';

export interface KeyUsageInfo {
  id: string;
  createdAt: string;
  lastUsed: string | null;
  totalUsage: number;
  isInUse: boolean;
}

export class GroqKeyManager {
  private static initialized = false;
  private static keyPool: string[] = [];

  private static async initialize() {
    console.time('initialize');
    if (this.initialized) {
      console.timeEnd('initialize');
      return;
    }
    
    try {
      console.log('Initializing GroqKeyManager...');
      console.time('syncKeysWithEnvironment');
      await this.syncKeysWithEnvironment();
      console.timeEnd('syncKeysWithEnvironment');
      
      console.time('getKeys');
      const keys = await this.getKeys();
      console.timeEnd('getKeys');
      
      console.time('processKeys');
      this.keyPool = Array.isArray(keys) ? keys : [];
      this.initialized = true;
      console.timeEnd('processKeys');
    } catch (error) {
      console.error('Error initializing GroqKeyManager:', error);
      this.keyPool = [];
      this.initialized = true;
    }
    console.timeEnd('initialize');
  }

  private static async syncKeysWithEnvironment() {
    console.log('Raw GROQ_API_KEYS:', process.env.GROQ_API_KEYS);

    // Get all keys from environment
    const envKeys = (process.env.GROQ_API_KEYS || '').split(',')
      .map(key => key.trim())
      .filter(key => key.length > 0);

    console.log('Parsed environment keys:', envKeys);

    // Get all keys from database
    const dbKeys = await prisma.groqKey.findMany();
    console.log('Existing database keys:', dbKeys);

    const dbKeySet = new Set(dbKeys.map(k => k.key));

    // Add new keys from environment that don't exist in database
    for (const key of envKeys) {
      if (!dbKeySet.has(key)) {
        console.log('Adding new key to database:', key);
        await prisma.groqKey.create({
          data: {
            key,
            isInUse: false,
            lastUsed: null
          }
        });
      }
    }

    // Remove keys from database that are no longer in environment
    const envKeySet = new Set(envKeys);
    for (const dbKey of dbKeys) {
      if (!envKeySet.has(dbKey.key)) {
        console.log('Removing key from database:', dbKey.key);
        await prisma.groqKey.delete({
          where: { key: dbKey.key }
        });
      }
    }
  }

  static async getStats() {
    await this.initialize();

    const keys = await prisma.groqKey.findMany();
    const activeKeys = keys.filter(key => key.isInUse).length;
    const inUseKeys = keys.filter(key => key.currentSession !== null).length;

    return {
      totalKeys: keys.length,
      activeKeys,
      inUseKeys
    };
  }

  static async getKeyUsage(): Promise<KeyUsageInfo[]> {
    console.log('getKeyUsage started');
    try {
      console.log('Getting keys...');
      const keys = await this.getKeys();
      console.log('Got keys:', keys);

      if (!Array.isArray(keys)) {
        console.error('Invalid keys response:', keys);
        return [];
      }

      console.log('Fetching usage data for keys...');
      const usageData = await Promise.all(
        keys.map(async (key) => {
          try {
            console.log(`Fetching usage for key ${key}...`);
            const usage = await prisma.groqKey.findUnique({
              where: { key },
              include: {
                usageHistory: {
                  orderBy: { createdAt: 'desc' },
                  take: 1,
                }
              }
            });
            console.log(`Usage for key ${key}:`, usage);

            const totalUsage = await prisma.groqKey.findUnique({
              where: { key },
              include: {
                _count: {
                  select: { usageHistory: true }
                }
              }
            });
            console.log(`Total usage for key ${key}:`, totalUsage);

            const result = {
              id: key,
              createdAt: new Date().toISOString(),
              lastUsed: usage?.usageHistory[0]?.createdAt?.toISOString() || null,
              totalUsage: totalUsage?._count?.usageHistory || 0,
              isInUse: true,
            };
            console.log(`Final result for key ${key}:`, result);
            return result;
          } catch (error) {
            console.error(`Error getting usage for key ${key}:`, error);
            return {
              id: key,
              createdAt: new Date().toISOString(),
              lastUsed: null,
              totalUsage: 0,
              isInUse: true,
            };
          }
        })
      );

      console.log('Final usage data:', usageData);
      return usageData;
    } catch (error) {
      console.error('Error in getKeyUsage:', error);
      return [];
    }
  }

  static async addKeyToPool(key: string) {
    await this.initialize();

    const exists = await prisma.groqKey.findFirst({
      where: { key }
    });

    if (exists) {
      throw new Error('Key already exists in pool');
    }

    return prisma.groqKey.create({
      data: {
        key,
        isInUse: false,
        lastUsed: null
      }
    });
  }

  static async removeKeyFromPool(key: string) {
    await this.initialize();

    return prisma.groqKey.delete({
      where: { key }
    });
  }

  static async getAvailableKey() {
    await this.initialize();

    const key = await prisma.groqKey.findFirst({
      where: { isInUse: false }
    });

    if (!key) {
      throw new Error('No available API keys');
    }

    return key.key;
  }

  static async markKeyAsInUse(key: string, userId: string) {
    await this.initialize();

    return prisma.groqKey.update({
      where: { key },
      data: {
        isInUse: true,
        lastUsed: new Date(),
        currentSession: userId
      }
    });
  }

  static async releaseKey(key: string) {
    await this.initialize();

    return prisma.groqKey.update({
      where: { key },
      data: {
        isInUse: false,
        currentSession: null
      }
    });
  }

  static async refreshKeyPool() {
    console.log('Refreshing key pool...');
    this.initialized = false; // Force reinitialization
    await this.initialize();
    return this.getKeyUsage();
  }

  private static async getKeys(): Promise<string[]> {
    console.time('prismaQuery');
    try {
      const keys = await prisma.groqKey.findMany({
        select: { key: true }
      });
      console.timeEnd('prismaQuery');
      return keys.map(k => k.key);
    } catch (error) {
      console.error('Error in getKeys:', error);
      console.timeEnd('prismaQuery');
      return [];
    }
  }
}
