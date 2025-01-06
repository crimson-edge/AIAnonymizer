import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    console.error('Missing userId in verification request');
    return new Response('Verification failed: Missing user ID', {
      status: 302,
      headers: {
        'Location': '/auth/error?error=missing_user_id'
      }
    });
  }

  try {
    // Find user by ID
    console.log('Looking up user:', userId);
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      console.error('User not found:', userId);
      return new Response('Verification failed: User not found', {
        status: 302,
        headers: {
          'Location': '/auth/error?error=user_not_found'
        }
      });
    }

    if (user.status !== 'PENDING_VERIFICATION') {
      console.log('User already verified:', userId);
      return new Response('User already verified', {
        status: 302,
        headers: {
          'Location': '/auth/signin?message=already_verified'
        }
      });
    }

    // Update user status
    console.log('Updating user status to ACTIVE:', userId);
    await prisma.user.update({
      where: { id: userId },
      data: {
        status: 'ACTIVE',
        emailVerified: new Date(),
      },
    });

    console.log('User verified successfully:', userId);
    return new Response('Email verified successfully', {
      status: 302,
      headers: {
        'Location': '/auth/signin?message=verification_success'
      }
    });
  } catch (error) {
    console.error('Email verification error:', error);
    return new Response('Verification failed: Internal error', {
      status: 302,
      headers: {
        'Location': '/auth/error?error=verification_failed'
      }
    });
  }
}
