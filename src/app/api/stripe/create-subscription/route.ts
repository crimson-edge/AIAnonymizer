import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { SubscriptionTier } from '@prisma/client';
import { subscriptionLimits } from '@/config/subscription-limits';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { priceId } = await request.json();
    if (!priceId) {
      return NextResponse.json({ error: 'Price ID is required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { subscription: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (!user.emailVerified) {
      return NextResponse.json(
        { error: 'Please verify your email before upgrading' },
        { status: 403 }
      );
    }

    // Determine new tier
    const newTier = priceId === process.env.STRIPE_BASIC_PRICE_ID
      ? SubscriptionTier.BASIC
      : priceId === process.env.STRIPE_PREMIUM_PRICE_ID
        ? SubscriptionTier.PREMIUM
        : null;

    if (!newTier) {
      return NextResponse.json({ error: 'Invalid price ID' }, { status: 400 });
    }

    // Check if this is an upgrade or downgrade
    const currentTier = user.subscription?.tier || SubscriptionTier.FREE;
    const isUpgrade = (
      (currentTier === SubscriptionTier.FREE && newTier !== SubscriptionTier.FREE) ||
      (currentTier === SubscriptionTier.BASIC && newTier === SubscriptionTier.PREMIUM)
    );
    const isDowngrade = (
      (currentTier === SubscriptionTier.PREMIUM && (newTier === SubscriptionTier.BASIC || newTier === SubscriptionTier.FREE)) ||
      (currentTier === SubscriptionTier.BASIC && newTier === SubscriptionTier.FREE)
    );

    // If user has an existing subscription in Stripe
    if (user.subscription?.stripeId) {
      // For downgrades, schedule the change for the next billing cycle
      if (isDowngrade) {
        const subscription = await stripe.subscriptions.retrieve(user.subscription.stripeId);
        
        // Schedule the update for the end of the current period
        await stripe.subscriptions.update(user.subscription.stripeId, {
          cancel_at_period_end: true,
          metadata: {
            downgradeToTier: newTier,
            scheduledChange: 'downgrade'
          }
        });

        // Update local subscription status
        await prisma.subscription.update({
          where: { userId: user.id },
          data: {
            status: 'SCHEDULED_DOWNGRADE',
          },
        });

        return NextResponse.json({ 
          message: 'Downgrade scheduled for next billing cycle',
          scheduledChange: true 
        });
      }

      // For upgrades, create an immediate checkout session
      const stripeSession = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'subscription',
        customer: user.stripeCustomerId!,
        billing_address_collection: 'required',
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        allow_promotion_codes: true,
        subscription_data: {
          metadata: {
            userId: user.id,
            tier: newTier,
            type: 'upgrade'
          }
        },
        metadata: {
          userId: user.id,
          tier: newTier,
          type: 'upgrade'
        },
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?upgrade=success`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
      });

      return NextResponse.json({ sessionId: stripeSession.id });
    }

    // For new subscriptions (from FREE tier)
    const stripeSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      customer_email: user.email,
      billing_address_collection: 'required',
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      allow_promotion_codes: true,
      subscription_data: {
        metadata: {
          userId: user.id,
          tier: newTier,
          type: 'new'
        }
      },
      metadata: {
        userId: user.id,
        tier: newTier,
        type: 'new'
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?upgrade=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
    });

    // Update subscription status to pending
    await prisma.subscription.update({
      where: { userId: user.id },
      data: {
        status: 'PENDING_PAYMENT',
      },
    });

    return NextResponse.json({ sessionId: stripeSession.id });
  } catch (err) {
    console.error('Error creating subscription:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Error creating subscription' },
      { status: 500 }
    );
  }
}
