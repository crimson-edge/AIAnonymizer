import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { UserStatus } from '@prisma/client';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  if (!token) {
    return new NextResponse('Missing verification token', { status: 400 });
  }

  try {
    // Find user with matching verification token
    const user = await prisma.user.findUnique({
      where: { verificationToken: token }
    });

    if (!user) {
      return new NextResponse('Invalid verification token', { status: 400 });
    }

    // Update user as verified
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: new Date(),
        verificationToken: null,
        status: UserStatus.ACTIVE // Change status to ACTIVE
      }
    });

    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Email verified successfully'
    });
  } catch (error) {
    console.error('Error verifying email:', error);
    return NextResponse.json({
      success: false,
      message: 'Error verifying email'
    }, { status: 500 });
  }
}
