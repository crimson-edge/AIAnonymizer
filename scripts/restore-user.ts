import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = 'walt.rines@gmail.com';
  // You'll need to reset your password since we can't recover the original hash
  const temporaryPassword = 'ChangeMe123!'; 

  try {
    const hashedPassword = await bcrypt.hash(temporaryPassword, 10);
    
    const user = await prisma.user.upsert({
      where: { email },
      update: {
        isAdmin: true,
        password: hashedPassword
      },
      create: {
        email,
        password: hashedPassword,
        isAdmin: true,
        firstName: 'Walt',
        lastName: 'Rines',
        subscription: {
          create: {
            tier: 'PREMIUM',
            monthlyLimit: 1000,
            tokenLimit: 1000,
            isActive: true
          }
        }
      }
    });

    console.log('User restored:', {
      id: user.id,
      email: user.email,
      isAdmin: user.isAdmin
    });
    
    console.log('\nTemporary password:', temporaryPassword);
    console.log('Please change your password after logging in.');
    
  } catch (error) {
    console.error('Error restoring user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
