import type { Metadata } from 'next';
import ProspectsPipelineManager from '@/components/prospects/ProspectsPipelineManager';

export const metadata: Metadata = {
  title: 'Prospects | Brandex Prospect Engine CRM',
  description: 'High-confidence matches backed by verified audit findings and evidence.',
};

export default function ProspectsPage() {
  return (
    <div className="fade-in">
      <ProspectsPipelineManager />
    </div>
  );
}
