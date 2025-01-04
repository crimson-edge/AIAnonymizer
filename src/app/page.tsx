'use client';

import MarketingContent from '@/components/MarketingContent';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function HomePage() {
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    // If user is logged in, redirect to dashboard regardless of admin status
    if (session?.user) {
      router.push('/dashboard');
    }
  }, [session, router]);

  return <MarketingContent />;
}
