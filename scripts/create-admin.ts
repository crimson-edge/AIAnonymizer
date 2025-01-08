import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@aionymizer.com';
  const password = 'AdminPass123!'; // More secure password

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = await prisma.user.upsert({
      where: { email },
      update: {
        isAdmin: true,
        password: hashedPassword,
        subscription: {
          upsert: {
            create: {
              tier: 'PREMIUM',
              monthlyLimit: 1000000,
              tokenLimit: 10000000,
              status: 'active'
            },
            update: {
              tier: 'PREMIUM',
              monthlyLimit: 1000000,
              tokenLimit: 10000000,
              status: 'active'
            }
          }
        }
      },
      create: {
        email,
        password: hashedPassword,
        isAdmin: true,
        firstName: 'Admin',
        lastName: 'User',
        subscription: {
          create: {
            tier: 'PREMIUM',
            monthlyLimit: 1000000,
            tokenLimit: 10000000,
            status: 'active'
          }
        }
      }
    });

    console.log('Admin user created:', {
      id: user.id,
      email: user.email,
      isAdmin: user.isAdmin
    });
    
    console.log('\nYou can now log in with:');
    console.log('Email:', email);
    console.log('Password:', password);
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
