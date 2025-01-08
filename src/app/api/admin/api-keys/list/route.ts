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

  try {
    const session = await getServerSession(authOptions);
    console.log('Session:', session);

    if (!session?.user?.email) {
      console.error('No session or email found');
      return NextResponse.json({ error: 'Not authenticated', keys: [], total: 0 }, { status: 401 });
    }

    console.time('findUser');
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });
    console.timeEnd('findUser');
    console.log('User:', user);

    if (!user?.isAdmin) {
      console.error('User is not admin:', user);
      return NextResponse.json({ error: 'Unauthorized', keys: [], total: 0 }, { status: 401 });
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
      return NextResponse.json({ error: 'Failed to fetch API keys', keys: [], total: 0 }, { status: 500 });
    }

    // Ensure allKeys is an array
    if (!Array.isArray(allKeys)) {
      console.error('allKeys is not an array:', allKeys);
      allKeys = [];
    }

    // Filter keys based on search
    let filteredKeys = allKeys;
    if (search) {
      const searchLower = search.toLowerCase();
      filteredKeys = allKeys.filter(key => {
        const keyString = JSON.stringify(key).toLowerCase();
        return keyString.includes(searchLower);
      });
    }

    // Sort keys
    const sortedKeys = [...filteredKeys].sort((a, b) => {
      let aValue = a[sortBy as keyof KeyMetrics];
      let bValue = b[sortBy as keyof KeyMetrics];

      // Handle special cases for sorting
      if (sortBy === 'createdAt' || sortBy === 'lastUsed') {
        aValue = aValue ? (typeof aValue === 'string' ? new Date(aValue).getTime() : aValue instanceof Date ? aValue.getTime() : 0) : 0;
        bValue = bValue ? (typeof bValue === 'string' ? new Date(bValue).getTime() : bValue instanceof Date ? bValue.getTime() : 0) : 0;
      }

      if (sortOrder === 'desc') {
        return bValue > aValue ? 1 : -1;
      }
      return aValue > bValue ? 1 : -1;
    });

    // Calculate pagination
    const total = sortedKeys.length;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedKeys = sortedKeys.slice(startIndex, endIndex);

    console.timeEnd('api-keys-get');

    return NextResponse.json({
      keys: paginatedKeys || [],
      total: total || 0,
      error: null
    });
  } catch (error) {
    if (error.name === 'AbortError') {
      console.error('Request timed out after', TIMEOUT, 'ms');
      return NextResponse.json({
        keys: [],
        total: 0,
        error: 'Request timed out'
      }, { status: 504 });
    }
    console.error('Error in GET /api/admin/api-keys:', error);
    return NextResponse.json({
      keys: [],
      total: 0,
      error: 'Failed to fetch API keys'
    }, { status: 500 });
  } finally {
    clearTimeout(timeoutId);
  }
}
