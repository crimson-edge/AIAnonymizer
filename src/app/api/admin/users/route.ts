import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { subscriptionLimits } from '@/config/subscription-limits';
import { SubscriptionTier, User, Subscription, ApiKey, UserActivity, Usage } from '@prisma/client';

interface ProcessedUser {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  isAdmin: boolean;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  apiKeys: ApiKey[];
  activities: UserActivity[];
  usage: {
    monthly: number;
    total: number;
    available: number;
  };
  subscription: {
    tier: SubscriptionTier;
    status: string;
    monthlyLimit: number;
    createdAt?: Date;
    updatedAt?: Date;
  };
}

type UserWithRelations = User & {
  subscription: Subscription | null;
  apiKeys: ApiKey[];
  activities: UserActivity[];
  usageRecords: Usage[];
};

export const dynamic = 'force-dynamic';

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
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const search = url.searchParams.get('search') || '';
    const status = url.searchParams.get('status');
    const subscriptionTier = url.searchParams.get('tier');
    const sortBy = url.searchParams.get('sortBy') || 'createdAt';
    const sortOrder = url.searchParams.get('sortOrder') || 'desc';
    const exportData = url.searchParams.get('export') === 'true';

    // Build where clause
    const where: any = {};
    
    // Search filter
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Status filter
    if (status) {
      where.status = status;
    }

    // Subscription tier filter
    if (subscriptionTier) {
      where.subscription = {
        tier: subscriptionTier
      };
    }

    // Get total count for pagination
    const total = await prisma.user.count({ where });

    // Build orderBy object
    const orderBy: any = {};
    switch (sortBy) {
      case 'email':
      case 'firstName':
      case 'lastName':
      case 'status':
      case 'createdAt':
        orderBy[sortBy] = sortOrder;
        break;
      case 'subscription':
        orderBy.subscription = {
          tier: sortOrder
        };
        break;
      default:
        orderBy.createdAt = 'desc';
    }

    // Get start of month for usage calculation
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    // Get users with filters and sorting
    const users = await prisma.user.findMany({
      where,
      orderBy,
      skip: exportData ? undefined : (page - 1) * limit,
      take: exportData ? undefined : limit,
      include: {
        subscription: true,
        apiKeys: true,
        activities: {
          take: 5,
          orderBy: {
            createdAt: 'desc'
          }
        },
        usageRecords: {
          where: {
            createdAt: {
              gte: startOfMonth
            }
          }
        }
      }
    }) as UserWithRelations[];

    // Process users to include correct token limits and usage
    const processedUsers: ProcessedUser[] = users.map(user => {
      const tier = (user.subscription?.tier || 'FREE') as SubscriptionTier;
      const monthlyLimit = user.subscription?.monthlyLimit || subscriptionLimits[tier].monthlyTokens;
      const availableTokens = user.subscription?.availableTokens || monthlyLimit;
      const monthlyUsage = user.usageRecords.reduce((sum, record) => sum + (record.tokens || 0), 0);
      
      return {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        isAdmin: user.isAdmin,
        status: user.status,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        apiKeys: user.apiKeys,
        activities: user.activities,
        usage: {
          monthly: monthlyUsage,
          total: user.totalUsage,
          available: availableTokens
        },
        subscription: {
          tier,
          status: user.subscription?.status || 'inactive',
          monthlyLimit,
          createdAt: user.subscription?.createdAt,
          updatedAt: user.subscription?.updatedAt
        }
      };
    });

    if (exportData) {
      const csvData = processedUsers.map(user => ({
        'User ID': user.id,
        'First Name': user.firstName,
        'Last Name': user.lastName,
        'Email': user.email,
        Status: user.status,
        'Is Admin': user.isAdmin ? 'Yes' : 'No',
        'Subscription Tier': user.subscription?.tier || 'None',
        'Subscription Active': user.subscription?.status || 'None',
        'Monthly Limit': user.subscription?.monthlyLimit || 0,
        'Monthly Usage': user.usage?.monthly || 0,
        'Total Usage': user.usage?.total || 0,
        'Available Tokens': user.usage?.available || 0,
        'Created At': user.createdAt.toISOString(),
        'Updated At': user.updatedAt.toISOString()
      }));

      return NextResponse.json({ 
        success: true,
        data: csvData,
        type: 'export'
      });
    }

    // Return paginated response
    return NextResponse.json({
      users: processedUsers,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        currentPage: page,
        perPage: limit
      },
      filters: {
        search,
        status,
        subscriptionTier,
        sortBy,
        sortOrder
      }
    });
  } catch (error) {
    console.error('Error getting users:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const adminUser = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!adminUser?.isAdmin) {
      return new NextResponse('Unauthorized', { status: 403 });
    }

    const data = await req.json();
    const { userId, isAdmin, status, addTokens } = data;

    if (!userId) {
      return new NextResponse('User ID is required', { status: 400 });
    }

    // Prevent removing admin status from the last admin user
    if (isAdmin === false) {
      const adminCount = await prisma.user.count({
        where: { isAdmin: true }
      });
      
      const targetUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { isAdmin: true }
      });
      
      if (adminCount <= 1 && targetUser?.isAdmin) {
        return new NextResponse(
          'Cannot remove admin status from the last admin user',
          { status: 400 }
        );
      }
    }

    // Prevent suspending the last admin user
    if (status === 'SUSPENDED') {
      const targetUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { isAdmin: true }
      });

      if (targetUser?.isAdmin) {
        const adminCount = await prisma.user.count({
          where: { isAdmin: true }
        });

        if (adminCount <= 1) {
          return new NextResponse(
            'Cannot suspend the last admin user',
            { status: 400 }
          );
        }
      }
    }

    // Handle token addition
    if (typeof addTokens === 'number' && addTokens > 0) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { subscription: true }
      });

      if (!user?.subscription) {
        return new NextResponse('User has no subscription', { status: 400 });
      }

      await prisma.subscription.update({
        where: { id: user.subscription.id },
        data: {
          tokenLimit: {
            increment: addTokens
          }
        }
      });
    }

    const updateData: any = {};
    if (typeof isAdmin === 'boolean') {
      updateData.isAdmin = isAdmin;
    }
    if (status && (status === 'ACTIVE' || status === 'SUSPENDED')) {
      updateData.status = status;
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      include: {
        subscription: {
          select: {
            tier: true,
            status: true,
            monthlyLimit: true
          }
        }
      }
    });

    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    console.error('Error updating user:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const adminUser = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!adminUser?.isAdmin) {
      return new NextResponse('Unauthorized', { status: 403 });
    }

    // Get user ID from URL
    const url = new URL(req.url);
    const userId = url.searchParams.get('userId');

    if (!userId) {
      return new NextResponse('User ID is required', { status: 400 });
    }

    // Prevent deleting the last admin user
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { isAdmin: true }
    });

    if (targetUser?.isAdmin) {
      const adminCount = await prisma.user.count({
        where: { isAdmin: true }
      });

      if (adminCount <= 1) {
        return new NextResponse(
          'Cannot delete the last admin user',
          { status: 400 }
        );
      }
    }

    // Delete user's subscription first (due to foreign key constraint)
    await prisma.subscription.deleteMany({
      where: { userId }
    });

    // Delete user's API keys
    await prisma.apiKey.deleteMany({
      where: { userId }
    });

    // Delete user's usage records
    await prisma.usage.deleteMany({
      where: { userId }
    });

    // Delete the user
    await prisma.user.delete({
      where: { id: userId }
    });

    return new NextResponse('User deleted successfully', { status: 200 });
  } catch (error) {
    console.error('Error deleting user:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
