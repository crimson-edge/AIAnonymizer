import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { startOfDay } from 'date-fns';
import { subscriptionLimits } from '@/config/subscription-limits';
import { SubscriptionTier } from '@prisma/client';

export const dynamic = 'force-dynamic';

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
      }
    });

    // Get subscription tier and limits
    const tier = user.subscription?.tier || 'FREE' as SubscriptionTier;
    const tierLimits = subscriptionLimits[tier];
    const monthlyLimit = tierLimits.monthlyTokens;
    const monthlyTokensUsed = monthlyUsage._sum.tokens || 0;
    const totalAvailableTokens = Math.max(0, monthlyLimit - monthlyTokensUsed);

    return NextResponse.json({
      monthlyTokensUsed,
      totalAvailableTokens,
      currentMonthlyQuota: monthlyLimit,
      dailyUsage: todayUsage._sum.tokens || 0,
      monthlyUsage: monthlyTokensUsed,
      monthlyLimit: monthlyLimit,
      dailyCost: todayUsage._sum.cost || 0,
      monthlyCost: monthlyUsage._sum.cost || 0
    });
  } catch (error) {
    console.error('Error fetching usage:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
