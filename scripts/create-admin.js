const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  try {
    const adminEmail = 'info@aianonymizer.com';
    const adminPassword = 'Traitor122478#';
    
    // Create admin user
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    
    const admin = await prisma.user.upsert({
      where: { email: adminEmail },
      update: {
        isAdmin: true,
        password: hashedPassword,
        status: 'ACTIVE',
      },
      create: {
        email: adminEmail,
        firstName: 'Admin',
        lastName: 'User',
        password: hashedPassword,
        isAdmin: true,
        status: 'ACTIVE',
        subscription: {
          create: {
            tier: 'PREMIUM',
            monthlyLimit: 1000000,
            tokenLimit: 10000000,
            status: 'active'
          }
        }
      },
    });

    console.log('Admin user created/updated:', admin);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
