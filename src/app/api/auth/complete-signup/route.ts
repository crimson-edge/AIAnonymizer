import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { SubscriptionTier } from '@prisma/client';
import { subscriptionLimits } from '@/config/subscription-limits';
import { sendVerificationEmail } from '@/lib/sendgrid';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-08-16'
});

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('session_id');
    const email = searchParams.get('email');
    const firstName = searchParams.get('firstName');
    const lastName = searchParams.get('lastName');
    const hashedPassword = searchParams.get('hashedPassword');
    const tier = searchParams.get('tier') as SubscriptionTier;

    if (!sessionId || !email || !firstName || !lastName || !hashedPassword || !tier) {
      return NextResponse.json(
        { message: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Verify the checkout session was successful
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status !== 'paid') {
      return NextResponse.json(
        { message: 'Payment not completed' },
        { status: 400 }
      );
    }

    // Create the user with their paid subscription
    const user = await prisma.user.create({
      data: {
        firstName: decodeURIComponent(firstName),
        lastName: decodeURIComponent(lastName),
        email: decodeURIComponent(email).toLowerCase(),
        password: decodeURIComponent(hashedPassword),
        status: 'PENDING_VERIFICATION',
        subscription: {
          create: {
            tier,
            availableTokens: subscriptionLimits[tier].monthlyTokens,
            stripeId: session.subscription as string,
            status: 'active'
          }
        }
      },
      include: {
        subscription: true
      }
    });

    try {
      await sendVerificationEmail(user.email!, user.id);
    } catch (emailError) {
      console.error('Error sending verification email:', emailError);
    }

    // Redirect to success page
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/signup/success?email=${encodeURIComponent(user.email)}`
    );
  } catch (error) {
    console.error('Complete signup error:', error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/signup?error=completion_failed`
    );
  }
}
