import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

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
      firstName: 'Admin',
      lastName: 'User',
      password: hashedPassword,
      isAdmin: true,
    },
  });

  console.log('Admin user created/updated:', admin.email);

  // Initialize Groq key pool if GROQ_API_KEYS is set
  const groqKeys = process.env.GROQ_API_KEYS ? JSON.parse(process.env.GROQ_API_KEYS) : [];
  
  for (const key of groqKeys) {
    await prisma.groqKeyPool.upsert({
      where: { key },
      update: {},
      create: {
        id: uuidv4(),
        key,
        isInUse: false,
        lastUsed: null,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });
  }

  console.log('Initialized Groq key pool with', groqKeys.length, 'keys');

  // Create subscription for admin
  await prisma.subscription.upsert({
    where: { userId: admin.id },
    update: {
      tier: 'PRO',
      status: 'active',
      monthlyLimit: 1000000,
      tokenLimit: 10000000
    },
    create: {
      userId: admin.id,
      tier: 'PRO',
      status: 'active',
      monthlyLimit: 1000000,
      tokenLimit: 10000000
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
