export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { SubscriptionTier, UserStatus } from '@prisma/client';
import { sendVerificationEmail } from '@/lib/sendgrid';
import crypto from 'crypto';

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
    const verificationToken = crypto.randomBytes(32).toString('hex');

    try {
      // Create new user
      const user = await prisma.user.create({
        data: {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.toLowerCase().trim(),
          password: hashedPassword,
          verificationToken,
          status: UserStatus.PENDING_VERIFICATION,
          subscription: {
            create: {
              tier: SubscriptionTier.FREE,
              monthlyLimit: 1000,
              isActive: true,
              startDate: new Date(),
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
        await sendVerificationEmail(email.toLowerCase().trim(), verificationToken);
        console.log('Verification email sent successfully');
      } catch (emailError) {
        console.error('Error sending verification email:', emailError);
        return NextResponse.json({
          message: 'Account created but verification email failed to send',
          requiresVerification: true,
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            status: user.status,
            verificationToken: verificationToken
          }
        }, { status: 201 });
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
      console.error('Database error:', dbError);
      return NextResponse.json(
        { message: 'Error creating account' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { message: 'Error creating account' },
      { status: 500 }
    );
  }
}
