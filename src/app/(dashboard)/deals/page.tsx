import React from 'react';
import DealsPipelineManager from '@/components/deals/DealsPipelineManager';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sales Deals & Pipeline | Brandex Enterprise CRM',
  description: 'Kanban pipeline, deal values, probability forecasting, and real-time sales stages.',
};

export default function DealsPage() {
  return (
    <div className="fade-in">
      <DealsPipelineManager />
    </div>
  );
}
