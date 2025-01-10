import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const admin = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { isAdmin: true },
    });

    if (!admin?.isAdmin) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: params.userId },
    });

    if (!user) {
      return new NextResponse('User not found', { status: 404 });
    }

    // Delete all related records first
    await prisma.$transaction([
      // Delete user's API keys
      prisma.apiKey.deleteMany({
        where: { userId: params.userId },
      }),
      // Delete user's activity records
      prisma.userActivity.deleteMany({
        where: { userId: params.userId },
      }),
      // Delete user's subscription if it exists
      prisma.subscription.deleteMany({
        where: { userId: params.userId },
      }),
      // Finally delete the user
      prisma.user.delete({
        where: { id: params.userId },
      }),
    ]);

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting user:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
