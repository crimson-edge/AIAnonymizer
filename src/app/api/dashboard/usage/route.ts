import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { startOfDay } from 'date-fns';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Get user with their subscription
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { subscription: true }
    });

    if (!user) {
      return new NextResponse('User not found', { status: 404 });
    }

    // Get total tokens used this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const monthlyUsage = await prisma.usage.aggregate({
      where: {
        userId: user.id,
        createdAt: {
          gte: startOfMonth
        }
      },
      _sum: {
        tokens: true,
        cost: true
      }
    });

    // Get today's usage
    const todayStart = startOfDay(new Date());
    const todayUsage = await prisma.usage.aggregate({
      where: {
        userId: user.id,
        createdAt: {
          gte: todayStart
        }
      },
      _sum: {
        tokens: true,
        cost: true
      },
      _count: true
    });

    return NextResponse.json({
      totalTokens: monthlyUsage._sum.tokens || 0,
      monthlyLimit: user.subscription?.monthlyLimit || 1000,
      tokenLimit: user.subscription?.tokenLimit || user.subscription?.monthlyLimit || 1000,
      requestsToday: todayUsage._count || 0,
      costToday: todayUsage._sum.cost || 0
    });
  } catch (error) {
    console.error('Error fetching usage stats:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
