const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@example.com';
  const password = 'AdminPass123!';

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // First, delete any existing user and subscription
    await prisma.subscription.deleteMany({
      where: {
        user: {
          email
        }
      }
    });
    
    await prisma.user.deleteMany({
      where: {
        email
      }
    });
    
    // Now create a fresh user with subscription
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        isAdmin: true,
        status: 'ACTIVE',
        firstName: 'Admin',
        lastName: 'User',
        subscription: {
          create: {
            tier: 'PREMIUM',
            monthlyLimit: 100000,
            tokenLimit: 1000000,
            status: 'active'
          }
        }
      },
      include: {
        subscription: true
      }
    });

    console.log('Admin user created:', {
      id: user.id,
      email: user.email,
      isAdmin: user.isAdmin,
      status: user.status,
      subscription: {
        tier: user.subscription.tier,
        monthlyLimit: user.subscription.monthlyLimit,
        tokenLimit: user.subscription.tokenLimit
      }
    });
    
    console.log('\nYou can now log in with:');
    console.log('Email:', email);
    console.log('Password:', password);
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
