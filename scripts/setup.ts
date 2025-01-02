import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

async function main() {
  // Delete existing users and subscriptions
  await prisma.subscription.deleteMany();
  await prisma.user.deleteMany();

  // Create admin user
  const email = 'info@aianonymizer.com';
  const password = 'admin123!';
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email,
      name: 'Admin User',
      password: hashedPassword,
      isAdmin: true,
    },
  });

  console.log('Created admin user:', {
    id: user.id,
    email: user.email,
    isAdmin: user.isAdmin,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
