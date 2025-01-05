import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import Stripe from 'stripe';
import { SubscriptionTier } from '@prisma/client';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-08-16'
});

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
      include: {
        subscription: true,
      },
    });

    if (!user) {
      return new NextResponse('User not found', { status: 404 });
    }

    if (!user.stripeCustomerId) {
      return new NextResponse('No active subscription', { status: 400 });
    }

    // Get all active subscriptions
    const subscriptions = await stripe.subscriptions.list({
      customer: user.stripeCustomerId,
      status: 'active',
    });

    if (subscriptions.data.length === 0) {
      return new NextResponse('No active subscription found', { status: 400 });
    }

    // Cancel all active subscriptions
    for (const subscription of subscriptions.data) {
      await stripe.subscriptions.cancel(subscription.id);
    }

    // Update subscription in database
    await prisma.subscription.update({
      where: { userId: user.id },
      data: {
        tier: SubscriptionTier.FREE,
        status: 'ACTIVE',
        currentPeriodEnd: new Date(),
        monthlyLimit: 10000, 
        tokenLimit: 100000, 
      },
    });

    return new NextResponse('Subscription downgraded successfully');
  } catch (error) {
    console.error('Error downgrading subscription:', error);
    return new NextResponse('Error downgrading subscription', { status: 500 });
  }
}
