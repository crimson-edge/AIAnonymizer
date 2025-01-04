import AdminUsersClient from '@/components/admin/AdminUsersClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'User Management | Admin',
  description: 'Manage users and their permissions',
};

export default function AdminUsersPage() {
  return <AdminUsersClient />;
}