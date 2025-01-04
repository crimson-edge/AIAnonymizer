import { PrismaClient } from '@prisma/client';

declare global {
  var prisma: PrismaClient | undefined;
}

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is not set in environment variables');
}

// Test database connection with retries
async function testConnection(retries = 3, delay = 1000) {
  for (let i = 0; i < retries; i++) {
    try {
      const testClient = new PrismaClient();
      console.log(`Testing database connection (attempt ${i + 1}/${retries})...`);
      await testClient.$connect();
      console.log('Database connection successful');
      await testClient.$disconnect();
      return true;
    } catch (error) {
      console.error(`Database connection test failed (attempt ${i + 1}/${retries}):`, {
        error: error.message,
        code: error.code,
        meta: error.meta,
      });
      if (i < retries - 1) {
        console.log(`Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  return false;
}

// Run the test in non-production environments
if (process.env.NODE_ENV !== 'production') {
  testConnection();
}

const prisma = globalThis.prisma ?? new PrismaClient({
  log: [
    {
      emit: 'stdout',
      level: 'query',
    },
    {
      emit: 'stdout',
      level: 'error',
    },
    {
      emit: 'stdout',
      level: 'info',
    },
    {
      emit: 'stdout',
      level: 'warn',
    },
  ],
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  }
});

// Test connection in production too, but don't block
if (process.env.NODE_ENV === 'production') {
  testConnection(5, 2000); // More retries and longer delay in production
}

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma;
}

// Add error handling for connection issues
prisma.$on('error', (e) => {
  console.error('Prisma Client Error:', {
    message: e.message,
    target: e.target,
    timestamp: new Date().toISOString()
  });
});

export { prisma };
export default prisma;
