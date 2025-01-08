import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { subscription: true }
    });

    if (!user) {
      return new NextResponse('User not found', { status: 404 });
    }

    if (!user.subscription || user.subscription.tier !== 'PREMIUM') {
      return new NextResponse('Only Pro subscribers can purchase overage tokens', { status: 403 });
    }

    // Create a Stripe Checkout session for the overage package
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: process.env.STRIPE_OVERAGE_PRICE_ID, // You'll need to add this to your .env
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXTAUTH_URL}/dashboard?overage=success`,
      cancel_url: `${process.env.NEXTAUTH_URL}/dashboard?overage=cancelled`,
      customer: user.stripeCustomerId || undefined,
      metadata: {
        userId: user.id,
        type: 'overage',
      },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error('Error creating overage checkout session:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
