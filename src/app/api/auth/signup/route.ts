export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { SubscriptionTier } from '@prisma/client';
import { sendVerificationEmail } from '@/lib/sendgrid';
import crypto from 'crypto';
import { subscriptionLimits } from '@/config/subscription-limits';

export async function POST(req: Request) {
  try {
    // Parse JSON body
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

    const { firstName, lastName, email, password } = body;

    if (!firstName || !lastName || !email || !password) {
      console.error('Missing fields:', { firstName, lastName, email, password: !!password });
      return NextResponse.json(
        { message: 'Missing required fields' },
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

    try {
      // Create new user
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

      // Send verification email
      try {
        await sendVerificationEmail(user.email!, user.id);
        console.log('Verification email sent successfully');
      } catch (emailError) {
        console.error('Error sending verification email:', emailError);
        // Don't fail if email sending fails
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
      console.error('Database error details:', {
        name: dbError.name,
        message: dbError.message,
        code: dbError.code,
        stack: dbError.stack
      });
      return NextResponse.json(
        { message: 'Error creating account: ' + dbError.message },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Signup error details:', {
      name: error.name,
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    return NextResponse.json(
      { message: 'Error creating account: ' + error.message },
      { status: 500 }
    );
  }
}
