const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@aianonymizer.com';
  const password = 'AdminPass123!';

  try {
    // Find admin user
    console.log('Looking up admin user...');
    const user = await prisma.user.findUnique({
      where: { email },
      include: { subscription: true }
    });

    if (!user) {
      console.log('Admin user not found');
      return;
    }

    console.log('Admin user found:', {
      id: user.id,
      email: user.email,
      isAdmin: user.isAdmin,
      status: user.status,
      subscription: {
        tier: user.subscription?.tier,
        monthlyLimit: user.subscription?.monthlyLimit,
        tokenLimit: user.subscription?.tokenLimit,
        status: user.subscription?.status
      }
    });

    // Test password
    console.log('\nTesting password...');
    const isValidPassword = await bcrypt.compare(password, user.password);
    console.log('Password is valid:', isValidPassword);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
