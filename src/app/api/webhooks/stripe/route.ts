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
        
        // Handle overage payment
        if (session.metadata?.type === 'overage') {
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

          break;
        }

        // Handle regular subscription
        const subscriptionId = session.subscription as string;
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
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

        const customerId = session.customer as string;
        const userId = session.client_reference_id;

        if (!userId) {
          console.error('No client_reference_id found in session');
          return new Response('No client_reference_id found in session', { status: 400 });
        }

        await prisma.subscription.upsert({
          where: { userId },
          create: {
            userId,
            stripeId: subscriptionId,
            tier,
            status: 'ACTIVE',
            monthlyLimit: tier === SubscriptionTier.BASIC ? 10000 : 100000,
            tokenLimit: tier === SubscriptionTier.BASIC ? 100000 : 1000000,
            currentPeriodEnd: new Date(subscription.current_period_end * 1000)
          },
          update: {
            stripeId: subscriptionId,
            tier,
            status: 'ACTIVE',
            monthlyLimit: tier === SubscriptionTier.BASIC ? 10000 : 100000,
            tokenLimit: tier === SubscriptionTier.BASIC ? 100000 : 1000000,
            currentPeriodEnd: new Date(subscription.current_period_end * 1000)
          },
        });

        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const subscriptionId = subscription.id;
        const priceId = subscription.items.data[0].price.id;

        const tierMap: Record<string, SubscriptionTier> = {
          [process.env.STRIPE_BASIC_PRICE_ID!]: SubscriptionTier.BASIC,
          [process.env.STRIPE_PREMIUM_PRICE_ID!]: SubscriptionTier.PREMIUM,
        };

        const tier = tierMap[priceId];
        if (!tier) {
          console.error('Unknown price ID:', priceId);
          return new Response('Unknown price ID', { status: 400 });
        }

        await prisma.subscription.updateMany({
          where: { stripeId: subscriptionId },
          data: {
            tier,
            status: subscription.status === 'active' ? 'ACTIVE' : 'inactive',
            monthlyLimit: tier === SubscriptionTier.BASIC ? 10000 : 100000,
            tokenLimit: tier === SubscriptionTier.BASIC ? 100000 : 1000000,
            currentPeriodEnd: new Date(subscription.current_period_end * 1000)
          },
        });

        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const subscriptionId = subscription.id;

        await prisma.subscription.updateMany({
          where: { stripeId: subscriptionId },
          data: {
            status: 'inactive',
          },
        });

        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return new Response('Webhook error', { status: 500 });
  }
}
