import type { Metadata } from 'next';
import ApprovalsQueueManager from '@/components/approvals/ApprovalsQueueManager';

export const metadata: Metadata = {
  title: 'Approvals Queue | Brandex Prospect Engine CRM',
  description: 'Human-in-the-loop review and approval queue for AI-generated outreach drafts.',
};

export default function ApprovalsPage() {
  return (
    <div className="fade-in">
      <ApprovalsQueueManager />
    </div>
  );
}
