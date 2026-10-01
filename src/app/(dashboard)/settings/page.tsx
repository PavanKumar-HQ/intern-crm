import type { Metadata } from 'next';
import SettingsSecurityHub from '@/components/settings/SettingsSecurityHub';

export const metadata: Metadata = {
  title: 'Settings & Security | Brandex Prospect Engine CRM',
  description: 'Enterprise RBAC, Supabase Row Level Security (RLS), and API configuration.',
};

export default function SettingsPage() {
  return (
    <div className="fade-in">
      <SettingsSecurityHub />
    </div>
  );
}
