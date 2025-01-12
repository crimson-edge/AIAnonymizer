import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { stripe } from '@/lib/stripe';
import prisma from '@/lib/prisma';
import { SubscriptionTier } from '@prisma/client';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { tier } = body;

    if (tier !== 'FREE' && tier !== 'BASIC') {
      return NextResponse.json({ error: 'Invalid tier' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { subscription: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (!user.subscription?.stripeId) {
      return NextResponse.json({ error: 'No active subscription' }, { status: 400 });
    }

    // Cancel the subscription at period end
    await stripe.subscriptions.update(user.subscription.stripeId, {
      cancel_at_period_end: true,
    });

    // Update the subscription status in the database
    await prisma.subscription.update({
      where: { userId: user.id },
      data: {
        status: 'SCHEDULED_DOWNGRADE',
        tier: tier as SubscriptionTier,
      },
    });

    return NextResponse.json({ message: 'Subscription scheduled for downgrade' });
  } catch (err) {
    console.error('Error downgrading subscription:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Error downgrading subscription' },
      { status: 500 }
    );
  }
}
