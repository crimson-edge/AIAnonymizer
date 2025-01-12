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
  [SubscriptionTier.FREE]: { monthlyTokens: 1000, tokenLimit: 10000 },
  [SubscriptionTier.BASIC]: { monthlyTokens: 10000, tokenLimit: 100000 },
  [SubscriptionTier.PREMIUM]: { monthlyTokens: 100000, tokenLimit: 1000000 },
  [SubscriptionTier.ENTERPRISE]: { monthlyTokens: 1000000, tokenLimit: 10000000 },
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

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log('Checkout session completed:', {
          sessionId: session.id,
          customerId: session.customer,
          metadata: session.metadata,
          subscription: session.subscription
        });
        
        // Handle overage payment
        if (session.metadata?.type === 'overage') {
          return handleOveragePayment(session);
        }

        if (!session.subscription) {
          console.error('No subscription found in session');
          return new Response('No subscription found in session', { status: 400 });
        }

        // Get the subscription details
        const subscriptionId = session.subscription as string;
        console.log('Retrieving subscription:', subscriptionId);
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        console.log('Subscription details:', {
          id: subscription.id,
          status: subscription.status,
          items: subscription.items.data,
          customer: subscription.customer
        });
        
        const priceId = subscription.items.data[0].price.id;
        const userId = session.metadata?.userId || session.client_reference_id;
        const customerId = session.customer as string;

        if (!userId) {
          console.error('No userId found in session');
          return new Response('No userId found in session', { status: 400 });
        }

        console.log('Updating subscription for user:', {
          userId,
          customerId,
          priceId
        });

        // Map price IDs to subscription tiers
        const tierMap: Record<string, SubscriptionTier> = {
          [process.env.STRIPE_BASIC_PRICE_ID!]: SubscriptionTier.BASIC,
          [process.env.STRIPE_PREMIUM_PRICE_ID!]: SubscriptionTier.PREMIUM,
        };

        console.log('Price ID mapping:', {
          receivedPriceId: priceId,
          basicPriceIdLastFour: process.env.STRIPE_BASIC_PRICE_ID?.slice(-4),
          premiumPriceIdLastFour: process.env.STRIPE_PREMIUM_PRICE_ID?.slice(-4),
          matchesBasic: priceId === process.env.STRIPE_BASIC_PRICE_ID,
          matchesPremium: priceId === process.env.STRIPE_PREMIUM_PRICE_ID
        });

        const tier = tierMap[priceId];
        if (!tier) {
          console.error('Unknown price ID:', priceId, 'Available price IDs:', {
            basicLastFour: process.env.STRIPE_BASIC_PRICE_ID?.slice(-4),
            premiumLastFour: process.env.STRIPE_PREMIUM_PRICE_ID?.slice(-4),
            receivedLastFour: priceId?.slice(-4)
          });
          return new Response('Unknown price ID', { status: 400 });
        }

        console.log('Mapped tier:', tier);

        try {
          // First update the user's Stripe customer ID if not set
          await prisma.user.update({
            where: { id: userId },
            data: { stripeCustomerId: customerId }
          });

          // Then update or create the subscription
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
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
        const customerId = invoice.customer as string;

        // Get user by Stripe customer ID
        const user = await prisma.user.findFirst({
          where: { stripeCustomerId: customerId },
          include: { subscription: true }
        });

        if (!user) {
          console.error('User not found for customer:', customerId);
          return new Response('User not found', { status: 404 });
        }

        // If this is the final payment attempt, suspend the subscription
        if (invoice.next_payment_attempt === null) {
          await prisma.subscription.update({
            where: { userId: user.id },
            data: {
              status: 'SUSPENDED',
            },
          });
        }

        break;
      }

      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice;
        const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
        const customerId = invoice.customer as string;

        // Get user by Stripe customer ID
        const user = await prisma.user.findFirst({
          where: { stripeCustomerId: customerId },
          include: { subscription: true }
        });

        if (!user) {
          console.error('User not found for customer:', customerId);
          return new Response('User not found', { status: 404 });
        }

        // If subscription was suspended, reactivate it
        if (user.subscription?.status === 'SUSPENDED') {
          await prisma.subscription.update({
            where: { userId: user.id },
            data: {
              status: 'ACTIVE',
            },
          });
        }

        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const subscriptionId = subscription.id;
        const priceId = subscription.items.data[0].price.id;

        // Check if this is a scheduled downgrade completing
        const isScheduledDowngrade = subscription.metadata.scheduledChange === 'downgrade';
        const downgradeToTier = subscription.metadata.downgradeToTier;

        // Get the subscription from our database
        const dbSubscription = await prisma.subscription.findFirst({
          where: { stripeId: subscriptionId },
          include: { user: true }
        });

        if (!dbSubscription) {
          console.error('Subscription not found:', subscriptionId);
          return new Response('Subscription not found', { status: 404 });
        }

        const tierMap: Record<string, SubscriptionTier> = {
          [process.env.STRIPE_BASIC_PRICE_ID!]: SubscriptionTier.BASIC,
          [process.env.STRIPE_PREMIUM_PRICE_ID!]: SubscriptionTier.PREMIUM,
          [process.env.STRIPE_FREE_PRICE_ID!]: SubscriptionTier.FREE,
        };

        const tier = isScheduledDowngrade ? downgradeToTier as SubscriptionTier : tierMap[priceId];
        if (!tier && !isScheduledDowngrade) {
          console.error('Unknown price ID:', priceId);
          return new Response('Unknown price ID', { status: 400 });
        }

        // Update the subscription
        await prisma.subscription.update({
          where: { id: dbSubscription.id },
          data: {
            tier: tier || dbSubscription.tier, // Keep current tier if no new tier
            status: subscription.status === 'active' ? 'ACTIVE' : 'INACTIVE',
            monthlyLimit: tier ? subscriptionLimits[tier].monthlyTokens : dbSubscription.monthlyLimit,
            tokenLimit: tier ? subscriptionLimits[tier].tokenLimit : dbSubscription.tokenLimit,
            currentPeriodEnd: new Date(subscription.current_period_end * 1000)
          },
        });

        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const subscriptionId = subscription.id;

        // Find the subscription in our database
        const dbSubscription = await prisma.subscription.findFirst({
          where: { stripeId: subscriptionId }
        });

        if (!dbSubscription) {
          console.error('Subscription not found:', subscriptionId);
          return new Response('Subscription not found', { status: 404 });
        }

        // Update to FREE tier with INACTIVE status
        await prisma.subscription.update({
          where: { id: dbSubscription.id },
          data: {
            status: 'INACTIVE',
            tier: SubscriptionTier.FREE,
            monthlyLimit: subscriptionLimits[SubscriptionTier.FREE].monthlyTokens,
            tokenLimit: subscriptionLimits[SubscriptionTier.FREE].tokenLimit,
            stripeId: null // Remove the Stripe subscription ID
          },
        });

        break;
      }

      default:
        console.log('Unhandled event type:', event.type);
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return new Response('Webhook error', { status: 500 });
  }
}

async function handleOveragePayment(session: Stripe.Checkout.Session) {
  const userId = session.metadata.userId;
  if (!userId) {
    console.error('No userId found in overage session metadata');
    return new Response('No userId found in session metadata', { status: 400 });
  }

  // Add 100,000 tokens to the user's limit
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { subscription: true }
  });

  if (!user || !user.subscription) {
    console.error('User or subscription not found:', userId);
    return new Response('User or subscription not found', { status: 404 });
  }

  // Update user's token limit
  await prisma.subscription.update({
    where: { userId: user.id },
    data: {
      tokenLimit: {
        increment: 100000 // Add 100,000 tokens
      }
    }
  });
}
