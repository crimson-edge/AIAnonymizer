import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import MarketingContent from '@/components/MarketingContent';

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  // If user is logged in, redirect to appropriate page
  if (session?.user) {
    if (session.user.isAdmin) {
      redirect('/admin/api-keys');
    } else {
      redirect('/dashboard');
    }
  }

  return <MarketingContent />;
}
