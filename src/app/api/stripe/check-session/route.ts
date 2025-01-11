import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import Stripe from 'stripe';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Missing session_id parameter' },
        { status: 400 }
      );
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    // Check if the payment was successful and subscription is active
    if (session.payment_status === 'paid' && session.status === 'complete') {
      return NextResponse.json({ status: 'complete' });
    }

    // If payment failed or session expired
    if (session.status === 'expired' || session.payment_status === 'unpaid') {
      return NextResponse.json({ status: 'error' });
    }

    // Payment is still processing
    return NextResponse.json({ status: 'processing' });
  } catch (err) {
    console.error('Error checking session:', err);
    return NextResponse.json(
      { error: 'Error checking session status' },
      { status: 500 }
    );
  }
}
