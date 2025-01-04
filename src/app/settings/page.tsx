import SettingsClient from '@/components/settings/SettingsClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Settings | AIAnonymizer',
  description: 'Manage your account settings',
};

export default function SettingsPage() {
  return <SettingsClient />;
}