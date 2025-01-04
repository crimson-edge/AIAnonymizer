import prisma from '@/lib/prisma';

export class GroqKeyManager {
  private static initialized = false;

  private static async initialize() {
    if (this.initialized) return;

    try {
      console.log('Initializing GroqKeyManager...');
      await this.syncKeysWithEnvironment();
      this.initialized = true;
    } catch (error) {
      console.error('Error initializing GroqKeyManager:', error);
      throw error;
    }
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
    const inUse = keys.filter(key => key.isInUse).length;
    
    return {
      total: keys.length,
      inUse,
      available: keys.length - inUse
    };
  }

  static async getKeyUsage() {
    await this.initialize();
    
    const keys = await prisma.groqKey.findMany({
      orderBy: { lastUsed: 'desc' }
    });

    return keys.map(key => ({
      key: key.key,
      isInUse: key.isInUse,
      lastUsed: key.lastUsed,
      currentSession: key.currentSession
    }));
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
}
