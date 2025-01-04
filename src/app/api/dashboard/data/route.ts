import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return new NextResponse(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        subscription: true,
        Usage: true,
      },
    });

    if (!user) {
      return new NextResponse(
        JSON.stringify({ error: 'User not found' }),
        { status: 404 }
      );
    }

    const response = {
      usage: {
        used: user.Usage?.count || 0,
        total: user.subscription?.limit || 100,
      },
      subscription: {
        tier: user.subscription?.tier || 'FREE',
        isActive: user.subscription?.status === 'active',
        stripeCustomerId: user.stripeCustomerId,
        stripeSubscriptionId: user.subscription?.stripeSubscriptionId,
      },
    };

    return new NextResponse(JSON.stringify(response), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Dashboard data error:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500 }
    );
  }
}
