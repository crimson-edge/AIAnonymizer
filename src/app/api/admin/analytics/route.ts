export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { startOfDay, subDays } from 'date-fns';

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

    // Get URL parameters for time range
    const url = new URL(req.url);
    const days = parseInt(url.searchParams.get('days') || '30');
    const startDate = subDays(startOfDay(new Date()), days);

    // Get overall stats
    const [
      totalUsers,
      activeUsers,
      totalApiKeys,
      totalTokensUsed,
      newUsersLastMonth,
      revenueStats
    ] = await Promise.all([
      // Total users
      prisma.user.count(),
      // Active users (used service in last 30 days)
      prisma.user.count({
        where: {
          lastActive: {
            gte: startDate
          }
        }
      }),
      // Total API keys
      prisma.apiKey.count(),
      // Total tokens used
      prisma.tokenUsage.aggregate({
        _sum: {
          tokensUsed: true
        }
      }),
      // New users in time period
      prisma.user.count({
        where: {
          createdAt: {
            gte: startDate
          }
        }
      }),
      // Revenue stats
      prisma.payment.aggregate({
        where: {
          status: 'succeeded',
          createdAt: {
            gte: startDate
          }
        },
        _sum: {
          amount: true
        }
      })
    ]);

    // Get daily stats for graphs
    const dailyStats = await prisma.$queryRaw`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as new_users,
        SUM(CASE WHEN subscription_tier != 'free' THEN 1 ELSE 0 END) as new_paid_users
      FROM "User"
      WHERE created_at >= ${startDate}
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `;

    return NextResponse.json({
      overview: {
        totalUsers,
        activeUsers,
        totalApiKeys,
        totalTokensUsed: totalTokensUsed._sum.tokensUsed || 0,
        newUsersLastMonth,
        revenue: (revenueStats._sum.amount || 0) / 100 // Convert cents to dollars
      },
      dailyStats
    });

  } catch (error) {
    console.error('Error in admin analytics:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
