import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { stripe } from '@/lib/stripe';
import prisma from '@/lib/prisma';

const TOKEN_AMOUNT = 500000; // 500k tokens

export async function POST() {
  try {
    const authSession = await getServerSession(authOptions);
    if (!authSession?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: authSession.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price: process.env.STRIPE_OVERAGE_PRICE_ID,
          quantity: 1,
        }
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?purchase=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?purchase=cancelled`,
      metadata: {
        userId: user.id,
        type: 'token_purchase',
        tokenAmount: TOKEN_AMOUNT.toString()
      }
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error('Error creating token purchase session:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create purchase session' },
      { status: 500 }
    );
  }
}
