export const dynamic = 'force-dynamic';

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
      where: { email: session.user.email }
    });

    if (!user?.isAdmin) {
      return new NextResponse('Unauthorized', { status: 403 });
    }

    // Get all keys and their status
    const keys = await GroqKeyService.listKeys();

    return NextResponse.json({ keys });
  } catch (error) {
    console.error('Error getting API keys:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user?.isAdmin) {
      return new NextResponse('Unauthorized', { status: 403 });
    }

    const { key } = await req.json();
    
    if (!key || typeof key !== 'string') {
      return new NextResponse('Invalid key', { status: 400 });
    }

    const success = await GroqKeyService.addKey(key.trim());

    if (!success) {
      return new NextResponse('Key already exists or failed to add', { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error adding API key:', error);
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

    if (!user?.isAdmin) {
      return new NextResponse('Unauthorized', { status: 403 });
    }

    const { key } = await req.json();
    
    if (!key || typeof key !== 'string') {
      return new NextResponse('Invalid key', { status: 400 });
    }

    const success = await GroqKeyService.removeKey(key.trim());

    if (!success) {
      return new NextResponse('Key is in use or does not exist', { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing API key:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
