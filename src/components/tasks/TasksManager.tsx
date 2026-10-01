'use client';

import React, { useState, useEffect } from 'react';
import {
  ListTodo,
  Plus,
  Clock,
  CheckCircle2,
  Calendar,
  AlertTriangle,
  Building2,
  User,
  Trash2,
  RefreshCw,
  Search,
  X,
  Check,
} from 'lucide-react';
import { useRealtime } from '@/context/RealtimeContext';

interface TaskItem {
  id: string;
  title: string;
  description: string | null;
  dueDate: string | null;
  priority: string;
  status: string;
  category: string;
  assignedTo?: { id: string; name: string | null } | null;
  company?: { id: string; primaryName: string } | null;
  lead?: { id: string; companyName: string } | null;
}

export default function TasksManager() {
  const { notifications } = useRealtime();
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'ALL' | 'TODAY' | 'UPCOMING' | 'OVERDUE' | 'COMPLETED'>('ALL');
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    priority: 'MEDIUM',
    category: 'FOLLOW_UP',
  });

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/tasks?status=ALL');
      const data = await res.json();
      if (data.success && Array.isArray(data.tasks)) {
        setTasks(data.tasks);
      }
    } catch {
      // offline fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [notifications]);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setIsModalOpen(false);
        setFormData({
          title: '',
          description: '',
          dueDate: '',
          priority: 'MEDIUM',
          category: 'FOLLOW_UP',
        });
        await fetchTasks();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (task: TaskItem) => {
    const nextStatus = task.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED';

    // Optimistic UI update
    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, status: nextStatus } : t))
    );

    try {
      await fetch('/api/tasks', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: task.id, status: nextStatus }),
      });
      fetchTasks();
    } catch {
      fetchTasks();
    }
  };

  const handleDeleteTask = async (id: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    try {
      await fetch('/api/tasks', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  // Filter tasks based on selected tab and search
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

  const filteredTasks = tasks.filter((t) => {
    if (search) {
      const q = search.toLowerCase();
      const matchTitle = t.title.toLowerCase().includes(q);
      const matchDesc = (t.description || '').toLowerCase().includes(q);
      if (!matchTitle && !matchDesc) return false;
    }

    const isCompleted = t.status === 'COMPLETED';
    const due = t.dueDate ? new Date(t.dueDate) : null;

    if (activeTab === 'COMPLETED') return isCompleted;
    if (activeTab === 'OVERDUE') return !isCompleted && due && due < todayStart;
    if (activeTab === 'TODAY') return !isCompleted && due && due >= todayStart && due < todayEnd;
    if (activeTab === 'UPCOMING') return !isCompleted && due && due >= todayEnd;
    return true; // 'ALL'
  });

  const countToday = tasks.filter((t) => {
    if (t.status === 'COMPLETED' || !t.dueDate) return false;
    const d = new Date(t.dueDate);
    return d >= todayStart && d < todayEnd;
  }).length;

  const countOverdue = tasks.filter((t) => {
    if (t.status === 'COMPLETED' || !t.dueDate) return false;
    return new Date(t.dueDate) < todayStart;
  }).length;

  const countCompleted = tasks.filter((t) => t.status === 'COMPLETED').length;

  const getPriorityBadge = (p: string) => {
    switch (p) {
      case 'URGENT':
      case 'HIGH':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-300">
            Urgent
          </span>
        );
      case 'LOW':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-300">
            Low
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-300">
            Medium
          </span>
        );
    }
  };

  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case 'FOLLOW_UP':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-300">
            Follow Up
          </span>
        );
      case 'MEETING':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-300">
            Meeting
          </span>
        );
      case 'PROPOSAL':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-300">
            Proposal
          </span>
        );
      case 'OUTREACH':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-300">
            Outreach
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-300">
            {cat.replace('_', ' ')}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1C1917] flex items-center gap-2.5">
            <ListTodo className="w-6 h-6 text-[#4F46E5]" />
            Tasks & Follow-ups
          </h1>
          <p className="text-sm text-[#57534E] mt-1">
            Operational action items, client deadlines, meeting follow-ups, and scheduled reminders.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={fetchTasks}
            className="p-2 rounded-lg bg-white hover:bg-[#F3EFE7] border border-[#E2DDD2] text-[#57534E] hover:text-[#1C1917] transition-colors"
            title="Refresh database"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="btn-primary text-sm py-2 px-4 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            New Task
          </button>
        </div>
      </div>

      {/* Filter and Tab Bar */}
      <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E2DDD2] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
        <div className="flex items-center gap-2 flex-wrap">
          {(
            [
              { id: 'ALL', label: 'All Tasks', count: tasks.length },
              { id: 'TODAY', label: 'Today', count: countToday },
              { id: 'UPCOMING', label: 'Upcoming', count: undefined },
              { id: 'OVERDUE', label: 'Overdue', count: countOverdue },
              { id: 'COMPLETED', label: 'Completed', count: countCompleted },
            ] as Array<{ id: 'ALL' | 'TODAY' | 'UPCOMING' | 'OVERDUE' | 'COMPLETED'; label: string; count?: number }>
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`text-xs px-3.5 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'bg-[#1C1917] text-white shadow-xs'
                  : 'bg-white hover:bg-[#EAE6DC] text-[#57534E] border border-[#E2DDD2]'
              }`}
            >
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                    activeTab === tab.id ? 'bg-white/25 text-white' : 'bg-[#EAE6DC] text-[#1C1917]'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="w-4 h-4 text-[#78716C] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-72 pl-9 pr-3.5 py-2 text-sm rounded-lg bg-white border border-[#E2DDD2] text-[#1C1917] placeholder-[#78716C] focus:outline-none focus:border-[#4F46E5]"
          />
        </div>
      </div>

      {/* Tasks Table/List */}
      <div className="bg-white border border-[#E2DDD2] rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-[#F0EDE5] border-b border-[#E2DDD2] text-[#78716C]">
                <th className="py-3.5 px-4 w-12 text-center font-bold text-xs uppercase tracking-wider">Done</th>
                <th className="py-3.5 px-4 font-bold text-xs uppercase tracking-wider">Task / Action Item</th>
                <th className="py-3.5 px-4 font-bold text-xs uppercase tracking-wider">Category</th>
                <th className="py-3.5 px-4 font-bold text-xs uppercase tracking-wider">Related Record</th>
                <th className="py-3.5 px-4 font-bold text-xs uppercase tracking-wider text-center">Priority</th>
                <th className="py-3.5 px-4 font-bold text-xs uppercase tracking-wider">Due Date</th>
                <th className="py-3.5 px-4 font-bold text-xs uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAE6DC]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#78716C]">
                    Loading tasks from database...
                  </td>
                </tr>
              ) : filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#78716C]">
                    <ListTodo className="w-8 h-8 text-[#78716C] mx-auto mb-2 opacity-50" />
                    <p className="font-bold text-[#1C1917]">No tasks found</p>
                    <p className="text-xs text-[#78716C] mt-1">
                      {activeTab === 'OVERDUE'
                        ? 'Zero overdue items. You are completely caught up!'
                        : 'Create a new task to organize your daily client follow-ups.'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredTasks.map((task) => {
                  const isDone = task.status === 'COMPLETED';
                  const isOverdue = !isDone && task.dueDate && new Date(task.dueDate) < todayStart;
                  const dueFormatted = task.dueDate
                    ? new Date(task.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                    : 'No deadline';

                  return (
                    <tr
                      key={task.id}
                      className={`hover:bg-[#FAF8F5] transition-colors ${
                        isDone ? 'opacity-60 bg-[#FAF8F5]/50' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(task)}
                          className={`w-5 h-5 rounded-md border transition-colors flex items-center justify-center cursor-pointer ${
                            isDone
                              ? 'bg-[#16A34A] border-[#16A34A] text-white shadow-xs'
                              : 'border-[#DDD7C9] hover:border-[#4F46E5] bg-white'
                          }`}
                        >
                          {isDone && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </button>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className={`font-semibold text-sm ${isDone ? 'line-through text-[#78716C]' : 'text-[#1C1917]'}`}>
                          {task.title}
                        </div>
                        {task.description && (
                          <div className="text-xs text-[#78716C] mt-1 line-clamp-1">
                            {task.description}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        {getCategoryBadge(task.category)}
                      </td>
                      <td className="py-3.5 px-4 text-[#1C1917]">
                        <div className="flex items-center gap-2 font-medium text-sm">
                          <Building2 className="w-4 h-4 text-[#78716C] shrink-0" />
                          <span className="truncate max-w-[160px]">
                            {task.company?.primaryName || task.lead?.companyName || 'General Task'}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {getPriorityBadge(task.priority)}
                      </td>
                      <td className="py-3.5 px-4 text-xs font-semibold">
                        <span className={isOverdue ? 'text-[#B91C1C]' : 'text-[#57534E]'}>
                          {dueFormatted}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleDeleteTask(task.id)}
                          className="p-1.5 rounded-md hover:bg-[#FEE2E2] text-[#78716C] hover:text-[#B91C1C] transition-colors"
                          title="Delete task"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Task Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white border border-[#E5E5E2] rounded-xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E5E2]">
              <h2 className="text-sm font-bold text-[#171717] flex items-center gap-2">
                <ListTodo className="w-4 h-4 text-[#6366F1]" />
                Create New Task
              </h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-[#5E5E5E] hover:text-[#171717]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-[#171717] block mb-1">
                  Task Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Deliver revised scope proposal to client"
                  className="w-full px-3 py-1.5 rounded-lg bg-white border border-[#E5E5E2] text-[#171717] text-xs focus:outline-none focus:border-[#6366F1]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#171717] block mb-1">
                  Description / Context
                </label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Provide any additional specifications or milestone details..."
                  className="w-full px-3 py-1.5 rounded-lg bg-white border border-[#E5E5E2] text-[#171717] text-xs focus:outline-none focus:border-[#6366F1]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[#171717] block mb-1">
                    Priority
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg bg-white border border-[#E5E5E2] text-[#171717] text-xs focus:outline-none focus:border-[#6366F1]"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#171717] block mb-1">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg bg-white border border-[#E5E5E2] text-[#171717] text-xs focus:outline-none focus:border-[#6366F1]"
                  >
                    <option value="FOLLOW_UP">Follow Up</option>
                    <option value="DELIVERABLE">Deliverable</option>
                    <option value="MEETING">Meeting</option>
                    <option value="CONTRACT">Contract</option>
                    <option value="INVOICE">Invoice</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#171717] block mb-1">
                  Due Date
                </label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-lg bg-white border border-[#E5E5E2] text-[#171717] text-xs focus:outline-none focus:border-[#6366F1]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E5E5E2]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg bg-white border border-[#E5E5E2] text-xs text-[#5E5E5E] hover:text-[#171717] font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-3.5 py-1.5 rounded-lg bg-[#6366F1] hover:bg-[#4F46E5] text-xs font-semibold text-white shadow-xs cursor-pointer"
                >
                  {isSubmitting ? 'Creating...' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
