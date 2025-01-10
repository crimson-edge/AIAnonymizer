import sgMail from '@sendgrid/mail';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: EmailOptions) {
  console.log('Starting email send process...');
  
  if (!process.env.SENDGRID_API_KEY) {
    console.error('SENDGRID_API_KEY is not set');
    throw new Error('Email service not properly configured: SENDGRID_API_KEY not set');
  }

  if (!process.env.SMTP_FROM) {
    console.error('SMTP_FROM is not set');
    throw new Error('Email service not properly configured: SMTP_FROM not set');
  }

  try {
    console.log('Setting SendGrid API key...');
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);

    const msg = {
      to,
      from: process.env.SMTP_FROM,
      subject,
      html,
    };

    console.log('Sending email with options:', {
      to: msg.to,
      from: msg.from,
      subject: msg.subject
    });

    const result = await sgMail.send(msg);
    console.log('Email sent successfully:', result[0].statusCode);
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
