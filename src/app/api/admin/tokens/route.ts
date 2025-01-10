export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { subscriptionLimits } from '@/config/subscription-limits';

export async function GET(req: Request) {
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

    const url = new URL(req.url);
    const userId = url.searchParams.get('userId');

    if (!userId) {
      return new NextResponse('User ID is required', { status: 400 });
    }

    // Get user's token usage and limits
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        subscription: true,
        usageRecords: {
          orderBy: { createdAt: 'desc' },
          take: 100, // Last 100 usage records
        },
      },
    });

    if (!user) {
      return new NextResponse('User not found', { status: 404 });
    }

    // Get start of month for usage calculation
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    // Calculate current monthly usage
    const currentMonthUsage = await prisma.usage.aggregate({
      where: {
        userId,
        createdAt: {
          gte: startOfMonth,
        },
      },
      _sum: {
        tokens: true,
      },
    });

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        subscription: user.subscription,
        monthlyUsage: currentMonthUsage._sum.tokens || 0,
        usageHistory: user.usageRecords,
      },
    });
  } catch (error) {
    console.error('Error fetching token data:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

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

    const data = await req.json();
    const { userId, action, amount } = data;

    if (!userId || !action || (action !== 'reset' && !amount)) {
      return new NextResponse('Missing required fields', { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { subscription: true },
    });

    if (!user) {
      return new NextResponse('User not found', { status: 404 });
    }

    if (!user.subscription) {
      return new NextResponse('User has no subscription', { status: 400 });
    }

    // Get start of month for usage calculation
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    // Calculate current monthly usage
    const currentMonthUsage = await prisma.usage.aggregate({
      where: {
        userId,
        createdAt: {
          gte: startOfMonth,
        },
      },
      _sum: {
        tokens: true,
      },
    });

    // Handle different token management actions
    switch (action) {
      case 'add':
        await prisma.subscription.update({
          where: { userId },
          data: {
            availableTokens: {
              increment: amount,
            },
          },
        });
        break;

      case 'set':
        await prisma.subscription.update({
          where: { userId },
          data: {
            availableTokens: amount,
          },
        });
        break;

      case 'reset':
        await prisma.subscription.update({
          where: { userId },
          data: {
            availableTokens: user.subscription.monthlyLimit - (currentMonthUsage._sum.tokens || 0),
          },
        });
        break;

      default:
        return new NextResponse('Invalid action', { status: 400 });
    }

    // Log the token management action
    await prisma.adminAuditLog.create({
      data: {
        adminId: admin.id,
        actionType: `TOKEN_${action.toUpperCase()}`,
        targetUserId: userId,
        details: {
          amount,
          previousAvailable: user.subscription.availableTokens,
          newAvailable: action === 'add' 
            ? user.subscription.availableTokens + amount
            : action === 'set' 
              ? amount 
              : user.subscription.monthlyLimit - (currentMonthUsage._sum.tokens || 0)
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error managing tokens:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
