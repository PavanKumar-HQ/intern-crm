import type { Metadata } from 'next';
import CampaignListManager from '@/components/campaigns/CampaignListManager';

export const metadata: Metadata = {
  title: 'Campaigns | Brandex Prospect Engine CRM',
  description: 'Manage and orchestrate automated prospect discovery campaigns.',
};

export default function CampaignsPage() {
  return (
    <div className="fade-in">
      <CampaignListManager />
    </div>
  );
}
