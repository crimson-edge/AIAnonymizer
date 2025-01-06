const { PrismaClient } = require('@prisma/client');

// Use production database URL if available
const databaseUrl = process.env.PROD_DATABASE_URL || process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error('No database URL provided');
  process.exit(1);
}

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: databaseUrl
    }
  }
});

async function main() {
  try {
    console.log('Using database URL:', databaseUrl.replace(/:[^:]+@/, ':****@'));
    
    // Check connection
    console.log('\nChecking database connection...');
    await prisma.$connect();
    console.log('Database connection successful');

    // Check if User table exists
    console.log('\nChecking User table...');
    const userTableExists = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'User'
      );
    `;
    console.log('User table exists:', userTableExists[0].exists);

    // Check if UserStatus enum exists
    console.log('\nChecking UserStatus enum...');
    const userStatusExists = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM pg_type 
        WHERE typname = 'userstatus'
      );
    `;
    console.log('UserStatus enum exists:', userStatusExists[0].exists);

    // Check if SubscriptionTier enum exists
    console.log('\nChecking SubscriptionTier enum...');
    const subscriptionTierExists = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM pg_type 
        WHERE typname = 'subscriptiontier'
      );
    `;
    console.log('SubscriptionTier enum exists:', subscriptionTierExists[0].exists);

    // List all users
    console.log('\nListing all users:');
    const users = await prisma.user.findMany({
      include: {
        subscription: true
      }
    });
    console.log('Total users:', users.length);
    users.forEach(user => {
      console.log({
        id: user.id,
        email: user.email,
        isAdmin: user.isAdmin,
        status: user.status,
        subscription: {
          tier: user.subscription?.tier,
          status: user.subscription?.status
        }
      });
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
