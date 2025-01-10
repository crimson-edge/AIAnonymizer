import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: EmailOptions) {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SENDGRID_API_KEY || !process.env.SMTP_FROM) {
    console.error('Missing email configuration:', {
      host: !!process.env.SMTP_HOST,
      user: !!process.env.SMTP_USER,
      apiKey: !!process.env.SENDGRID_API_KEY,
      from: !!process.env.SMTP_FROM
    });
    throw new Error('Email service not properly configured');
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: 'apikey', // updated to 'apikey'
      pass: process.env.SENDGRID_API_KEY
    },
  });

  try {
    console.log('Initializing email transport with config:', {
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_SECURE,
      user: 'apikey' // updated to 'apikey'
    });

    const result = await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to,
      subject,
      html,
    });
    console.log('Email sent successfully:', result.messageId);
    return result;
  } catch (error) {
    console.error('Failed to send email:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
      console.error('Error stack:', error.stack);
    }
    throw error;
  }
}
