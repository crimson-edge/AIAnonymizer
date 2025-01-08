import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

// Acquire an available API key and create a session
export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Find an available API key (active and not in use)
    const availableKey = await prisma.apiKey.findFirst({
      where: {
        isActive: true,
        totalUsage: 0, // Only get unused keys
      },
    });

    if (!availableKey) {
      return NextResponse.json(
        { error: 'No API keys available' },
        { status: 503 }
      );
    }

    // Update the API key to mark it as in use
    await prisma.apiKey.update({
      where: { id: availableKey.id },
      data: { 
        totalUsage: 1,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      key: availableKey.key,
      keyId: availableKey.id,
    });
  } catch (error) {
    console.error('Error acquiring API key:', error);
    return NextResponse.json(
      { error: 'Failed to acquire API key' },
      { status: 500 }
    );
  }
}

// Release an API key
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { keyId } = await request.json();
    if (!keyId) {
      return NextResponse.json(
        { error: 'Key ID is required' },
        { status: 400 }
      );
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Find the key and verify it belongs to the user
    const key = await prisma.apiKey.findFirst({
      where: {
        id: keyId,
        userId: user.id,
      },
    });

    if (!key) {
      return NextResponse.json(
        { error: 'Key not found or unauthorized' },
        { status: 404 }
      );
    }

    // Release the API key
    await prisma.apiKey.update({
      where: { id: keyId },
      data: { 
        totalUsage: 0,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error releasing API key:', error);
    return NextResponse.json(
      { error: 'Failed to release API key' },
      { status: 500 }
    );
  }
}

// Update usage for a key
export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { keyId, tokensUsed } = await request.json();
    if (!keyId || typeof tokensUsed !== 'number') {
      return NextResponse.json(
        { error: 'Key ID and tokens used are required' },
        { status: 400 }
      );
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Update the key usage
    await prisma.apiKey.update({
      where: { id: keyId },
      data: { 
        totalUsage: {
          increment: tokensUsed
        },
        updatedAt: new Date(),
      },
    });

    // Record the usage
    await prisma.usage.create({
      data: {
        userId: user.id,
        type: 'groq',
        amount: 1,
        tokens: tokensUsed,
        cost: 0, // Calculate cost based on your pricing
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating key usage:', error);
    return NextResponse.json(
      { error: 'Failed to update key usage' },
      { status: 500 }
    );
  }
}
