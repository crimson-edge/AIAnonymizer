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

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(32).toString('hex');

    try {
      // Check for existing user first
      const existingUser = await prisma.user.findUnique({
        where: { email: email.toLowerCase().trim() },
      });

      if (existingUser) {
        // Delete existing user and related records
        await prisma.$transaction([
          prisma.subscription.deleteMany({ where: { userId: existingUser.id } }),
          prisma.apiKey.deleteMany({ where: { userId: existingUser.id } }),
          prisma.usage.deleteMany({ where: { userId: existingUser.id } }),
          prisma.user.delete({ where: { id: existingUser.id } })
        ]);
      }

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

      // Send verification email
      try {
        await sendVerificationEmail(email.toLowerCase().trim(), verificationToken);
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
          status: user.status,
          verificationToken: verificationToken
        }
      }, { status: 201 });

    } catch (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { message: 'Error creating account' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
