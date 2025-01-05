export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

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
    const { action, userIds } = body;

    if (!Array.isArray(userIds) || userIds.length === 0) {
      return new NextResponse('Invalid user IDs', { status: 400 });
    }

    let result;

    switch (action) {
      case 'suspend':
        result = await prisma.user.updateMany({
          where: {
            id: { in: userIds },
            isAdmin: false // Prevent suspending admins
          },
          data: {
            status: 'suspended'
          }
        });
        break;

      case 'activate':
        result = await prisma.user.updateMany({
          where: {
            id: { in: userIds }
          },
          data: {
            status: 'active'
          }
        });
        break;

      case 'delete':
        // First delete related records
        await Promise.all([
          prisma.apiKey.deleteMany({
            where: { userId: { in: userIds } }
          }),
          prisma.tokenUsage.deleteMany({
            where: { userId: { in: userIds } }
          }),
          prisma.userActivity.deleteMany({
            where: { userId: { in: userIds } }
          })
        ]);

        // Then delete users
        result = await prisma.user.deleteMany({
          where: {
            id: { in: userIds },
            isAdmin: false // Prevent deleting admins
          }
        });
        break;

      case 'resetApiKeys':
        // Deactivate all existing API keys
        await prisma.apiKey.updateMany({
          where: {
            userId: { in: userIds }
          },
          data: {
            isActive: false,
            revokedAt: new Date()
          }
        });
        result = { count: userIds.length };
        break;

      default:
        return new NextResponse('Invalid action', { status: 400 });
    }

    // Log the bulk action
    await prisma.userActivity.create({
      data: {
        userId: admin.id,
        activityType: 'BULK_ACTION',
        details: {
          action,
          affectedUsers: userIds,
          result
        }
      }
    });

    return NextResponse.json({
      success: true,
      affected: result.count
    });

  } catch (error) {
    console.error('Error in bulk user operation:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
