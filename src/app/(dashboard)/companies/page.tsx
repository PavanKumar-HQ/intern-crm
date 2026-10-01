import type { Metadata } from 'next';
import CompanyDirectoryManager from '@/components/companies/CompanyDirectoryManager';

export const metadata: Metadata = {
  title: 'Companies | Brandex Prospect Engine CRM',
  description: 'Deduplicated company entities tracked across all lead discovery sources.',
};

export default function CompaniesPage() {
  return (
    <div className="fade-in">
      <CompanyDirectoryManager />
    </div>
  );
}
