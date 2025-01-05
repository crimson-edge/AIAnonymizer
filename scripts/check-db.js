const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const users = await prisma.user.findMany();
    console.log('Total users:', users.length);
    console.log('Users:', users.map(u => ({ id: u.id, email: u.email, isAdmin: u.isAdmin })));
  } catch (error) {
    console.error('Database error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
