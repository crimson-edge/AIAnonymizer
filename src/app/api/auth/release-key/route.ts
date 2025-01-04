import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Find any active API keys for this user
    const activeKeys = await prisma.apiKey.findMany({
      where: {
        user: {
          email: session.user.email
        },
        isActive: true
      }
    });

    // Update each key to inactive
    if (activeKeys.length > 0) {
      await prisma.$transaction(
        activeKeys.map(key => 
          prisma.apiKey.update({
            where: { id: key.id },
            data: { 
              isActive: false,
              updatedAt: new Date()
            }
          })
        )
      );

      // Also update any associated Groq keys
      await prisma.groqKey.updateMany({
        where: {
          currentSession: {
            in: activeKeys.map(key => key.id)
          }
        },
        data: {
          isInUse: false,
          currentSession: null,
          lastUsed: new Date()
        }
      });
    }

    return new NextResponse(JSON.stringify({ message: 'Keys released successfully' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error releasing keys:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
