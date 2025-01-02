import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { GroqKeyManager } from '@/lib/groq/key-manager';

export async function POST() {
  const session = await getServerSession();

  if (!session?.user || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await GroqKeyManager.refreshKeyPool();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error refreshing API key pool:', error);
    return NextResponse.json(
      { error: 'Failed to refresh API key pool' },
      { status: 500 }
    );
  }
}
