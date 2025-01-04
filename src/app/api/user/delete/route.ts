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

    // Delete all related data first
    await prisma.$transaction([
      // Delete API keys
      prisma.apiKey.deleteMany({
        where: { userId }
      }),
      // Delete usage records
      prisma.usage.deleteMany({
        where: { userId }
      }),
      // Delete subscription
      prisma.subscription.delete({
        where: { userId }
      }).catch(() => {}), // Ignore if no subscription exists
      // Finally delete the user
      prisma.user.delete({
        where: { id: userId }
      })
    ]);

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting account:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
