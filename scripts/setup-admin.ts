import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminEmail = 'info@aianonymizer.com';
  const adminPassword = 'Traitor122478#';
  
  // Create admin user
  const hashedPassword = await bcrypt.hash(adminPassword, 10);
  
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      isAdmin: true,
      password: hashedPassword,
    },
    create: {
      email: adminEmail,
      name: 'Admin User',
      password: hashedPassword,
      isAdmin: true,
    },
  });

  console.log('Admin user created/updated:', admin.email);

  // Initialize Groq key pool if GROQ_API_KEYS is set
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

  // Create subscription for admin
  await prisma.subscription.upsert({
    where: { userId: admin.id },
    update: {
      tier: 'PREMIUM',
      isActive: true,
    },
    create: {
      userId: admin.id,
      tier: 'PREMIUM',
      isActive: true,
    },
  });

  console.log('Admin subscription created/updated');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
