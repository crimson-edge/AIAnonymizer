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

    console.log('Fetching subscription for user:', session.user.email);

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { subscription: true }
    });

    console.log('Found user subscription:', user?.subscription);

    if (!user?.subscription) {
      console.log('No subscription found, returning FREE tier');
      // Return default free tier if no subscription exists
      return NextResponse.json({
        tier: 'FREE',
        isActive: true
      });
    }

    const response = {
      tier: user.subscription.tier,
      isActive: user.subscription.status === 'ACTIVE',
      stripeCustomerId: user.stripeCustomerId,
      stripeSubscriptionId: user.subscription.stripeId,
      monthlyLimit: user.subscription.monthlyLimit,
      currentPeriodEnd: user.subscription.currentPeriodEnd,
      status: user.subscription.status
    };

    console.log('Returning subscription data:', response);

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching subscription status:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
