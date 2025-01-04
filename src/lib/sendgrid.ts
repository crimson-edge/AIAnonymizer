import sgMail from '@sendgrid/mail';

export async function sendVerificationEmail(email: string, token: string) {
  console.log('Starting email verification process for:', email);
  
  if (!process.env.SENDGRID_API_KEY) {
    console.error('SENDGRID_API_KEY is not set in environment variables');
    throw new Error('Email service configuration error: SENDGRID_API_KEY not set');
  }

  if (!process.env.NEXTAUTH_URL) {
    console.error('NEXTAUTH_URL is not set in environment variables');
    throw new Error('Email service configuration error: NEXTAUTH_URL not set');
  }

  if (!process.env.SMTP_FROM) {
    console.warn('SMTP_FROM is not set, using default sender');
  }

  console.log('Setting SendGrid API key...');
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  
  const verificationUrl = `${process.env.NEXTAUTH_URL}/auth/verify-email?token=${token}`;
  console.log('Generated verification URL:', verificationUrl);
  
  const from = process.env.SMTP_FROM || 'support@aianonymizer.com';
  console.log('Sending from:', from);
  
  const msg = {
    to: email,
    from,
    subject: 'Verify your AI Anonymizer account',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Welcome to AI Anonymizer!</h2>
        <p>Thank you for signing up. Please verify your email address to get started.</p>
        <div style="margin: 30px 0;">
          <a href="${verificationUrl}" 
             style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Verify Email Address
          </a>
        </div>
        <p style="color: #666; font-size: 14px;">
          If you didn't create an account, you can safely ignore this email.
        </p>
        <p style="color: #666; font-size: 12px; margin-top: 20px;">
          If the button doesn't work, copy and paste this URL into your browser:<br>
          ${verificationUrl}
        </p>
      </div>
    `,
  };

  try {
    console.log('Attempting to send email...');
    const [response] = await sgMail.send(msg);
    console.log('SendGrid API Response:', {
      statusCode: response?.statusCode,
      headers: response?.headers,
    });
    
    if (response?.statusCode !== 202) {
      throw new Error(`Unexpected status code: ${response?.statusCode}`);
    }
    
    console.log('Email sent successfully');
    return true;
  } catch (error: any) {
    console.error('Detailed SendGrid error:', {
      error: error.toString(),
      response: error.response?.body,
      code: error.code,
      message: error.message
    });
    
    if (error.response?.body?.errors) {
      const errors = error.response.body.errors;
      throw new Error(`Failed to send verification email: ${errors.map((e: any) => e.message).join(', ')}`);
    }
    
    throw new Error(`Failed to send verification email: ${error.message}`);
  }
}
