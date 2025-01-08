import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// This route is deprecated as we now manage API keys through /api/admin/api-keys
export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  return NextResponse.json(
    { error: 'This endpoint is deprecated' },
    { status: 410 }
  );
}

export async function POST(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  return NextResponse.json(
    { error: 'This endpoint is deprecated' },
    { status: 410 }
  );
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  return NextResponse.json(
    { error: 'This endpoint is deprecated' },
    { status: 410 }
  );
}
