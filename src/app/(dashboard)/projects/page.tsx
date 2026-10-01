import React from 'react';
import ProjectsDeliveryManager from '@/components/projects/ProjectsDeliveryManager';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Client Projects & Delivery | Brandex Enterprise CRM',
  description: 'Manage client deliverables, milestones, budgets, and project operational health.',
};

export default function ProjectsPage() {
  return (
    <div className="fade-in">
      <ProjectsDeliveryManager />
    </div>
  );
}
