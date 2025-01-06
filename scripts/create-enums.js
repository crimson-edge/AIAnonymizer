const { PrismaClient } = require('@prisma/client');

// Use production database URL
const databaseUrl = 'postgresql://postgres.wopagkahtonshjzrooqk:BqLnp32h5Is2I2Tl@aws-0-us-west-1.pooler.supabase.com:5432/postgres?sslmode=require&ssl=true&connection_limit=5';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: databaseUrl
    }
  }
});

async function main() {
  try {
    console.log('Creating enums...');

    // Create UserStatus enum
    await prisma.$executeRaw`
      DO $$ BEGIN
        CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'PENDING_VERIFICATION');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `;
    console.log('Created UserStatus enum');

    // Create SubscriptionTier enum
    await prisma.$executeRaw`
      DO $$ BEGIN
        CREATE TYPE "SubscriptionTier" AS ENUM ('FREE', 'BASIC', 'PREMIUM', 'PRO', 'ENTERPRISE');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `;
    console.log('Created SubscriptionTier enum');

    console.log('Successfully created enums');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
