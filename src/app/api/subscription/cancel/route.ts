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
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
      include: { subscription: true }
    });

    if (!user) {
      return new NextResponse('User not found', { status: 404 });
    }

    if (!user.stripeCustomerId) {
      return new NextResponse('No active subscription', { status: 400 });
    }

    // Get all subscriptions for the customer
    const subscriptions = await stripe.subscriptions.list({
      customer: user.stripeCustomerId,
      status: 'active'
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
        isActive: false,
        endDate: new Date()
      }
    });

    return new NextResponse('Subscription cancelled successfully');
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    return new NextResponse('Error cancelling subscription', { status: 500 });
  }
}
