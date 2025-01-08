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

    // Calculate total token usage for current month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const monthlyUsage = await prisma.usage.aggregate({
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
        monthlyUsage: monthlyUsage._sum.tokens || 0,
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

    if (!userId || !action || !amount) {
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

    // Handle different token management actions
    switch (action) {
      case 'add':
        await prisma.subscription.update({
          where: { userId },
          data: {
            tokenLimit: {
              increment: amount,
            },
          },
        });
        break;

      case 'set':
        await prisma.subscription.update({
          where: { userId },
          data: {
            tokenLimit: amount,
          },
        });
        break;

      case 'reset':
        // Reset to default limit based on subscription tier
        const defaultLimit = user.subscription.tier === 'PREMIUM' 
          ? 100000 
          : user.subscription.tier === 'BASIC' 
            ? 10000 
            : 1000;

        await prisma.subscription.update({
          where: { userId },
          data: {
            tokenLimit: defaultLimit,
          },
        });
        break;

      default:
        return new NextResponse('Invalid action', { status: 400 });
    }

    // Log the token management action
    await prisma.usage.create({
      data: {
        id: crypto.randomUUID(),
        userId,
        tokens: amount,
        type: `ADMIN_${action.toUpperCase()}`,
        cost: 0, // Admin actions don't incur costs
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error managing tokens:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
