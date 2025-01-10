import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/email';
import { generateResetToken } from '@/lib/auth/server-utils';

export async function POST(req: Request) {
  try {
    if (!req.body) {
      return NextResponse.json(
        { error: 'Request body is missing' },
        { status: 400 }
      );
    }

    const { email } = await req.json();
    console.log('Processing password reset for email:', email);

    // Validate email
    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    // Find user with this email
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        resetToken: true,
        resetTokenExpiry: true
      }
    });

    if (!user) {
      console.log('User not found, returning success to prevent enumeration');
      return NextResponse.json({ success: true });
    }

    // Generate reset token and expiry (24 hours)
    const resetToken = generateResetToken();
    const resetTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);
    console.log('Generated reset token:', resetToken);

    try {
      // Update user with reset token
      await prisma.user.update({
        where: { id: user.id },
        data: {
          resetToken,
          resetTokenExpiry,
        },
      });
    } catch (dbError) {
      console.error('Database error updating reset token:', dbError);
      return NextResponse.json(
        { error: 'Database error' },
        { status: 500 }
      );
    }

    // Send reset email
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
    console.log('Environment check:', {
      SMTP_HOST: process.env.SMTP_HOST,
      SMTP_USER: process.env.SMTP_USER,
      SMTP_FROM: process.env.SMTP_FROM,
      hasApiKey: !!process.env.SENDGRID_API_KEY,
      baseUrl: baseUrl
    });
    
    if (!baseUrl) {
      console.error('NEXT_PUBLIC_BASE_URL is not configured');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`;
    console.log('Reset URL:', resetUrl);

    try {
      console.log('Attempting to send email to:', email);
      const emailResult = await sendEmail({
        to: email,
        subject: 'Reset Your Password - AI Anonymizer',
        html: `
          <p>Hello,</p>
          <p>You requested to reset your password. Click the link below to set a new password:</p>
          <p><a href="${resetUrl}">Reset Password</a></p>
          <p>This link will expire in 24 hours.</p>
          <p>If you didn't request this, please ignore this email.</p>
        `,
      });
      console.log('Reset email sent successfully:', emailResult);
    } catch (emailError) {
      console.error('Email sending error:', emailError);
      if (emailError instanceof Error) {
        console.error('Error details:', emailError.message, emailError.stack);
      }
      // Revert the reset token if email fails
      try {
        await prisma.user.update({
          where: { id: user.id },
          data: {
            resetToken: null,
            resetTokenExpiry: null,
          },
        });
      } catch (revertError) {
        console.error('Failed to revert reset token:', revertError);
      }
      return NextResponse.json(
        { error: 'Email service not configured correctly' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Password reset error:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message, error.stack);
    }
    return NextResponse.json(
      { error: 'Failed to process password reset request' },
      { status: 500 }
    );
  }
}
