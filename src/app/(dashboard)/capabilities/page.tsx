import type { Metadata } from 'next';
import CapabilityLibraryManager from '@/components/capabilities/CapabilityLibraryManager';

export const metadata: Metadata = {
  title: 'Capability Library | Brandex Prospect Engine CRM',
  description: 'Manage service capabilities, positive signals, and approved pitch angles.',
};

export default function CapabilitiesPage() {
  return (
    <div className="fade-in">
      <CapabilityLibraryManager />
    </div>
  );
}
