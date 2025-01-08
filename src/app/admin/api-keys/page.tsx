import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import AdminAPIKeysClient from '@/components/admin/AdminAPIKeysClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AdminAPIKeysPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    redirect('/auth/signin');
  }

  // Check if user is admin
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { isAdmin: true },
  });

  if (!user?.isAdmin) {
    redirect('/');
  }

  return (
    <div>
      <AdminAPIKeysClient />
    </div>
  );
}