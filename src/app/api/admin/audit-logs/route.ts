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
    const adminId = url.searchParams.get('adminId');
    const actionType = url.searchParams.get('actionType');
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');

    // Build where clause
    const where: any = {};
    
    if (adminId) {
      where.adminId = adminId;
    }
    
    if (actionType) {
      where.actionType = actionType;
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

    // Get paginated audit logs with admin details
    const [auditLogs, total] = await Promise.all([
      prisma.adminAuditLog.findMany({
        where,
        include: {
          admin: {
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
      prisma.adminAuditLog.count({ where })
    ]);

    return NextResponse.json({
      auditLogs,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        currentPage: page,
        perPage: limit
      }
    });

  } catch (error) {
    console.error('Error in audit logs:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// Add new audit log
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const admin = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!admin?.isAdmin) {
      return new NextResponse('Unauthorized', { status: 403 });
    }

    const body = await req.json();
    const { actionType, details, targetUserId, targetResource } = body;

    const auditLog = await prisma.adminAuditLog.create({
      data: {
        adminId: admin.id,
        actionType,
        details,
        targetUserId,
        targetResource
      }
    });

    return NextResponse.json(auditLog);

  } catch (error) {
    console.error('Error creating audit log:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
