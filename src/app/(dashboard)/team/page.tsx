import type { Metadata } from 'next';
import TeamManager from '@/components/team/TeamManager';

export const metadata: Metadata = {
  title: 'Team & RBAC | Brandex Prospect Engine CRM',
  description: 'Manage organization team members, security roles, and user workloads.',
};

export default function TeamPage() {
  return (
    <div className="fade-in">
      <TeamManager />
    </div>
  );
}
