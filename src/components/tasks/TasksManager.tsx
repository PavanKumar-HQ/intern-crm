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
        return <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#FEF2F2] text-[#991B1B] border border-[#FECACA]">Urgent</span>;
      case 'LOW':
        return <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#F3F4F6] text-[#4B5563] border border-[#E5E7EB]">Low</span>;
      default:
        return <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#FFFBEB] text-[#92400E] border border-[#FDE68A]">Medium</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#171717] flex items-center gap-2">
            <ListTodo className="w-5 h-5 text-[#6366F1]" />
            Tasks & Follow-ups
          </h1>
          <p className="text-xs text-[#5E5E5E] mt-0.5">
            Operational action items, client deadlines, meeting follow-ups, and scheduled reminders.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchTasks}
            className="p-1.5 rounded-lg bg-white hover:bg-[#F7F7F5] border border-[#E5E5E2] text-[#5E5E5E] hover:text-[#171717] transition-colors"
            title="Refresh database"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#6366F1] hover:bg-[#4F46E5] text-white shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            New Task
          </button>
        </div>
      </div>

      {/* Clean Tab Filter: Today · Upcoming · Overdue · Completed */}

      {/* Filter and Tab Bar */}
      <div className="p-3 rounded-xl bg-white border border-[#E5E5E2] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 flex-wrap">
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
              className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-colors flex items-center gap-1.5 ${
                activeTab === tab.id
                  ? 'bg-[#171717] text-white'
                  : 'bg-[#F7F7F5] hover:bg-[#E5E5E2] text-[#5E5E5E]'
              }`}
            >
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-[#E5E5E2] text-[#5E5E5E]'}`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 text-[#5E5E5E] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-60 pl-8 pr-3 py-1.5 text-xs rounded-lg bg-white border border-[#E5E5E2] text-[#171717] placeholder-[#5E5E5E] focus:outline-none focus:border-[#6366F1]"
          />
        </div>
      </div>

      {/* Tasks Table/List */}
      <div className="bg-white border border-[#E5E5E2] rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#FAFAF9] border-b border-[#E5E5E2] text-[#5E5E5E]">
                <th className="py-3 px-4 w-10 text-center font-semibold">Done</th>
                <th className="py-3 px-4 font-semibold">Task / Action Item</th>
                <th className="py-3 px-4 font-semibold">Category</th>
                <th className="py-3 px-4 font-semibold">Related Record</th>
                <th className="py-3 px-4 font-semibold text-center">Priority</th>
                <th className="py-3 px-4 font-semibold">Due Date</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E5E2]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#5E5E5E]">
                    Loading tasks from database...
                  </td>
                </tr>
              ) : filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#5E5E5E]">
                    <ListTodo className="w-8 h-8 text-[#5E5E5E] mx-auto mb-2 opacity-50" />
                    <p className="font-medium text-[#171717]">No tasks found</p>
                    <p className="text-[11px] text-[#5E5E5E] mt-0.5">
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
                      className={`hover:bg-[#FAFAF9] transition-colors ${
                        isDone ? 'opacity-60 bg-[#FAFAF9]/50' : ''
                      }`}
                    >
                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(task)}
                          className={`w-4 h-4 rounded border transition-colors flex items-center justify-center cursor-pointer ${
                            isDone
                              ? 'bg-[#16A34A] border-[#16A34A] text-white'
                              : 'border-[#E5E5E2] hover:border-[#6366F1] bg-white'
                          }`}
                        >
                          {isDone && <Check className="w-3 h-3 stroke-[3]" />}
                        </button>
                      </td>
                      <td className="py-3 px-4">
                        <div className={`font-semibold ${isDone ? 'line-through text-[#5E5E5E]' : 'text-[#171717]'}`}>
                          {task.title}
                        </div>
                        {task.description && (
                          <div className="text-[11px] text-[#5E5E5E] mt-0.5 line-clamp-1">
                            {task.description}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-[#5E5E5E]">
                        <span className="text-[10px] px-2 py-0.5 rounded bg-[#F7F7F5] border border-[#E5E5E2] font-medium">
                          {task.category.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-[#171717]">
                        <div className="flex items-center gap-1.5 font-medium">
                          <Building2 className="w-3.5 h-3.5 text-[#5E5E5E] shrink-0" />
                          <span className="truncate max-w-[140px]">
                            {task.company?.primaryName || task.lead?.companyName || 'General Operation'}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {getPriorityBadge(task.priority)}
                      </td>
                      <td className="py-3 px-4">
                        <div className={`flex items-center gap-1 text-[11px] font-medium ${isOverdue ? 'text-[#DC2626]' : 'text-[#5E5E5E]'}`}>
                          {isOverdue && <AlertTriangle className="w-3 h-3 text-[#DC2626]" />}
                          <span>{dueFormatted}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleDeleteTask(task.id)}
                          className="p-1 rounded text-[#5E5E5E] hover:text-[#DC2626] hover:bg-[#FEF2F2] transition-colors"
                          title="Delete task"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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
