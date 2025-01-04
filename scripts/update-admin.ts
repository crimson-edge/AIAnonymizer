import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = 'info@aianonymizer.com';
  const password = 'Traitor122478#';
  const hashedPassword = await bcrypt.hash(password, 10);
  
  const admin = await prisma.user.upsert({
    where: { email },
    update: {
      password: hashedPassword,
      isAdmin: true,
    },
    create: {
      email,
      firstName: 'Admin',
      lastName: 'User',
      password: hashedPassword,
      isAdmin: true,
      subscription: {
        create: {
          tier: 'PREMIUM',
          isActive: true,
        }
      }
    },
  });

  console.log('Admin user updated:', admin.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
