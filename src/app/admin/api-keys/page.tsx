import AdminAPIKeysClient from '@/components/admin/AdminAPIKeysClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'API Key Management | Admin',
  description: 'Manage API keys and monitor usage',
};

export default function AdminAPIKeysPage() {
  return <AdminAPIKeysClient />;
}