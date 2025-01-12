export const dynamic = 'force-dynamic';

import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';
import { SubscriptionTier } from '@prisma/client';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-08-16'
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

const subscriptionLimits: Record<SubscriptionTier, { monthlyTokens: number; tokenLimit: number }> = {
  FREE: { monthlyTokens: 1000, tokenLimit: 10000 },
  BASIC: { monthlyTokens: 10000, tokenLimit: 100000 },
  PREMIUM: { monthlyTokens: 100000, tokenLimit: 1000000 },
  ENTERPRISE: { monthlyTokens: 1000000, tokenLimit: 10000000 },
};

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const signature = headers().get('stripe-signature')!;

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('⚠️  Webhook signature verification failed.', err);
      return new Response('Webhook signature verification failed.', { status: 400 });
    }

    console.log('Received Stripe webhook event:', event.type);

    // Focus on the main subscription flow
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      console.log('Checkout session completed:', {
        sessionId: session.id,
        customerId: session.customer,
        subscription: session.subscription
      });

      if (!session.subscription) {
        console.error('No subscription found in session');
        return new Response('No subscription found in session', { status: 400 });
      }

      // Get the subscription details
      const subscriptionId = session.subscription as string;
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      const priceId = subscription.items.data[0].price.id;
      const userId = session.metadata?.userId || session.client_reference_id;
      const customerId = session.customer as string;

      if (!userId) {
        console.error('No userId found in session');
        return new Response('No userId found in session', { status: 400 });
      }

      // Map price IDs to subscription tiers
      const tierMap: Record<string, SubscriptionTier> = {
        [process.env.STRIPE_BASIC_PRICE_ID!]: SubscriptionTier.BASIC,
        [process.env.STRIPE_PREMIUM_PRICE_ID!]: SubscriptionTier.PREMIUM,
      };

      console.log('Price ID mapping:', {
        receivedPriceId: priceId,
        basicPriceId: process.env.STRIPE_BASIC_PRICE_ID,
        premiumPriceId: process.env.STRIPE_PREMIUM_PRICE_ID,
        matchesBasic: priceId === process.env.STRIPE_BASIC_PRICE_ID,
        matchesPremium: priceId === process.env.STRIPE_PREMIUM_PRICE_ID
      });

      const tier = tierMap[priceId];
      if (!tier) {
        console.error('Unknown price ID:', priceId);
        return new Response('Unknown price ID', { status: 400 });
      }

      console.log('Updating subscription for user:', {
        userId,
        customerId,
        tier
      });

      try {
        // Update the user's Stripe customer ID
        await prisma.user.update({
          where: { id: userId },
          data: { stripeCustomerId: customerId }
        });

        // Update or create the subscription
        const updatedSubscription = await prisma.subscription.upsert({
          where: { userId },
          create: {
            userId,
            tier,
            stripeId: subscriptionId,
            status: 'ACTIVE',
            monthlyLimit: subscriptionLimits[tier].monthlyTokens,
            tokenLimit: subscriptionLimits[tier].tokenLimit,
            currentPeriodEnd: new Date(subscription.current_period_end * 1000)
          },
          update: {
            tier,
            stripeId: subscriptionId,
            status: 'ACTIVE',
            monthlyLimit: subscriptionLimits[tier].monthlyTokens,
            tokenLimit: subscriptionLimits[tier].tokenLimit,
            currentPeriodEnd: new Date(subscription.current_period_end * 1000)
          }
        });

        console.log('Successfully updated subscription:', updatedSubscription);
      } catch (error) {
        console.error('Failed to update subscription in database:', error);
        throw error;
      }
    }

    return new Response('Webhook processed successfully', { status: 200 });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return new Response('Error processing webhook', { status: 500 });
  }
}
