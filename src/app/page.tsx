import Navigation from '@/components/Navigation';
import Testimonials from '@/components/Testimonials';
import Link from 'next/link';
import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/auth/signin');
  }

  // If user is logged in, redirect based on admin status
  if (session.user.isAdmin) {
    redirect('/admin/api-keys');
  }

  redirect('/dashboard');
}
