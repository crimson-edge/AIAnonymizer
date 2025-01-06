import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

async function checkAdmin() {
  const prisma = new PrismaClient();
  
  try {
    console.log('Checking admin users...');
    const adminUsers = await prisma.user.findMany({
      where: {
        isAdmin: true
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        isAdmin: true,
        status: true,
        subscription: true
      }
    });
    
    console.log('Admin users:', JSON.stringify(adminUsers, null, 2));

    // If no admin users exist, create one
    if (adminUsers.length === 0) {
      console.log('No admin users found. Creating admin user...');
      
      const hashedPassword = await bcrypt.hash('AdminPass123!', 10);
      const adminUser = await prisma.user.create({
        data: {
          email: 'admin@aianonymizer.com',
          password: hashedPassword,
          isAdmin: true,
          status: 'ACTIVE',
          firstName: 'Admin',
          lastName: 'User',
          subscription: {
            create: {
              tier: 'PREMIUM',
              status: 'active',
              monthlyLimit: -1, // Unlimited
              tokenLimit: -1, // Unlimited
              stripeId: 'admin_unlimited',
              currentPeriodEnd: new Date('2099-12-31') // Far future
            }
          }
        },
        include: {
          subscription: true
        }
      });
      
      console.log('Created admin user:', JSON.stringify(adminUser, null, 2));
    } else {
      // Check if existing admin users have subscriptions
      for (const adminUser of adminUsers) {
        if (!adminUser.subscription) {
          console.log(`Admin user ${adminUser.email} has no subscription. Creating one...`);
          await prisma.subscription.create({
            data: {
              userId: adminUser.id,
              tier: 'PREMIUM',
              status: 'active',
              monthlyLimit: -1, // Unlimited
              tokenLimit: -1, // Unlimited
              stripeId: 'admin_unlimited',
              currentPeriodEnd: new Date('2099-12-31') // Far future
            }
          });
          console.log(`Created subscription for ${adminUser.email}`);
        }
      }
    }
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('Error:', error);
    await prisma.$disconnect();
  }
}

checkAdmin();
