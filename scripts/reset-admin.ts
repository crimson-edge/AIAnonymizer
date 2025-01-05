import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminEmail = 'info@aianonymizer.com';

  // First, find the existing admin user
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
    include: { subscription: true }
  });

  if (existingAdmin) {
    // Delete subscription first
    if (existingAdmin.subscription) {
      await prisma.subscription.delete({
        where: { id: existingAdmin.subscription.id }
      });
      console.log('Deleted existing subscription');
    }

    // Then delete the user
    await prisma.user.delete({
      where: { id: existingAdmin.id }
    });
    console.log('Deleted existing admin user');
  }

  // Create a new admin user with a simple password
  const hashedPassword = await bcrypt.hash('admin123!', 10);
  
  const admin = await prisma.user.create({
    data: {
      email: adminEmail,
      firstName: 'Admin',
      lastName: 'User',
      password: hashedPassword,
      isAdmin: true,
      subscription: {
        create: {
          tier: 'PRO',
          isActive: true,
        }
      }
    },
    include: { subscription: true }
  });

  console.log('Created new admin user:', admin);

  // Verify the password works
  const isValid = await bcrypt.compare('admin123!', admin.password);
  console.log('Password verification:', isValid);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
