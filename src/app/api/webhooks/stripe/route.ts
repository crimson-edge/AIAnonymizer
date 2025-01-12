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

export async function GET(req: Request) {
  return new Response('Stripe webhook endpoint is alive', { status: 200 });
}

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const signature = headers().get('stripe-signature');

    if (!signature) {
      console.error('No stripe signature found in webhook request');
      return new Response('No stripe signature found in request', { status: 400 });
    }

    console.log('Webhook received with signature:', signature.slice(-10));

    if (!webhookSecret) {
      console.error('Stripe webhook secret is not configured');
      return new Response('Webhook secret is not configured', { status: 500 });
    }

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('⚠️  Webhook signature verification failed.', err);
      return new Response(`Webhook signature verification failed: ${err instanceof Error ? err.message : 'Unknown error'}`, { status: 400 });
    }

    console.log('Received Stripe webhook event:', event.type);
    console.log('Full event data:', JSON.stringify(event.data.object, null, 2));

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const { userId, type } = session.metadata || {};

        if (!userId) {
          throw new Error('No userId in session metadata');
        }

        // Handle token purchase
        if (type === 'token_purchase') {
          const tokenAmount = parseInt(session.metadata?.tokenAmount || '0', 10);
          if (tokenAmount <= 0) {
            throw new Error('Invalid token amount');
          }

          const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { subscription: true },
          });

          if (!user?.subscription) {
            throw new Error('User subscription not found');
          }

          // Add tokens to user's total
          await prisma.subscription.update({
            where: { userId },
            data: {
              availableTokens: {
                increment: tokenAmount
              }
            }
          });

          console.log(`Added ${tokenAmount} tokens to user ${userId}`);
          break;
        }

        // Focus on the main subscription flow
        if (event.type === 'checkout.session.completed') {
          const session = event.data.object as Stripe.Checkout.Session;
          console.log('Checkout session completed:', {
            sessionId: session.id,
            customerId: session.customer,
            subscription: session.subscription,
            metadata: session.metadata,
            clientReferenceId: session.client_reference_id
          });

          if (!session.subscription) {
            console.error('No subscription found in session');
            return new Response('No subscription found in session', { status: 400 });
          }

          // Get the subscription details
          const subscriptionId = session.subscription as string;
          console.log('Retrieving subscription:', subscriptionId);
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          console.log('Full subscription details:', JSON.stringify(subscription, null, 2));

          const priceId = subscription.items.data[0].price.id;
          const userId = session.metadata?.userId || session.client_reference_id;
          const customerId = session.customer as string;

          console.log('Processing subscription update:', {
            subscriptionId,
            priceId,
            userId,
            customerId
          });

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
            // First verify the user exists
            const user = await prisma.user.findUnique({
              where: { id: userId },
              include: { subscription: true }
            });

            if (!user) {
              console.error('User not found:', userId);
              return new Response('User not found', { status: 404 });
            }

            console.log('Found user:', {
              id: user.id,
              email: user.email,
              currentSubscription: user.subscription
            });

            // Update the user's Stripe customer ID
            await prisma.user.update({
              where: { id: userId },
              data: { stripeCustomerId: customerId }
            });

            console.log('Updated user with Stripe customer ID:', customerId);

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

            // Verify the update worked
            const verifySubscription = await prisma.subscription.findUnique({
              where: { userId }
            });
            console.log('Verified subscription state:', verifySubscription);

          } catch (error) {
            console.error('Failed to update subscription in database:', error);
            throw error;
          }
        }

        return new Response('Webhook processed successfully', { status: 200 });
      }
      default:
        console.log(`Unhandled event type: ${event.type}`);
        return new Response('Unhandled event type', { status: 200 });
    }
  } catch (error) {
    console.error('Error processing webhook:', error);
    return new Response('Error processing webhook', { status: 500 });
  }
}
