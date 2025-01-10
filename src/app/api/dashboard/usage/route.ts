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

    // Get all usage records for this month
    const monthlyUsageRecords = await prisma.usage.findMany({
      where: {
        userId: user.id,
        createdAt: {
          gte: startOfMonth
        }
      },
      select: {
        tokens: true,
        cost: true,
        type: true
      }
    });

    // Calculate actual token usage (only positive values)
    const monthlyTokensUsed = monthlyUsageRecords
      .filter(record => record.tokens > 0)
      .reduce((sum, record) => sum + record.tokens, 0);

    // Calculate admin token additions (negative values)
    const adminTokenAdditions = monthlyUsageRecords
      .filter(record => record.tokens < 0)
      .reduce((sum, record) => sum - record.tokens, 0); // Convert to positive number

    // Calculate monthly costs
    const monthlyCost = monthlyUsageRecords
      .reduce((sum, record) => sum + (record.cost || 0), 0);

    // Get today's usage
    const todayStart = startOfDay(new Date());
    const todayUsage = await prisma.usage.aggregate({
      where: {
        userId: user.id,
        createdAt: {
          gte: todayStart
        },
        tokens: {
          gt: 0 // Only count positive token usage for daily stats
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

    // Calculate total available tokens including admin additions
    const totalAvailableTokens = Math.max(0, monthlyLimit - monthlyTokensUsed + adminTokenAdditions);

    return NextResponse.json({
      monthlyTokensUsed,
      totalAvailableTokens,
      currentMonthlyQuota: monthlyLimit,
      dailyUsage: todayUsage._sum.tokens || 0,
      monthlyUsage: monthlyTokensUsed,
      monthlyLimit: monthlyLimit,
      dailyCost: todayUsage._sum.cost || 0,
      monthlyCost
    });
  } catch (error) {
    console.error('Error fetching usage:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
