const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  // Read from environment variables or use defaults
  const email = process.env.ADMIN_EMAIL || 'admin@aianonymizer.com';
  const password = process.env.ADMIN_PASSWORD || 'AdminPass123!';

  try {
    console.log('Hashing password...');
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('Password hashed successfully');
    
    // First, delete any existing user and subscription
    console.log('Deleting existing user and subscription...');
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
    console.log('Existing user and subscription deleted');
    
    // Now create a fresh user with subscription
    console.log('Creating new admin user...');
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

    // Verify the password can be compared
    console.log('Verifying password hash...');
    const isValidPassword = await bcrypt.compare(password, user.password);
    console.log('Password verification result:', isValidPassword);

    console.log('Admin user created:', {
      id: user.id,
      email: user.email,
      isAdmin: user.isAdmin,
      status: user.status,
      passwordLength: user.password?.length,
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
