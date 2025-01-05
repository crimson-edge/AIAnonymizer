import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanupMigrations() {
  try {
    // Delete the failed migration record
    await prisma.$executeRaw`DELETE FROM "_prisma_migrations" WHERE migration_name = '20250105_fix_migration_history'`;
    
    console.log('Successfully cleaned up failed migration records');
  } catch (error) {
    console.error('Error cleaning up migrations:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupMigrations();
