import DashboardClient from '@/components/dashboard/DashboardClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard | AI Anonymizer',
  description: 'View your API usage and manage your subscription',
};

export default function DashboardPage() {
  return <DashboardClient />;
}