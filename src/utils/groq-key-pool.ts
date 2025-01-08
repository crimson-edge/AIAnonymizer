import { prisma } from '@/lib/prisma';

// Get keys from environment variable
function getGroqKeys(): string[] {
  try {
    const keysJson = process.env.GROQ_API_KEYS || '[]';
    return JSON.parse(keysJson);
  } catch (error) {
    console.error('Error parsing GROQ_API_KEYS:', error);
    return [];
  }
}

// Initialize the key pool in the database
export async function initializeGroqKeyPool(): Promise<void> {
  // Get all existing keys
  const existingKeys = await prisma.apiKey.findMany();

  // Get environment variables for Groq API keys
  const groqKeys = process.env.GROQ_API_KEYS?.split(',') || [];

  // Add any new keys
  for (const key of groqKeys) {
    const exists = existingKeys.some(k => k.key === key);
    if (!exists) {
      await prisma.apiKey.create({
        data: {
          key,
          isActive: true,
          totalUsage: 0,
          userId: null,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });
    }
  }

  // Mark any keys not in environment as inactive
  for (const existingKey of existingKeys) {
    if (!groqKeys.includes(existingKey.key)) {
      await prisma.apiKey.update({
        where: { key: existingKey.key },
        data: { isActive: false }
      });
    }
  }
}

// Admin functions
export async function listAllGroqKeys() {
  return prisma.apiKey.findMany({
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
        },
      },
    },
  });
}

// Function to refresh the pool with current environment keys
export async function refreshGroqKeyPool(): Promise<void> {
  await initializeGroqKeyPool();
}

export async function createGroqKey(key: string, userId: string): Promise<void> {
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

export async function deleteGroqKey(key: string): Promise<void> {
  await prisma.apiKey.delete({
    where: { key }
  });
}

export async function getGroqKeyForUser(userId: string): Promise<string | null> {
  const key = await prisma.apiKey.findFirst({
    where: {
      userId,
      isActive: true
    }
  });

  return key?.key || null;
}

export async function assignGroqKeyToUser(key: string, userId: string): Promise<void> {
  await prisma.apiKey.update({
    where: { key },
    data: {
      userId,
      updatedAt: new Date()
    }
  });
}

export async function releaseGroqKeyFromUser(userId: string): Promise<void> {
  await prisma.apiKey.updateMany({
    where: {
      userId,
      isActive: true
    },
    data: {
      userId: null,
      updatedAt: new Date()
    }
  });
}
