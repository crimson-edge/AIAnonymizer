import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'admin', 10);
  
  const admin = await prisma.user.upsert({
    where: { email: process.env.ADMIN_EMAIL || 'admin@aianonymizer.com' },
    update: {},
    create: {
      email: process.env.ADMIN_EMAIL || 'admin@aianonymizer.com',
      name: 'Admin User',
      password: hashedPassword,
      role: 'admin',
    },
  });

  console.log('Created admin user:', admin.email);

  // Initialize Groq key pool
  const groqKeys = process.env.GROQ_API_KEYS ? JSON.parse(process.env.GROQ_API_KEYS) : [];
  
  for (const key of groqKeys) {
    await prisma.groqKey.upsert({
      where: { key },
      update: {},
      create: {
        key,
        isInUse: false,
      },
    });
  }

  console.log('Initialized Groq key pool with', groqKeys.length, 'keys');

  // Create free subscription for admin
  await prisma.subscription.upsert({
    where: { userId: admin.id },
    update: {},
    create: {
      userId: admin.id,
      plan: 'admin',
      status: 'active',
    },
  });

  console.log('Created admin subscription');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
