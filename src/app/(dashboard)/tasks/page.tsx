import type { Metadata } from 'next';
import TasksManager from '@/components/tasks/TasksManager';

export const metadata: Metadata = {
  title: 'Tasks & Follow-Ups | Brandex Prospect Engine CRM',
  description: 'Manage sales follow-ups, prospect outreach tasks, and audit review workflows.',
};

export default function TasksPage() {
  return (
    <div className="fade-in">
      <TasksManager />
    </div>
  );
}
