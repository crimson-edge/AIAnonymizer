import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { stripe } from '@/lib/stripe';
import prisma from '@/lib/prisma';
import { SubscriptionTier } from '@prisma/client';

export async function POST(request: Request) {
  try {
    const authSession = await getServerSession(authOptions);
    if (!authSession?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: authSession.user.email },
      include: { subscription: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user is on premium tier
    if (!user.subscription || user.subscription.tier !== SubscriptionTier.PREMIUM) {
      return NextResponse.json(
        { error: 'Token purchase is only available for premium subscribers' },
        { status: 403 }
      );
    }

    if (!user.stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          userId: user.id
        }
      });

      await prisma.user.update({
        where: { id: user.id },
        data: { stripeCustomerId: customer.id }
      });

      user.stripeCustomerId = customer.id;
    }

    const priceId = process.env.STRIPE_OVERAGE_PRICE_ID;
    if (!priceId) {
      return NextResponse.json(
        { error: 'Token purchase price not configured' },
        { status: 500 }
      );
    }

    const checkoutSession = await stripe.checkout.sessions.create({
      customer: user.stripeCustomerId,
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?purchase=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?purchase=cancelled`,
      metadata: {
        userId: user.id,
        type: 'token_purchase'
      },
    });

    return NextResponse.json({ sessionId: checkoutSession.id });
  } catch (err) {
    console.error('Error creating token purchase session:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Error creating purchase session' },
      { status: 500 }
    );
  }
}
