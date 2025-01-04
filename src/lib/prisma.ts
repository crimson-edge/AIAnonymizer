import { PrismaClient, Prisma } from '@prisma/client';

declare global {
  var prisma: PrismaClient | undefined;
}

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is not set in environment variables');
}

const prismaClientSingleton = () => {
  return new PrismaClient({
    log: [
      { level: 'query', emit: 'event' },
      { level: 'error', emit: 'event' },
      { level: 'info', emit: 'event' },
      { level: 'warn', emit: 'stdout' },
    ],
  });
};

const prisma = globalThis.prisma ?? prismaClientSingleton();

// Log all queries in development
if (process.env.NODE_ENV !== 'production') {
  prisma.$on('query', (e: Prisma.QueryEvent) => {
    console.log('Query:', e.query);
    console.log('Params:', e.params);
    console.log('Duration:', e.duration + 'ms');
  });
}

prisma.$on('error', (e: Prisma.LogEvent) => {
  console.error('Prisma Error:', e);
});

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma;
}

export { prisma };
export default prisma;
