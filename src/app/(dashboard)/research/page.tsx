import type { Metadata } from 'next';
import ResearchAuditLab from '@/components/research/ResearchAuditLab';

export const metadata: Metadata = {
  title: 'Research & Website Audits | Brandex Prospect Engine CRM',
  description: 'Deterministic 60+ point website inspections and AI website analysis logs.',
};

export default function ResearchPage() {
  return (
    <div className="fade-in">
      <ResearchAuditLab />
    </div>
  );
}
