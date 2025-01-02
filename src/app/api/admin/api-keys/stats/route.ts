import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { GroqKeyManager } from '@/lib/groq/key-manager';

export async function GET() {
  const session = await getServerSession();

  if (!session?.user || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const stats = await GroqKeyManager.getStats();
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching API key stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch API key stats' },
      { status: 500 }
    );
  }
}
