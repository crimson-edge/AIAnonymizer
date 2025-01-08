import { Metadata } from 'next';
import AdminAPIKeysClient from '@/components/admin/AdminAPIKeysClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: 'API Key Management | Admin',
  description: 'Manage API keys',
};

export default function AdminAPIKeys() {
  return <AdminAPIKeysClient />;
}