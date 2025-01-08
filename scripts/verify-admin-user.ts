import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminEmail = 'info@aianonymizer.com';
  const adminPassword = 'Traitor122478#';

  // Find the admin user
  const admin = await prisma.user.findUnique({
    where: { email: adminEmail },
    include: { subscription: true }
  });

  console.log('Admin user:', admin);

  if (admin) {
    // Test password
    const isPasswordValid = await bcrypt.compare(adminPassword, admin.password);
    console.log('Password valid:', isPasswordValid);

    if (!isPasswordValid) {
      // Update password
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      const updatedAdmin = await prisma.user.update({
        where: { email: adminEmail },
        data: {
          password: hashedPassword,
          isAdmin: true,
        },
      });
      console.log('Updated admin password');
    }
  } else {
    console.log('Admin user not found');
    // Create admin user
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    const newAdmin = await prisma.user.create({
      data: {
        email: adminEmail,
        firstName: 'Admin',
        lastName: 'User',
        password: hashedPassword,
        isAdmin: true,
        subscription: {
          create: {
            tier: 'PREMIUM',
            status: 'active',
            monthlyLimit: 1000000,
            tokenLimit: 10000000
          }
        }
      },
      include: { subscription: true }
    });
    console.log('Created new admin user:', newAdmin);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
