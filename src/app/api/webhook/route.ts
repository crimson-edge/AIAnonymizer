import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia'
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
      console.error('Webhook signature verification failed:', err);
      return new NextResponse('Invalid signature', { status: 400 });
    }

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const { userId, type, tokenAmount } = session.metadata || {};

        if (!userId) {
          console.error('No userId in session metadata');
          return new NextResponse('Missing userId', { status: 400 });
        }

        if (type === 'subscription') {
          // Handle subscription payment
          const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
          const priceId = subscription.items.data[0].price.id;

          const tier = priceId === process.env.STRIPE_PREMIUM_PRICE_ID ? 'PREMIUM' : 'BASIC';

          await prisma.subscription.upsert({
            where: { userId },
            create: {
              userId,
              tier,
              stripeSubscriptionId: subscription.id,
              currentPeriodEnd: new Date(subscription.current_period_end * 1000),
            },
            update: {
              tier,
              stripeSubscriptionId: subscription.id,
              currentPeriodEnd: new Date(subscription.current_period_end * 1000),
            },
          });
        } else if (type === 'token_purchase' && tokenAmount) {
          // Handle token purchase
          const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { subscription: true },
          });

          if (!user?.subscription) {
            console.error('User has no subscription');
            return new NextResponse('User has no subscription', { status: 400 });
          }

          const tokens = parseInt(tokenAmount);
          await prisma.subscription.update({
            where: { userId },
            data: {
              additionalTokens: {
                increment: tokens
              }
            }
          });
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const priceId = subscription.items.data[0].price.id;
        const userId = subscription.metadata.userId;

        if (!userId) {
          console.error('No userId in subscription metadata');
          return new NextResponse('Missing userId', { status: 400 });
        }

        const tier = priceId === process.env.STRIPE_PREMIUM_PRICE_ID ? 'PREMIUM' : 'BASIC';

        await prisma.subscription.update({
          where: { userId },
          data: {
            tier,
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          },
        });
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata.userId;

        if (!userId) {
          console.error('No userId in subscription metadata');
          return new NextResponse('Missing userId', { status: 400 });
        }

        await prisma.subscription.update({
          where: { userId },
          data: {
            tier: 'FREE',
            stripeSubscriptionId: null,
            currentPeriodEnd: new Date(),
          },
        });
        break;
      }
    }

    return new NextResponse('Webhook processed', { status: 200 });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return new NextResponse('Webhook error', { status: 500 });
  }
}
