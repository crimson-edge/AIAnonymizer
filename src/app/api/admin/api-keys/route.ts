import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { GroqKeyManager } from '@/lib/groq/key-manager';
import { authOptions } from '@/lib/auth';

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const keys = await GroqKeyManager.getKeyUsage();
    return NextResponse.json(keys);
  } catch (error) {
    console.error('Error fetching API keys:', error);
    return NextResponse.json(
      { error: 'Failed to fetch API keys' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { key } = await req.json();
    
    if (!key) {
      return NextResponse.json(
        { error: 'API key is required' },
        { status: 400 }
      );
    }

    await GroqKeyManager.addKeyToPool(key);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error adding API key:', error);
    return NextResponse.json(
      { error: 'Failed to add API key' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const key = searchParams.get('key');
    
    if (!key) {
      return NextResponse.json(
        { error: 'API key is required' },
        { status: 400 }
      );
    }

    await GroqKeyManager.removeKeyFromPool(key);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing API key:', error);
    return NextResponse.json(
      { error: 'Failed to remove API key' },
      { status: 500 }
    );
  }
}
