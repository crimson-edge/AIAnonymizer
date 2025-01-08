import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { keyManager } from '@/lib/groq/manager/KeyManager';

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    console.log('Session in refresh:', JSON.stringify(session, null, 2));

    if (!session?.user) {
      console.error('No session found in refresh');
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    if (!session.user.isAdmin) {
      console.error('User is not admin in refresh:', session.user);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await keyManager.refreshKeyPool();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in POST /api/admin/api-keys/refresh:', error);
    return NextResponse.json(
      { error: 'Failed to refresh API key pool' },
      { status: 500 }
    );
  }
}
