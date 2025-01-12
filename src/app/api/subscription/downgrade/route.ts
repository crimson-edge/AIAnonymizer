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

    // Get the current subscription from Stripe
    const subscription = await stripe.subscriptions.retrieve(user.subscription.stripeId);
    const currentPeriodEnd = new Date(subscription.current_period_end * 1000);

    // For downgrade to Basic, update the subscription to the Basic price at period end
    if (tier === 'BASIC' && user.subscription.tier === 'PREMIUM') {
      const basicPriceId = process.env.NEXT_PUBLIC_STRIPE_BASIC_PRICE_ID;
      if (!basicPriceId) {
        return NextResponse.json(
          { error: 'Basic tier price not configured' },
          { status: 500 }
        );
      }

      await stripe.subscriptions.update(user.subscription.stripeId, {
        cancel_at_period_end: false,
        proration_behavior: 'none',
        items: [{
          id: subscription.items.data[0].id,
          price: basicPriceId,
        }],
        metadata: {
          tier: 'BASIC'
        }
      });
    } else if (tier === 'FREE') {
      // For downgrade to Free, cancel the subscription at period end
      await stripe.subscriptions.update(user.subscription.stripeId, {
        cancel_at_period_end: true,
      });
    }

    // Update the subscription status in the database
    await prisma.subscription.update({
      where: { userId: user.id },
      data: {
        status: 'SCHEDULED_DOWNGRADE',
        tier: tier as SubscriptionTier,
      },
    });

    return NextResponse.json({
      message: 'Subscription scheduled for downgrade',
      currentPeriodEnd: currentPeriodEnd.toISOString(),
      newTier: tier
    });
  } catch (err) {
    console.error('Error downgrading subscription:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Error downgrading subscription' },
      { status: 500 }
    );
  }
}
