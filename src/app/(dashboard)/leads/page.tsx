import type { Metadata } from 'next';
import LeadsManager from '@/components/leads/LeadsManager';

export const metadata: Metadata = {
  title: 'Leads Management | Brandex CRM',
  description: 'Manage qualified prospect accounts, domains, contact records, and pipeline opportunities.',
};

export default function LeadsPage() {
  return (
    <div className="fade-in">
      <LeadsManager />
    </div>
  );
}
