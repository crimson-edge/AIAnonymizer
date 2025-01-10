import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PUT(
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

    const { isAdmin } = await request.json();
    if (typeof isAdmin !== 'boolean') {
      return new NextResponse('Invalid admin status', { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: params.userId },
      data: { isAdmin },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Error updating admin status:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
