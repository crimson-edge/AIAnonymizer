import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-08-16'
});

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await request.json();
    const { subscriptionId, tier } = body;

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { subscription: true }
    });

    if (!user) {
      return new NextResponse('User not found', { status: 404 });
    }

    // Verify subscription belongs to user
    if (!user.stripeCustomerId) {
      return new NextResponse('No active subscription', { status: 403 });
    }

    // Get current subscription
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    if (subscription.customer !== user.stripeCustomerId) {
      return new NextResponse('Invalid subscription', { status: 403 });
    }

    // Get new price ID based on tier
    const newPriceId = tier === 'BASIC' 
      ? process.env.STRIPE_BASIC_PRICE_ID
      : tier === 'PREMIUM'
      ? process.env.STRIPE_PREMIUM_PRICE_ID
      : null; // FREE tier means cancellation

    if (tier !== 'FREE' && !newPriceId) {
      return new NextResponse('Price ID not configured', { status: 500 });
    }

    if (tier === 'FREE') {
      // Cancel subscription at period end
      await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: true
      });
    } else {
      // Update subscription to new price
      await stripe.subscriptions.update(subscriptionId, {
        items: [{
          id: subscription.items.data[0].id,
          price: newPriceId!
        }],
        proration_behavior: 'always_invoice'
      });

      // Update subscription in database
      await prisma.subscription.update({
        where: { userId: user.id },
        data: {
          tier: tier,
          monthlyLimit: tier === 'BASIC' ? 10000 : tier === 'PREMIUM' ? 100000 : 1000
        }
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating subscription:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
