import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const userId = session.user.id;

    // Delete all related data in a transaction
    await prisma.$transaction(async (tx) => {
      // Delete API keys
      await tx.apiKey.deleteMany({
        where: { userId }
      });

      // Delete usage records
      await tx.usage.deleteMany({
        where: { userId }
      });

      // Delete subscription if exists
      const subscription = await tx.subscription.findUnique({
        where: { userId }
      });
      
      if (subscription) {
        await tx.subscription.delete({
          where: { userId }
        });
      }

      // Finally delete the user
      await tx.user.delete({
        where: { id: userId }
      });
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting account:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
