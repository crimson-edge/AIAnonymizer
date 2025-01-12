export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { SubscriptionTier } from '@prisma/client';
import { sendVerificationEmail } from '@/lib/sendgrid';
import { subscriptionLimits } from '@/config/subscription-limits';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-08-16'
});

export async function POST(req: Request) {
  try {
    let body;
    try {
      body = await req.json();
      console.log('Received request body:', body);
    } catch (e) {
      console.error('JSON parse error:', e);
      return NextResponse.json(
        { message: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    const { firstName, lastName, email, password, selectedTier = 'FREE' } = body;

    if (!firstName || !lastName || !email || !password) {
      console.error('Missing fields:', { firstName, lastName, email, password: !!password });
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate tier
    if (!Object.values(SubscriptionTier).includes(selectedTier)) {
      return NextResponse.json(
        { message: 'Invalid subscription tier selected' },
        { status: 400 }
      );
    }

    // Check for existing user first
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (existingUser) {
      console.log('User already exists:', email);
      return NextResponse.json(
        { message: 'An account with this email already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // If user selected BASIC or PREMIUM, create a Stripe checkout session
    if (selectedTier !== 'FREE') {
      const priceId = selectedTier === 'BASIC' 
        ? process.env.NEXT_PUBLIC_STRIPE_BASIC_PRICE_ID 
        : process.env.NEXT_PUBLIC_STRIPE_PREMIUM_PRICE_ID;

      if (!priceId) {
        return NextResponse.json(
          { message: 'Invalid price ID for selected tier' },
          { status: 500 }
        );
      }

      // Create a customer in Stripe
      const customer = await stripe.customers.create({
        email: email.toLowerCase().trim(),
        name: `${firstName.trim()} ${lastName.trim()}`
      });

      // Create a checkout session
      const session = await stripe.checkout.sessions.create({
        customer: customer.id,
        line_items: [{ price: priceId, quantity: 1 }],
        mode: 'subscription',
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/complete-signup?session_id={CHECKOUT_SESSION_ID}&email=${encodeURIComponent(email)}&firstName=${encodeURIComponent(firstName)}&lastName=${encodeURIComponent(lastName)}&hashedPassword=${encodeURIComponent(hashedPassword)}&tier=${selectedTier}`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/signup?error=payment_cancelled`,
      });

      return NextResponse.json({
        checkoutUrl: session.url,
        sessionId: session.id
      });
    }

    // For FREE tier, create user immediately
    try {
      const user = await prisma.user.create({
        data: {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.toLowerCase().trim(),
          password: hashedPassword,
          status: 'PENDING_VERIFICATION',
          subscription: {
            create: {
              tier: SubscriptionTier.FREE,
              monthlyLimit: subscriptionLimits.FREE.monthlyTokens,
              availableTokens: subscriptionLimits.FREE.monthlyTokens,
              status: 'ACTIVE'
            }
          }
        },
        include: {
          subscription: true
        }
      });

      console.log('User created successfully:', user.id);

      try {
        await sendVerificationEmail(user.email!, user.id);
        console.log('Verification email sent successfully');
      } catch (emailError) {
        console.error('Error sending verification email:', emailError);
      }

      return NextResponse.json({
        message: 'Account created successfully',
        requiresVerification: true,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          status: user.status
        }
      }, { status: 201 });

    } catch (dbError) {
      console.error('Database error details:', dbError);
      return NextResponse.json(
        { message: 'Error creating user account' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
