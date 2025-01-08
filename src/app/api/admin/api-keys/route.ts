import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

// Only admin users can access this API
async function isAdmin(session: any) {
  if (!session?.user?.email) return false;
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { isAdmin: true },
  });
  return user?.isAdmin === true;
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !(await isAdmin(session))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all Groq API keys with their associated user info
    const keys = await prisma.apiKey.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        key: true,
        isActive: true,
        totalUsage: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            email: true,
          },
        },
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
    if (!session?.user || !(await isAdmin(session))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { key, userId } = body;

    if (!key || typeof key !== 'string') {
      return NextResponse.json(
        { error: 'Invalid key provided' },
        { status: 400 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if key already exists
    const existingKey = await prisma.apiKey.findUnique({
      where: { key },
    });

    if (existingKey) {
      return NextResponse.json(
        { error: 'Key already exists' },
        { status: 400 }
      );
    }

    // Add new Groq API key
    const newKey = await prisma.apiKey.create({
      data: {
        key,
        isActive: true,
        totalUsage: 0,
        user: {
          connect: {
            id: userId,
          },
        },
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
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
    if (!session?.user || !(await isAdmin(session))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { key } = body;

    if (!key || typeof key !== 'string') {
      return NextResponse.json(
        { error: 'Invalid key provided' },
        { status: 400 }
      );
    }

    // Find and delete the key
    const existingKey = await prisma.apiKey.findUnique({
      where: { key },
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
