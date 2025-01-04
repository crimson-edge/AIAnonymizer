import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testConnection() {
  try {
    console.log('Attempting to connect to database...');
    await prisma.$connect();
    console.log('Successfully connected to database');
    
    // Try a simple query
    const userCount = await prisma.user.count();
    console.log('Current user count:', userCount);
    
    await prisma.$disconnect();
    console.log('Successfully disconnected from database');
  } catch (error) {
    console.error('Error:', {
      message: error.message,
      code: error.code,
      meta: error.meta
    });
  }
}

testConnection();
