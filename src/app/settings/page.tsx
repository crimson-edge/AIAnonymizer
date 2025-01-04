import SettingsClient from '@/components/settings/SettingsClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Settings | AI Anonymizer',
  description: 'Manage your account settings and preferences',
};

export default function SettingsPage() {
  return <SettingsClient />;
}