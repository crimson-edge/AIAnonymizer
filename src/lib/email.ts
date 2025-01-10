import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: EmailOptions) {
  console.log('Starting email send process...');
  
  // Check all required environment variables
  const requiredVars = {
    SMTP_HOST: process.env.SMTP_HOST,
    SMTP_PORT: process.env.SMTP_PORT,
    SMTP_USER: process.env.SMTP_USER,
    SENDGRID_API_KEY: process.env.SENDGRID_API_KEY,
    SMTP_FROM: process.env.SMTP_FROM,
    SMTP_SECURE: process.env.SMTP_SECURE
  };

  console.log('Environment variables check:', {
    ...Object.keys(requiredVars).reduce((acc, key) => ({
      ...acc,
      [key]: !!requiredVars[key]
    }), {})
  });

  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SENDGRID_API_KEY || !process.env.SMTP_FROM) {
    console.error('Missing email configuration:', {
      host: !!process.env.SMTP_HOST,
      user: !!process.env.SMTP_USER,
      apiKey: !!process.env.SENDGRID_API_KEY,
      from: !!process.env.SMTP_FROM
    });
    throw new Error('Email service not properly configured');
  }

  const transportConfig = {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: 'apikey',
      pass: process.env.SENDGRID_API_KEY
    }
  };

  console.log('Creating transport with config:', {
    host: transportConfig.host,
    port: transportConfig.port,
    secure: transportConfig.secure,
    authUser: transportConfig.auth.user
  });

  const transporter = nodemailer.createTransport(transportConfig);

  try {
    // Verify transporter configuration
    console.log('Verifying transporter configuration...');
    await transporter.verify();
    console.log('Transporter verification successful');

    const mailOptions = {
      from: process.env.SMTP_FROM,
      to,
      subject,
      html,
    };

    console.log('Sending email with options:', {
      from: mailOptions.from,
      to: mailOptions.to,
      subject: mailOptions.subject
    });

    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', result.messageId);
    return result;
  } catch (error) {
    console.error('Failed to send email:', error);
    if (error instanceof Error) {
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
    }
    throw error;
  }
}
