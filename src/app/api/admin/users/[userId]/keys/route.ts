import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    // Check admin session
    const session = await getServerSession(authOptions);
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's API keys
    const userKeys = await prisma.apiKey.findMany({
      where: {
        userId: params.userId,
      },
      select: {
        id: true,
        key: true,
        name: true,
        createdAt: true,
        revokedAt: true,
        isActive: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // For security, only return partial key information
    const safeKeys = userKeys.map(key => ({
      ...key,
      key: `${key.key.substring(0, 8)}...${key.key.substring(key.key.length - 8)}`,
    }));

    return NextResponse.json(safeKeys);
  } catch (error) {
    console.error('Error fetching user API keys:', error);
    return NextResponse.json(
      { error: 'Failed to fetch API keys' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    // Check admin session
    const session = await getServerSession(authOptions);
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name } = await request.json();

    // Generate new API key
    const key = `ak_${Buffer.from(crypto.randomUUID()).toString('base64')}`;

    // Create new API key
    const apiKey = await prisma.apiKey.create({
      data: {
        key,
        name: name || 'API Key',
        userId: params.userId,
        isActive: true,
      },
    });

    return NextResponse.json({
      ...apiKey,
      key: `${key.substring(0, 8)}...${key.substring(key.length - 8)}`,
    });
  } catch (error) {
    console.error('Error creating API key:', error);
    return NextResponse.json(
      { error: 'Failed to create API key' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    // Check admin session
    const session = await getServerSession(authOptions);
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { keyId } = await request.json();

    // Delete API key
    await prisma.apiKey.delete({
      where: {
        id: keyId,
        userId: params.userId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting API key:', error);
    return NextResponse.json(
      { error: 'Failed to delete API key' },
      { status: 500 }
    );
  }
}
