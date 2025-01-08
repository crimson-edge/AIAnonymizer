export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { keyManager } from '@/lib/groq/manager/KeyManager';
import type { KeyMetrics } from '@/lib/groq/types/GroqTypes';

const TIMEOUT = 10000; // 10 seconds

export async function GET(req: Request) {
  console.time('api-keys-get');
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT);

  // Add CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return new NextResponse(null, { headers });
  }

  try {
    const session = await getServerSession(authOptions);
    console.log('Session:', session);

    if (!session?.user?.email) {
      console.error('No session or email found');
      return NextResponse.json(
        { error: 'Not authenticated', keys: [], total: 0 },
        { status: 401, headers }
      );
    }

    console.time('findUser');
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });
    console.timeEnd('findUser');
    console.log('User:', user);

    if (!user?.isAdmin) {
      console.error('User is not admin:', user);
      return NextResponse.json(
        { error: 'Unauthorized', keys: [], total: 0 },
        { status: 401, headers }
      );
    }

    // Get URL parameters for pagination
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const search = url.searchParams.get('search') || '';
    const sortBy = url.searchParams.get('sortBy') || 'createdAt';
    const sortOrder = url.searchParams.get('sortOrder') || 'desc';

    console.log('Query parameters:', { page, limit, search, sortBy, sortOrder });

    // Get all keys with usage data
    let allKeys: KeyMetrics[] = [];
    try {
      console.time('getKeyUsage');
      allKeys = await keyManager.getKeyMetrics();
      console.log('API: Retrieved keys:', allKeys);

      console.timeEnd('getKeyUsage');
      console.log('Fetched keys:', allKeys);
    } catch (error) {
      console.error('Error getting key usage:', error);
      return NextResponse.json(
        { error: 'Failed to fetch API keys', keys: [], total: 0 },
        { status: 500, headers }
      );
    }

    // Ensure allKeys is an array
    if (!Array.isArray(allKeys)) {
      console.error('Invalid keys response:', allKeys);
      allKeys = [];
    }
    
    // Filter keys if search is provided
    console.time('filterAndSort');
    const filteredKeys = search
      ? allKeys.filter(key => 
          key.id.toLowerCase().includes(search.toLowerCase())
        )
      : allKeys;

    console.log('API: Filtered and sorted keys:', filteredKeys);
    console.log('Filtered keys:', filteredKeys);

    // Sort keys
    const sortedKeys = [...filteredKeys].sort((a, b) => {
      if (sortBy === 'usage') {
        return sortOrder === 'desc' ? (b.totalUsage || 0) - (a.totalUsage || 0) : (a.totalUsage || 0) - (b.totalUsage || 0);
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
    console.timeEnd('filterAndSort');

    console.log('Sorted keys:', sortedKeys);

    // Calculate pagination
    console.time('pagination');
    const total = sortedKeys.length;
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedKeys = sortedKeys.slice(start, end);
    console.timeEnd('pagination');

    console.log('Pagination:', { 
      total,
      pageSize: paginatedKeys.length,
      page,
      start,
      end
    });

    console.timeEnd('api-keys-get');
    clearTimeout(timeoutId);

    // Always return an array for keys
    return NextResponse.json({
      keys: paginatedKeys || [],
      total: total || 0,
      error: null
    }, { headers });
  } catch (error) {
    if (error.name === 'AbortError') {
      console.error('Request timed out after', TIMEOUT, 'ms');
      return NextResponse.json({
        keys: [],
        total: 0,
        error: 'Request timed out'
      }, { status: 504, headers });
    }
    console.error('Error in GET /api/admin/api-keys:', error);
    return NextResponse.json({
      keys: [],
      total: 0,
      error: 'Failed to fetch API keys'
    }, { status: 500, headers });
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function POST(req: Request) {
  console.log('POST /api/admin/api-keys started');
  try {
    const session = await getServerSession(authOptions);
    console.log('Session:', session);

    if (!session?.user?.email) {
      console.error('No session or email found in POST');
      return NextResponse.json({ error: 'Not authenticated', success: false }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });
    console.log('User:', user);

    if (!user?.isAdmin) {
      console.error('User is not admin in POST:', user);
      return NextResponse.json({ error: 'Unauthorized', success: false }, { status: 401 });
    }

    const { key } = await req.json();
    
    if (!key || typeof key !== 'string') {
      console.error('Invalid API key:', key);
      return NextResponse.json(
        { error: 'API key is required and must be a string', success: false },
        { status: 400 }
      );
    }

    console.log('Adding key to pool...');
    await keyManager.addKey(key);
    console.log('Key added successfully');

    return NextResponse.json({ success: true, error: null });
  } catch (error) {
    console.error('Error in POST /api/admin/api-keys:', error);
    return NextResponse.json(
      { error: 'Failed to add API key', success: false },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  console.log('DELETE /api/admin/api-keys started');
  try {
    const session = await getServerSession(authOptions);
    console.log('Session:', session);

    if (!session?.user?.email) {
      console.error('No session or email found in DELETE');
      return NextResponse.json({ error: 'Not authenticated', success: false }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });
    console.log('User:', user);

    if (!user?.isAdmin) {
      console.error('User is not admin in DELETE:', user);
      return NextResponse.json({ error: 'Unauthorized', success: false }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const key = searchParams.get('key');
    
    if (!key || typeof key !== 'string') {
      console.error('Invalid API key:', key);
      return NextResponse.json(
        { error: 'API key is required and must be a string', success: false },
        { status: 400 }
      );
    }

    console.log('Removing key from pool...');
    await keyManager.removeKey(key);
    console.log('Key removed successfully');

    return NextResponse.json({ success: true, error: null });
  } catch (error) {
    console.error('Error in DELETE /api/admin/api-keys:', error);
    return NextResponse.json(
      { error: 'Failed to remove API key', success: false },
      { status: 500 }
    );
  }
}
