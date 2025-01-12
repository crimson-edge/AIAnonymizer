import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      console.error('No authenticated user found');
      return new NextResponse('Unauthorized', { status: 401 });
    }

    console.log('Fetching subscription for user:', session.user.email);

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { subscription: true }
    });

    console.log('Found user:', {
      id: user?.id,
      email: user?.email,
      stripeCustomerId: user?.stripeCustomerId,
      subscription: user?.subscription
    });

    if (!user?.subscription) {
      console.log('No subscription found, returning FREE tier');
      // Return default free tier if no subscription exists
      return NextResponse.json({
        tier: 'FREE',
        isActive: true,
        monthlyLimit: 10000,
        tokenLimit: 10000
      });
    }

    const response = {
      tier: user.subscription.tier,
      isActive: user.subscription.status === 'ACTIVE',
      stripeCustomerId: user.stripeCustomerId,
      stripeSubscriptionId: user.subscription.stripeId,
      monthlyLimit: user.subscription.monthlyLimit,
      currentPeriodEnd: user.subscription.currentPeriodEnd,
      status: user.subscription.status,
      tokenLimit: user.subscription.tokenLimit
    };

    console.log('Returning subscription data:', response);

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'no-store, must-revalidate',
        'Pragma': 'no-cache'
      }
    });
  } catch (error) {
    console.error('Error fetching subscription status:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
