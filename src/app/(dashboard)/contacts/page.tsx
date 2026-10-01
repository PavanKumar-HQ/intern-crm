import type { Metadata } from 'next';
import ContactsManager from '@/components/contacts/ContactsManager';

export const metadata: Metadata = {
  title: 'Contacts | Brandex Prospect Engine CRM',
  description: 'Verified executive contacts, decision makers, and key stakeholders.',
};

export default function ContactsPage() {
  return (
    <div className="fade-in">
      <ContactsManager />
    </div>
  );
}
