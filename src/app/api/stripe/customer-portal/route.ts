import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { subscription: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (!user.stripeCustomerId) {
      // Create a Stripe customer if they don't have one
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

    const config: { configuration?: string } = {};
    if (process.env.STRIPE_PORTAL_CONFIGURATION_ID) {
      config.configuration = process.env.STRIPE_PORTAL_CONFIGURATION_ID;
    }

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
      ...config
    });

    return NextResponse.json({ url: portalSession.url });
  } catch (err) {
    console.error('Error creating customer portal session:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Error creating portal session' },
      { status: 500 }
    );
  }
}
