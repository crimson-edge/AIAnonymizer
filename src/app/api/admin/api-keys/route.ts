export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { GroqKeyManager } from '@/lib/groq/key-manager';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    console.log('GET /api/admin/api-keys session:', session);

    if (!session?.user?.email) {
      console.error('No session or email found');
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user?.isAdmin) {
      console.error('User is not admin:', user);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get URL parameters for pagination
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const search = url.searchParams.get('search') || '';
    const sortBy = url.searchParams.get('sortBy') || 'createdAt';
    const sortOrder = url.searchParams.get('sortOrder') || 'desc';

    // Get all keys with usage data
    const allKeys = await GroqKeyManager.getKeyUsage();
    if (!Array.isArray(allKeys)) {
      throw new Error('Failed to get API keys');
    }
    
    // Filter keys if search is provided
    const filteredKeys = search
      ? allKeys.filter(key => 
          key.id.toLowerCase().includes(search.toLowerCase())
        )
      : allKeys;

    // Sort keys
    const sortedKeys = [...filteredKeys].sort((a, b) => {
      if (sortBy === 'usage') {
        const aUsage = typeof a.totalUsage === 'number' ? a.totalUsage : 0;
        const bUsage = typeof b.totalUsage === 'number' ? b.totalUsage : 0;
        return sortOrder === 'desc' ? bUsage - aUsage : aUsage - bUsage;
      }
      // Default sort by creation date
      return sortOrder === 'desc' 
        ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        : new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });

    // Calculate pagination
    const total = sortedKeys.length;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedKeys = sortedKeys.slice(startIndex, endIndex);

    return NextResponse.json({
      keys: paginatedKeys,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        currentPage: page,
        perPage: limit
      }
    });
  } catch (error) {
    console.error('Error in GET /api/admin/api-keys:', error);
    return NextResponse.json(
      { error: 'Failed to fetch API keys' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    console.log('POST /api/admin/api-keys session:', session);

    if (!session?.user?.email) {
      console.error('No session or email found in POST');
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user?.isAdmin) {
      console.error('User is not admin in POST:', user);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { key } = await req.json();
    
    if (!key || typeof key !== 'string') {
      return NextResponse.json(
        { error: 'API key is required and must be a string' },
        { status: 400 }
      );
    }

    await GroqKeyManager.addKeyToPool(key);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in POST /api/admin/api-keys:', error);
    return NextResponse.json(
      { error: 'Failed to add API key' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    console.log('DELETE /api/admin/api-keys session:', session);

    if (!session?.user?.email) {
      console.error('No session or email found in DELETE');
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user?.isAdmin) {
      console.error('User is not admin in DELETE:', user);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const key = searchParams.get('key');
    
    if (!key || typeof key !== 'string') {
      return NextResponse.json(
        { error: 'API key is required and must be a string' },
        { status: 400 }
      );
    }

    await GroqKeyManager.removeKeyFromPool(key);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/admin/api-keys:', error);
    return NextResponse.json(
      { error: 'Failed to remove API key' },
      { status: 500 }
    );
  }
}
