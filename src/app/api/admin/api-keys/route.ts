import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const keys = await prisma.apiKey.findMany({
      where: { userId: user.id },
      select: {
        id: true,
        key: true,
        isActive: true,
        createdAt: true,
        totalUsage: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({
      keys,
      total: keys.length,
    });
  } catch (error) {
    console.error('Error in GET /api/admin/api-keys:', error);
    return NextResponse.json(
      { error: 'Failed to fetch API keys' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    const { key } = body;

    if (!key || typeof key !== 'string') {
      return NextResponse.json(
        { error: 'Invalid key provided' },
        { status: 400 }
      );
    }

    const existingKey = await prisma.apiKey.findFirst({
      where: { key },
    });

    if (existingKey) {
      return NextResponse.json(
        { error: 'Key already exists' },
        { status: 400 }
      );
    }

    const newKey = await prisma.apiKey.create({
      data: {
        key,
        isActive: true,
        totalUsage: 0,
        user: {
          connect: {
            id: user.id,
          },
        },
      },
    });

    return NextResponse.json(newKey);
  } catch (error) {
    console.error('Error in POST /api/admin/api-keys:', error);
    return NextResponse.json(
      { error: 'Failed to create API key' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    const { key } = body;

    if (!key || typeof key !== 'string') {
      return NextResponse.json(
        { error: 'Invalid key provided' },
        { status: 400 }
      );
    }

    const existingKey = await prisma.apiKey.findFirst({
      where: { key, userId: user.id },
    });

    if (!existingKey) {
      return NextResponse.json(
        { error: 'Key not found' },
        { status: 404 }
      );
    }

    await prisma.apiKey.delete({
      where: { id: existingKey.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/admin/api-keys:', error);
    return NextResponse.json(
      { error: 'Failed to delete API key' },
      { status: 500 }
    );
  }
}
