import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { GroqKeyService } from '@/lib/services/groqKeyService';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { subscription: true }
    });

    if (!user) {
      return new NextResponse('User not found', { status: 404 });
    }

    // Check if user already has an allocated key
    let key = await GroqKeyService.getKeyForUser(user.id);
    
    if (!key) {
      // Allocate a new key
      key = await GroqKeyService.allocateKey(
        user.id,
        user.subscription?.tier || 'FREE'
      );

      if (!key) {
        return new NextResponse('No available API keys', { status: 503 });
      }
    }

    return NextResponse.json({ key });
  } catch (error) {
    console.error('Error getting API key:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return new NextResponse('User not found', { status: 404 });
    }

    // Release the key
    await GroqKeyService.releaseKey(user.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error releasing API key:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
