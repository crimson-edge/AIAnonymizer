import { PrismaClient } from '../prisma/generated/client/index.js';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = 'walt.rines@gmail.com';
  const tempPassword = 'ChangeMe123!';
  const hashedPassword = await bcrypt.hash(tempPassword, 10);

  try {
    const user = await prisma.user.upsert({
      where: { email },
      update: {
        isAdmin: true,
        password: hashedPassword,
        subscription: {
          upsert: {
            create: {
              tier: 'FREE',
              isActive: true,
              monthlyLimit: 1000,
              tokenLimit: 1000
            },
            update: {
              tier: 'FREE',
              isActive: true,
              monthlyLimit: 1000,
              tokenLimit: 1000
            }
          }
        }
      },
      create: {
        email,
        firstName: 'Walt',
        lastName: 'Rines',
        password: hashedPassword,
        isAdmin: true,
        subscription: {
          create: {
            tier: 'FREE',
            isActive: true,
            monthlyLimit: 1000,
            tokenLimit: 1000
          }
        }
      },
      include: {
        subscription: true
      }
    });

    console.log('User restored:', user);
    console.log('\nTemporary password:', tempPassword);
    console.log('Please change your password after logging in.');
  } catch (error) {
    console.error('Error restoring user:', error);
    process.exit(1);
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
