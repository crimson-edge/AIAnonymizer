import { prisma } from '@/lib/prisma';
import { SubscriptionTier } from '@prisma/client';
import fs from 'fs/promises';
import path from 'path';

// In-memory key management
const keyPool = new Map<string, {
  isInUse: boolean;
  currentSession?: string;
  lastUsed?: Date;
}>();

// Get the .env file path
const envPath = path.join(process.cwd(), '.env');

// Initialize key pool from environment variable
async function initializeKeyPool() {
  try {
    let keys: string[] = [];
    const keysStr = process.env.GROQ_API_KEYS;
    
    if (keysStr) {
      try {
        // Try parsing as JSON first
        keys = JSON.parse(keysStr);
      } catch {
        // Fallback to comma-separated string
        keys = keysStr.split(',');
      }
    }
    
    // Ensure keys is an array
    if (!Array.isArray(keys)) {
      console.error('Invalid GROQ_API_KEYS format:', keysStr);
      keys = [];
    }

    keyPool.clear(); // Clear existing keys
    keys.forEach(key => {
      if (key && typeof key === 'string' && !keyPool.has(key)) {
        keyPool.set(key.trim(), {
          isInUse: false
        });
      }
    });
    
    console.log(`Initialized ${keyPool.size} API keys`);
  } catch (error) {
    console.error('Error initializing key pool:', error);
    // Don't throw, just log the error and continue with empty pool
  }
}

// Initialize on service start
initializeKeyPool();

export class GroqKeyService {
  static async allocateKey(userId: string, tier: SubscriptionTier): Promise<string | null> {
    try {
      // Find an available key
      const availableKey = Array.from(keyPool.entries()).find(([_, status]) => !status.isInUse);
      
      if (availableKey) {
        const [key] = availableKey;
        keyPool.set(key, {
          isInUse: true,
          currentSession: userId,
          lastUsed: new Date()
        });
        return key;
      }

      // No available keys
      console.error('No available Groq API keys');
      return null;
    } catch (error) {
      console.error('Error allocating Groq API key:', error);
      return null;
    }
  }

  static async releaseKey(userId: string): Promise<boolean> {
    try {
      const keyToRelease = Array.from(keyPool.entries()).find(([_, status]) => status.currentSession === userId);
      
      if (keyToRelease) {
        const [key] = keyToRelease;
        keyPool.set(key, {
          isInUse: false
        });
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error releasing Groq API key:', error);
      return false;
    }
  }

  static async getKeyForUser(userId: string): Promise<string | null> {
    try {
      const keyEntry = Array.from(keyPool.entries()).find(([_, status]) => status.currentSession === userId);
      return keyEntry ? keyEntry[0] : null;
    } catch (error) {
      console.error('Error getting Groq API key for user:', error);
      return null;
    }
  }

  static async refreshKeyPool(): Promise<boolean> {
    try {
      await initializeKeyPool();
      return true;
    } catch (error) {
      console.error('Error refreshing Groq API key pool:', error);
      return false;
    }
  }

  // Admin functions
  static async listKeys(): Promise<Array<{
    key: string;
    isInUse: boolean;
    currentSession?: string;
    lastUsed?: Date;
  }>> {
    return Array.from(keyPool.entries()).map(([key, status]) => ({
      key,
      ...status
    }));
  }

  static async addKey(key: string): Promise<boolean> {
    try {
      // Read current .env file
      let envContent = await fs.readFile(envPath, 'utf-8');
      
      // Find the GROQ_API_KEYS line
      const groqKeysMatch = envContent.match(/^GROQ_API_KEYS=(.*)$/m);
      
      if (groqKeysMatch) {
        // Get current keys
        const currentKeys = groqKeysMatch[1].split(',').map(k => k.trim());
        
        // Check if key already exists
        if (currentKeys.includes(key)) {
          return false;
        }
        
        // Add new key
        currentKeys.push(key);
        
        // Update .env file
        envContent = envContent.replace(
          /^GROQ_API_KEYS=.*$/m,
          `GROQ_API_KEYS=${currentKeys.join(',')}`
        );
      } else {
        // Add new GROQ_API_KEYS line if it doesn't exist
        envContent += `\nGROQ_API_KEYS=${key}`;
      }
      
      // Write back to .env file
      await fs.writeFile(envPath, envContent);
      
      // Update process.env
      process.env.GROQ_API_KEYS = process.env.GROQ_API_KEYS 
        ? `${process.env.GROQ_API_KEYS},${key}`
        : key;
      
      // Refresh key pool
      await initializeKeyPool();
      
      return true;
    } catch (error) {
      console.error('Error adding API key:', error);
      return false;
    }
  }

  static async removeKey(key: string): Promise<boolean> {
    try {
      // Don't remove key if it's in use
      const keyStatus = keyPool.get(key);
      if (keyStatus?.isInUse) {
        return false;
      }

      // Read current .env file
      let envContent = await fs.readFile(envPath, 'utf-8');
      
      // Find the GROQ_API_KEYS line
      const groqKeysMatch = envContent.match(/^GROQ_API_KEYS=(.*)$/m);
      
      if (groqKeysMatch) {
        // Get current keys
        const currentKeys = groqKeysMatch[1].split(',').map(k => k.trim());
        
        // Remove the key
        const newKeys = currentKeys.filter(k => k !== key);
        
        // Update .env file
        envContent = envContent.replace(
          /^GROQ_API_KEYS=.*$/m,
          `GROQ_API_KEYS=${newKeys.join(',')}`
        );
        
        // Write back to .env file
        await fs.writeFile(envPath, envContent);
        
        // Update process.env
        process.env.GROQ_API_KEYS = newKeys.join(',');
        
        // Refresh key pool
        await initializeKeyPool();
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error removing API key:', error);
      return false;
    }
  }
}
