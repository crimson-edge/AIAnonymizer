import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import DashboardClient from '@/components/dashboard/DashboardClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard | AI Anonymizer',
  description: 'View your API usage and manage your subscription',
};

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/auth/signin');
  }

  return <DashboardClient />;
}