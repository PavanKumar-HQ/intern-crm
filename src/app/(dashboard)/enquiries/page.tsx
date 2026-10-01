import type { Metadata } from 'next';
import EnquiriesManager from '@/components/enquiries/EnquiriesManager';

export const metadata: Metadata = {
  title: 'Enquiries | Brandex Prospect Engine CRM',
  description: 'Inbound requests, lead conversion, and inquiry qualification workflow.',
};

export default function EnquiriesPage() {
  return (
    <div className="fade-in">
      <EnquiriesManager />
    </div>
  );
}
