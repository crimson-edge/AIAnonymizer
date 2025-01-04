import { PrismaClient } from '@prisma/client';

declare global {
  var prisma: PrismaClient | undefined;
}

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is not set in environment variables');
}

// Test database connection
async function testConnection() {
  try {
    const testClient = new PrismaClient();
    console.log('Testing database connection...');
    await testClient.$connect();
    console.log('Database connection successful');
    await testClient.$disconnect();
  } catch (error) {
    console.error('Database connection test failed:', {
      error: error.message,
      code: error.code,
      meta: error.meta,
    });
  }
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
});

// Test connection in production too, but don't block
if (process.env.NODE_ENV === 'production') {
  testConnection();
}

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma;
}

export { prisma };
export default prisma;
