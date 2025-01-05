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

    // Get users with filters and sorting
    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        isAdmin: true,
        status: true,
        subscription: {
          select: {
            tier: true,
            status: true,
            monthlyLimit: true,
            tokenLimit: true,
            createdAt: true,
            updatedAt: true
          }
        },
        createdAt: true,
        updatedAt: true
      },
      orderBy,
      skip: exportData ? undefined : (page - 1) * limit,
      take: exportData ? undefined : limit
    });

    // Handle data export
    if (exportData) {
      const csvData = users.map(user => ({
        ID: user.id,
        Email: user.email,
        'First Name': user.firstName,
        'Last Name': user.lastName,
        Status: user.status,
        'Is Admin': user.isAdmin ? 'Yes' : 'No',
        'Subscription Tier': user.subscription?.tier || 'None',
        'Subscription Active': user.subscription?.status || 'None',
        'Monthly Limit': user.subscription?.monthlyLimit || 0,
        'Token Limit': user.subscription?.tokenLimit || 0,
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
      users,
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
        where: { userId },
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
            monthlyLimit: true,
            tokenLimit: true
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
    await prisma.subscription.delete({
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
