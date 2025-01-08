import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = 'info@aianonymizer.com';
  const password = 'Traitor122478#';
  const hashedPassword = await bcrypt.hash(password, 10);

  // First, let's check if the user exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
    include: { subscription: true }
  });

  console.log('Existing user:', existingUser);

  // Create or update the admin user
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
    },
  });

  console.log('Admin user updated:', admin);

  // Ensure admin has a subscription
  const subscription = await prisma.subscription.upsert({
    where: { userId: admin.id },
    update: {
      tier: 'PREMIUM',
      status: 'active',
      monthlyLimit: 1000000,
      tokenLimit: 10000000
    },
    create: {
      userId: admin.id,
      tier: 'PREMIUM',
      status: 'active',
      monthlyLimit: 1000000,
      tokenLimit: 10000000
    },
  });

  console.log('Admin subscription:', subscription);

  // Verify the password works
  const verifyPassword = await bcrypt.compare(password, admin.password);
  console.log('Password verification:', verifyPassword);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
