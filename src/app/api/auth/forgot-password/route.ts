import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/email';
import { randomBytes } from 'crypto';
import { addDays } from 'date-fns';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    console.log('Received forgot password request for:', email);

    if (!email) {
      console.log('No email provided');
      return new NextResponse('Email is required', { status: 400 });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    });

    console.log('User found:', !!user);

    if (!user) {
      // For security, don't reveal if user exists
      return NextResponse.json({ 
        success: true,
        message: 'If an account exists with this email, a reset link will be sent.' 
      });
    }

    // Generate reset token
    const resetToken = randomBytes(32).toString('hex');
    const resetTokenExpiry = addDays(new Date(), 1);

    console.log('Generated reset token and expiry');

    // Save reset token to user
    try {
      await prisma.user.update({
        where: { email },
        data: {
          resetToken,
          resetTokenExpiry
        }
      });
      console.log('Reset token saved to user');
    } catch (error) {
      console.error('Error saving reset token:', error);
      throw error;
    }

    // Send reset email
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://aianonymizer.com';
    console.log('Environment check:', {
      SENDGRID_API_KEY: !!process.env.SENDGRID_API_KEY,
      SMTP_FROM: !!process.env.SMTP_FROM,
      baseUrl
    });
    
    const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`;
    console.log('Reset URL generated:', resetUrl);

    try {
      console.log('Attempting to send password reset email to:', email);
      await sendEmail({
        to: email,
        subject: 'Reset Your Password - AI Anonymizer',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">Reset Your Password</h2>
            <p>You requested to reset your password. Click the button below to set a new password:</p>
            <div style="margin: 30px 0;">
              <a href="${resetUrl}" 
                 style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Reset Password
              </a>
            </div>
            <p style="color: #666; font-size: 14px;">
              This link will expire in 24 hours. If you didn't request this, please ignore this email.
            </p>
            <p style="color: #666; font-size: 12px; margin-top: 20px;">
              If the button doesn't work, copy and paste this URL into your browser:<br>
              ${resetUrl}
            </p>
          </div>
        `,
      });
      console.log('Reset email sent successfully');
      
      return NextResponse.json({ 
        success: true,
        message: 'If an account exists with this email, a reset link will be sent.' 
      });
    } catch (error) {
      console.error('Error sending reset email:', error);
      
      // Revert the reset token if email fails
      try {
        await prisma.user.update({
          where: { email },
          data: {
            resetToken: null,
            resetTokenExpiry: null
          }
        });
        console.log('Reset token reverted due to email failure');
      } catch (revertError) {
        console.error('Error reverting reset token:', revertError);
      }
      
      throw error;
    }
  } catch (error) {
    console.error('Forgot password error:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}
