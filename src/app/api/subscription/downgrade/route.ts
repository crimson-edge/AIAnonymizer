import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-08-16'
});

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await req.json();
    const { targetTier } = body;

    if (!['FREE', 'BASIC'].includes(targetTier)) {
      return new NextResponse('Invalid target tier', { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { subscription: true }
    });

    if (!user) {
      return new NextResponse('User not found', { status: 404 });
    }

    if (!user.subscription?.stripeSubscriptionId) {
      return new NextResponse('No active subscription', { status: 400 });
    }

    if (targetTier === 'FREE') {
      // Cancel subscription at period end
      await stripe.subscriptions.update(user.subscription.stripeSubscriptionId, {
        cancel_at_period_end: true
      });

      return NextResponse.json({
        message: 'Subscription will be cancelled at the end of the billing period'
      });
    } else {
      // Downgrade to BASIC
      const subscription = await stripe.subscriptions.retrieve(user.subscription.stripeSubscriptionId);
      await stripe.subscriptions.update(user.subscription.stripeSubscriptionId, {
        items: [{
          id: subscription.items.data[0].id,
          price: process.env.STRIPE_BASIC_PRICE_ID
        }],
        proration_behavior: 'always_invoice'
      });

      return NextResponse.json({
        message: 'Subscription downgraded to Basic'
      });
    }
  } catch (error) {
    console.error('Error downgrading subscription:', error);
    return new NextResponse('Error downgrading subscription', { status: 500 });
  }
}
