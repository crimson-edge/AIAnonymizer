import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { SubscriptionTier } from '@prisma/client';
import { sendVerificationEmail } from '@/lib/sendgrid';
import { subscriptionLimits } from '@/config/subscription-limits';

export async function POST(request: Request) {
  try {
    const { priceId, email, firstName, lastName, password } = await request.json();
    
    console.log('Received request with priceId:', priceId);
    console.log('Environment variables:', {
      basicPriceId: process.env.STRIPE_BASIC_PRICE_ID,
      premiumPriceId: process.env.STRIPE_PREMIUM_PRICE_ID
    });

    if (!priceId || !email || !firstName || !lastName || !password) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Determine subscription tier from priceId
    const tier = priceId === process.env.STRIPE_BASIC_PRICE_ID
      ? SubscriptionTier.BASIC
      : priceId === process.env.STRIPE_PREMIUM_PRICE_ID
        ? SubscriptionTier.PREMIUM
        : SubscriptionTier.FREE;

    console.log('Determined tier:', tier);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user with PENDING_VERIFICATION status and correct subscription tier
    const user = await prisma.user.create({
      data: {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        status: 'PENDING_VERIFICATION',
        subscription: {
          create: {
            tier,
            status: 'PENDING_PAYMENT',
            monthlyLimit: subscriptionLimits[tier].monthlyTokens,
            tokenLimit: subscriptionLimits[tier].monthlyTokens,
          }
        }
      },
      include: {
        subscription: true,
      },
    });

    console.log('Created user:', { id: user.id, tier });

    // Send verification email
    await sendVerificationEmail(user.email!, user.id);

    // Create the checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      billing_address_collection: 'required',
      customer_email: email,
      client_reference_id: user.id,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      allow_promotion_codes: true,
      metadata: {
        userId: user.id,
        tier: tier,
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/auth/signup/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
    });

    console.log('Created Stripe session:', session.id);

    return NextResponse.json({ sessionId: session.id });
  } catch (err) {
    console.error('Error creating checkout session:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Error creating checkout session' },
      { status: 500 }
    );
  }
}
