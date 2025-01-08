import { NextResponse } from 'next/server';
import { groqClient } from '@/lib/groq/client/GroqClient';
import { SubscriptionTier } from '@prisma/client';

export async function POST(req: Request) {
  const startTime = Date.now();
  
  try {
    console.log('Received anonymization request');
    const body = await req.json();
    const { text, userId, tier } = body;

    console.log('Request parameters:', {
      textLength: text?.length,
      userId,
      tier,
    });

    if (!text || typeof text !== 'string') {
      console.warn('Invalid input received:', { text });
      return NextResponse.json(
        { error: 'Invalid input', message: 'Text is required and must be a string' },
        { status: 400 }
      );
    }

    if (text.length > 32000) {
      console.warn('Text too long:', { length: text.length });
      return NextResponse.json(
        { error: 'Invalid input', message: 'Text exceeds maximum length of 32,000 characters' },
        { status: 400 }
      );
    }

    console.log('Calling groqClient.anonymize');
    const anonymizedText = await groqClient.anonymize({
      userId: userId || 'test-user',
      tier: (tier as SubscriptionTier) || 'FREE',
      text
    });

    const duration = Date.now() - startTime;
    console.log('Anonymization successful', { 
      duration,
      inputLength: text.length,
      outputLength: anonymizedText.length 
    });

    return NextResponse.json({ 
      result: anonymizedText,
      stats: {
        processingTime: duration,
        inputLength: text.length,
        outputLength: anonymizedText.length
      }
    });

  } catch (error) {
    const duration = Date.now() - startTime;
    console.error('Anonymization error:', {
      error,
      duration,
      stack: error instanceof Error ? error.stack : undefined
    });

    if (error instanceof Error) {
      if (error.message.includes('Rate limit exceeded')) {
        return NextResponse.json(
          { 
            error: 'Rate limit exceeded', 
            message: error.message,
            retryAfter: 60 // suggest retry after 1 minute
          },
          { status: 429 }
        );
      }
      
      if (error.message.includes('Invalid response from AI service')) {
        return NextResponse.json(
          { 
            error: 'Service error', 
            message: 'Failed to process text',
            retryable: true
          },
          { status: 502 }
        );
      }

      if (error.message.includes('Failed to get API key')) {
        return NextResponse.json(
          { 
            error: 'Service unavailable', 
            message: 'No available API keys',
            retryable: true
          },
          { status: 503 }
        );
      }
    }

    return NextResponse.json(
      { 
        error: 'Internal server error', 
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
        retryable: true
      },
      { status: 500 }
    );
  }
}