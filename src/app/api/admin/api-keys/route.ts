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
    console.log('All keys:', allKeys); // Debug log
    
    // Ensure we have a valid array
    if (!allKeys || !Array.isArray(allKeys)) {
      console.error('Invalid keys response:', allKeys);
      return NextResponse.json({
        keys: [],
        total: 0
      });
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
        return sortOrder === 'desc' ? b.totalUsage - a.totalUsage : a.totalUsage - b.totalUsage;
      }
      if (sortBy === 'lastUsed') {
        const aDate = a.lastUsed ? new Date(a.lastUsed).getTime() : 0;
        const bDate = b.lastUsed ? new Date(b.lastUsed).getTime() : 0;
        return sortOrder === 'desc' ? bDate - aDate : aDate - bDate;
      }
      // Default sort by createdAt
      const aDate = new Date(a.createdAt).getTime();
      const bDate = new Date(b.createdAt).getTime();
      return sortOrder === 'desc' ? bDate - aDate : aDate - bDate;
    });

    // Calculate pagination
    const total = sortedKeys.length;
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedKeys = sortedKeys.slice(start, end);

    console.log('Returning paginated keys:', { 
      total,
      pageSize: paginatedKeys.length,
      page
    }); // Debug log

    return NextResponse.json({
      keys: paginatedKeys,
      total
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
