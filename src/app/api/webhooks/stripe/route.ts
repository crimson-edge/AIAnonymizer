import { headers } from 'next/headers';
import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const signature = headers().get('stripe-signature')!;

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        webhookSecret
      );
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return new Response('Invalid signature', { status: 400 });
    }

    console.log('Received Stripe webhook event:', event.type);

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const customerId = session.customer as string;
        const subscriptionId = session.subscription as string;
        const userId = session.client_reference_id;

        if (!userId) {
          console.error('No user ID in session:', session.id);
          return new Response('No user ID', { status: 400 });
        }

        // Get subscription details
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const priceId = subscription.items.data[0].price.id;

        // Determine subscription type based on price ID
        const tier = priceId === process.env.STRIPE_BASIC_PRICE_ID ? 'basic' : 'premium';

        // Update user's subscription in database
        await prisma.subscription.upsert({
          where: { userId },
          create: {
            userId,
            stripeCustomerId: customerId,
            stripeSubscriptionId: subscriptionId,
            stripePriceId: priceId,
            tier,
            status: 'active'
          },
          update: {
            stripeCustomerId: customerId,
            stripeSubscriptionId: subscriptionId,
            stripePriceId: priceId,
            tier,
            status: 'active'
          }
        });

        break;
      }

      case 'customer.subscription.deleted':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const subscriptionId = subscription.id;

        // Find the user's subscription
        const dbSubscription = await prisma.subscription.findFirst({
          where: { stripeSubscriptionId: subscriptionId }
        });

        if (!dbSubscription) {
          console.error('No subscription found for:', subscriptionId);
          return new Response('No subscription found', { status: 404 });
        }

        if (event.type === 'customer.subscription.deleted') {
          // Cancel the subscription
          await prisma.subscription.update({
            where: { id: dbSubscription.id },
            data: { status: 'canceled' }
          });
        } else {
          // Update subscription status
          const status = subscription.status === 'active' ? 'active' : 'inactive';
          await prisma.subscription.update({
            where: { id: dbSubscription.id },
            data: { status }
          });
        }

        break;
      }
    }

    return new Response('Webhook processed', { status: 200 });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return new Response('Webhook error', { status: 500 });
  }
}
