import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@example.com';
  const password = 'admin123'; // Change this to a secure password

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    
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
        firstName: 'Admin',
        lastName: 'User'
      }
    });

    console.log('Admin user created:', {
      id: user.id,
      email: user.email,
      isAdmin: user.isAdmin
    });
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
