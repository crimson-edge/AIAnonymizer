import { PrismaClient } from '@prisma/client';

async function checkAdmin() {
  const prisma = new PrismaClient();
  
  try {
    console.log('Checking admin users...');
    const adminUsers = await prisma.user.findMany({
      where: {
        isAdmin: true
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        isAdmin: true,
        status: true
      }
    });
    
    console.log('Admin users:', JSON.stringify(adminUsers, null, 2));
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('Error:', error);
    await prisma.$disconnect();
  }
}

checkAdmin();
