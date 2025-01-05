export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

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

    // Get URL parameters
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const userId = url.searchParams.get('userId');
    const activityType = url.searchParams.get('type');
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');

    // Build where clause
    const where: any = {};
    
    if (userId) {
      where.userId = userId;
    }
    
    if (activityType) {
      where.activityType = activityType;
    }
    
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate);
      }
    }

    // Get paginated activities with user details
    const [activities, total] = await Promise.all([
      prisma.userActivity.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.userActivity.count({ where })
    ]);

    return NextResponse.json({
      activities,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        currentPage: page,
        perPage: limit
      }
    });

  } catch (error) {
    console.error('Error in activity logs:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// Add new activity log
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

    const body = await req.json();
    const { userId, activityType, details } = body;

    const activity = await prisma.userActivity.create({
      data: {
        userId,
        activityType,
        details,
      }
    });

    return NextResponse.json(activity);

  } catch (error) {
    console.error('Error creating activity log:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
