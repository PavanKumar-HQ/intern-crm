import type { Metadata } from 'next';
import OutreachCampaignHub from '@/components/outreach/OutreachCampaignHub';

export const metadata: Metadata = {
  title: 'Outreach Engine | Brandex Prospect Engine CRM',
  description: 'Generated email, LinkedIn, and WhatsApp personalized draft delivery queue.',
};

export default function OutreachPage() {
  return (
    <div className="fade-in">
      <OutreachCampaignHub />
    </div>
  );
}
