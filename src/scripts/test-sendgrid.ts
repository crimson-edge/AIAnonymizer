import sgMail from '@sendgrid/mail';
import dotenv from 'dotenv';

dotenv.config();

async function testSendGrid() {
  console.log('Environment variables:');
  console.log('SENDGRID_API_KEY:', process.env.SENDGRID_API_KEY ? 'Set' : 'Not set');
  console.log('NEXTAUTH_URL:', process.env.NEXTAUTH_URL);
  console.log('SMTP_FROM:', process.env.SMTP_FROM);

  if (!process.env.SENDGRID_API_KEY) {
    console.error('SENDGRID_API_KEY is not set!');
    return;
  }

  sgMail.setApiKey(process.env.SENDGRID_API_KEY);

  const msg = {
    to: 'info@aianonymizer.com',
    from: process.env.SMTP_FROM || 'support@aianonymizer.com',
    subject: 'SendGrid Test Email',
    text: 'This is a test email from AI Anonymizer',
    html: '<strong>This is a test email from AI Anonymizer</strong>',
  };

  try {
    const result = await sgMail.send(msg);
    console.log('Email sent successfully:', result);
  } catch (error) {
    console.error('Error sending email:', error);
    if (error.response) {
      console.error('SendGrid API response:', error.response.body);
    }
  }
}

testSendGrid();
