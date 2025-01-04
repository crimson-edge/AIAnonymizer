import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { subscription: true }
    });

    if (!user?.subscription) {
      // Return default free tier if no subscription exists
      return NextResponse.json({
        tier: 'FREE',
        isActive: true
      });
    }

    return NextResponse.json({
      tier: user.subscription.tier,
      isActive: user.subscription.isActive,
      endDate: user.subscription.endDate
    });
  } catch (error) {
    console.error('Error fetching subscription status:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
