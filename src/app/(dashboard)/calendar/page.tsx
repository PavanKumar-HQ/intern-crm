import React from 'react';
import CalendarManager from '@/components/calendar/CalendarManager';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Calendar & Meetings | Brandex Enterprise CRM',
  description: 'Chronological agenda of client meetings, discovery calls, and task deadlines.',
};

export default function CalendarPage() {
  return (
    <div className="fade-in">
      <CalendarManager />
    </div>
  );
}
