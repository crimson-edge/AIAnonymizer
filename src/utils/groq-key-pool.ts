import { prisma } from '../lib/prisma';

interface GroqKey {
  key: string;
  isInUse: boolean;
  currentSession?: string;
  lastUsed?: Date;
}

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
export async function initializeGroqKeyPool() {
  const keys = getGroqKeys();
  
  if (keys.length === 0) {
    throw new Error('No Groq API keys found in environment variables');
  }

  // Upsert each key to ensure it exists in the database
  for (const key of keys) {
    await prisma.groqKey.upsert({
      where: { key },
      create: {
        key,
        isInUse: false,
      },
      update: {} // Don't update if exists
    });
  }

  // Remove any keys that are no longer in the environment
  await prisma.groqKey.deleteMany({
    where: {
      key: {
        notIn: keys,
      },
    },
  });
}

export async function assignGroqKeyToSession(sessionId: string): Promise<string | null> {
  // Find an available key
  const availableKey = await prisma.groqKey.findFirst({
    where: {
      isInUse: false,
    },
  });

  if (!availableKey) {
    return null;
  }

  // Assign the key to the session
  await prisma.groqKey.update({
    where: { key: availableKey.key },
    data: {
      isInUse: true,
      currentSession: sessionId,
      lastUsed: new Date(),
    },
  });

  return availableKey.key;
}

export async function releaseGroqKeyFromSession(sessionId: string): Promise<boolean> {
  const key = await prisma.groqKey.findFirst({
    where: {
      currentSession: sessionId,
    },
  });

  if (!key) {
    return false;
  }

  await prisma.groqKey.update({
    where: { key: key.key },
    data: {
      isInUse: false,
      currentSession: null,
    },
  });

  return true;
}

export async function getGroqKeyForSession(sessionId: string): Promise<string | null> {
  const key = await prisma.groqKey.findFirst({
    where: {
      currentSession: sessionId,
    },
  });

  return key?.key || null;
}

// Admin functions
export async function listAllGroqKeys() {
  return prisma.groqKey.findMany({
    orderBy: { lastUsed: 'desc' },
  });
}

// Function to refresh the pool with current environment keys
export async function refreshGroqKeyPool(): Promise<void> {
  await initializeGroqKeyPool();
}
