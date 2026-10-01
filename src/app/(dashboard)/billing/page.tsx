import React from 'react';
import BillingInvoicesManager from '@/components/billing/BillingInvoicesManager';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Billing & Invoicing | Brandex Enterprise CRM',
  description: 'Manage client invoices, payment collections, and revenue ledger.',
};

export default function BillingPage() {
  return (
    <div className="fade-in">
      <BillingInvoicesManager />
    </div>
  );
}
