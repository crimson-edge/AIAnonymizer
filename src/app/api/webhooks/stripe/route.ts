export const dynamic = 'force-dynamic';

import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';
import { SubscriptionTier } from '@prisma/client';
import { subscriptionLimits } from '@/config/subscription-limits';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-08-16'
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

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

    console.log('Received Stripe webhook. Verifying signature...');

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
      console.log('Webhook signature verified. Event type:', event.type);
    } catch (err) {
      console.error('⚠️  Webhook signature verification failed.', err);
      return new Response(`Webhook signature verification failed: ${err instanceof Error ? err.message : 'Unknown error'}`, { status: 400 });
    }

    console.log('Received Stripe webhook event:', event.type);

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log('Processing completed checkout session:', {
          sessionId: session.id,
          metadata: session.metadata
        });

        const userId = session.metadata?.userId;
        if (!userId) {
          throw new Error('No user ID in session metadata');
        }

        // Handle token purchase
        if (session.metadata?.type === 'token_purchase') {
          console.log('Processing token purchase webhook:', {
            userId,
            metadata: session.metadata,
            eventType: event.type
          });

          const tokenAmount = parseInt(session.metadata?.tokenAmount || '0', 10);
          console.log('Token amount to add:', tokenAmount);
          
          if (tokenAmount <= 0) {
            console.error('Invalid token amount:', tokenAmount);
            throw new Error('Invalid token amount');
          }

          try {
            // Get current subscription for logging
            const beforeSubscription = await prisma.subscription.findUnique({
              where: { userId },
              select: { availableTokens: true }
            });
            console.log('Before update - available tokens:', beforeSubscription?.availableTokens);

            // Increment the available tokens
            const updatedSubscription = await prisma.subscription.update({
              where: { userId },
              data: {
                availableTokens: {
                  increment: tokenAmount
                }
              },
              select: { availableTokens: true }
            });

            console.log('After update - available tokens:', updatedSubscription.availableTokens);
            console.log(`Successfully added ${tokenAmount} tokens to user ${userId}`);
          } catch (error) {
            console.error('Error updating subscription tokens:', error);
            throw error;
          }
          break;
        }

        // Handle subscription checkout
        if (!session.subscription) {
          console.error('No subscription found in session');
          return new Response('No subscription found in session', { status: 400 });
        }

        const subscriptionId = session.subscription as string;
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const priceId = subscription.items.data[0].price.id;
        const customerId = session.customer as string;

        // Map price IDs to subscription tiers
        const tierMap: Record<string, SubscriptionTier> = {
          [process.env.STRIPE_BASIC_PRICE_ID!]: SubscriptionTier.BASIC,
          [process.env.STRIPE_PREMIUM_PRICE_ID!]: SubscriptionTier.PREMIUM,
        };

        const tier = tierMap[priceId];
        if (!tier) {
          console.error('Unknown price ID:', priceId);
          return new Response('Unknown price ID', { status: 400 });
        }

        // Update user and subscription
        await prisma.$transaction(async (tx) => {
          // Update user's Stripe customer ID
          await tx.user.update({
            where: { id: userId },
            data: { stripeCustomerId: customerId }
          });

          // Update subscription
          await tx.subscription.create({
            data: {
              userId,
              tier,
              availableTokens: subscriptionLimits[tier].monthlyTokens,
              stripeId: subscriptionId,
              status: 'active'
            }
          });
        });

        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const stripeCustomerId = subscription.customer as string;

        // Find user by Stripe customer ID
        const user = await prisma.user.findFirst({
          where: { stripeCustomerId },
          include: { subscription: true }
        });

        if (!user) {
          console.error('User not found for subscription deletion:', stripeCustomerId);
          return new Response('User not found', { status: 404 });
        }

        // Downgrade to FREE tier
        await prisma.subscription.update({
          where: { userId: user.id },
          data: {
            tier: SubscriptionTier.FREE,
            stripeId: null,
            status: 'active',
            availableTokens: subscriptionLimits.FREE.monthlyTokens
          }
        });

        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const stripeCustomerId = subscription.customer as string;
        const priceId = subscription.items.data[0].price.id;

        // Map price IDs to subscription tiers
        const tierMap: Record<string, SubscriptionTier> = {
          [process.env.STRIPE_BASIC_PRICE_ID!]: SubscriptionTier.BASIC,
          [process.env.STRIPE_PREMIUM_PRICE_ID!]: SubscriptionTier.PREMIUM,
        };

        const tier = tierMap[priceId];
        if (!tier) {
          console.error('Unknown price ID:', priceId);
          return new Response('Unknown price ID', { status: 400 });
        }

        // Find user by Stripe customer ID
        const user = await prisma.user.findFirst({
          where: { stripeCustomerId },
          include: { subscription: true }
        });

        if (!user) {
          console.error('User not found for subscription update:', stripeCustomerId);
          return new Response('User not found', { status: 404 });
        }

        // Update subscription
        await prisma.subscription.update({
          where: { userId: user.id },
          data: {
            tier,
            availableTokens: subscriptionLimits[tier].monthlyTokens,
            stripeId: subscription.id,
            status: subscription.status === 'active' ? 'active' : 'inactive'
          }
        });

        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response('Webhook processed successfully', { status: 200 });
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(
      'Webhook handler failed: ' + (error instanceof Error ? error.message : 'Unknown error'),
      { status: 500 }
    );
  }
}
