'use client';

import MarketingContent from '@/components/MarketingContent';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function HomePage() {
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session?.user) {
      if (session.user.isAdmin) {
        router.push('/admin/api-keys');
      } else {
        router.push('/dashboard');
      }
    }
  }, [session, router]);

  return <MarketingContent />;
}
