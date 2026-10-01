'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Calendar as CalendarIcon,
  Plus,
  Clock,
  Video,
  Building2,
  RefreshCw,
  X,
  ListTodo,
  CheckSquare,
} from 'lucide-react';
import { useRealtime } from '@/context/RealtimeContext';

interface CalendarEventItem {
  id: string;
  title: string;
  type: 'meeting' | 'task';
  meetingType?: string;
  startTime: string;
  endTime?: string;
  companyName?: string;
  agenda?: string | null;
  description?: string | null;
  priority?: string;
}

export default function CalendarManager() {
  const { notifications } = useRealtime();
  const [events, setEvents] = useState<CalendarEventItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'agenda' | 'month'>('agenda');

  // Form
  const [title, setTitle] = useState('');
  const [meetingType, setMeetingType] = useState('VIDEO_CALL');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('11:00');
  const [agenda, setAgenda] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchCalendar = async () => {
    try {
      setIsLoading(true);
      const [mtgRes, tskRes] = await Promise.all([
        fetch('/api/meetings').then((r) => r.json()).catch(() => ({ meetings: [] })),
        fetch('/api/tasks?status=ALL').then((r) => r.json()).catch(() => ({ tasks: [] })),
      ]);

      const combined: CalendarEventItem[] = [];

      if (Array.isArray(mtgRes.meetings)) {
        mtgRes.meetings.forEach((m: any) => {
          combined.push({
            id: m.id,
            title: m.title,
            type: 'meeting',
            meetingType: m.meetingType || 'VIDEO_CALL',
            startTime: m.startTime,
            endTime: m.endTime,
            companyName: m.company?.primaryName || m.companyName,
            agenda: m.agenda,
          });
        });
      }

      if (Array.isArray(tskRes.tasks)) {
        tskRes.tasks.forEach((t: any) => {
          if (t.dueDate) {
            combined.push({
              id: t.id,
              title: `Task Deadline: ${t.title}`,
              type: 'task',
              startTime: t.dueDate,
              priority: t.priority,
              companyName: t.company?.primaryName || t.lead?.companyName,
            });
          }
        });
      }

      combined.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
      setEvents(combined);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCalendar();
  }, [notifications]);

  const handleCreateMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      const startDateTime = new Date(`${date}T${time}:00`).toISOString();
      const endDateTime = new Date(new Date(startDateTime).getTime() + 60 * 60 * 1000).toISOString();

      const res = await fetch('/api/meetings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          meetingType,
          startTime: startDateTime,
          endTime: endDateTime,
          agenda,
          companyName,
        }),
      });

      if (res.ok) {
        setIsModalOpen(false);
        setTitle('');
        setAgenda('');
        setCompanyName('');
        fetchCalendar();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1C1917] flex items-center gap-2.5">
            <CalendarIcon className="w-6 h-6 text-[#4F46E5]" />
            Calendar & Engagements
          </h1>
          <p className="text-sm text-[#57534E] mt-1">
            Unified chronological schedule of client discovery calls, review meetings, and task deadlines.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex items-center rounded-lg bg-[#EAE6DC] p-1 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setViewMode('agenda')}
              className={`px-3.5 py-1.5 rounded-md transition-all font-semibold ${
                viewMode === 'agenda' ? 'bg-[#1C1917] text-white shadow-xs' : 'text-[#57534E] hover:text-[#1C1917]'
              }`}
            >
              Agenda
            </button>
            <button
              type="button"
              onClick={() => setViewMode('month')}
              className={`px-3.5 py-1.5 rounded-md transition-all font-semibold ${
                viewMode === 'month' ? 'bg-[#1C1917] text-white shadow-xs' : 'text-[#57534E] hover:text-[#1C1917]'
              }`}
            >
              Month View
            </button>
          </div>

          <button
            type="button"
            onClick={fetchCalendar}
            className="p-2 rounded-lg bg-white hover:bg-[#F3EFE7] border border-[#E2DDD2] text-[#57534E] hover:text-[#1C1917] transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="btn-primary text-sm py-2 px-4 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Schedule Meeting
          </button>
        </div>
      </div>

      {/* Main Events Container */}
      <div className="bg-white border border-[#E2DDD2] rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-1">
          <span className="text-xs font-extrabold text-[#1C1917] uppercase tracking-wider">
            Scheduled Engagements & Deadlines
          </span>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#EAE6DC] text-[#57534E]">
            {events.length} Items Listed
          </span>
        </div>

        <div className="space-y-3">
          {events.length === 0 && !isLoading ? (
            <div className="py-16 text-center text-sm text-[#78716C]">
              <CalendarIcon className="w-8 h-8 text-[#78716C] mx-auto mb-2 opacity-50" />
              <p className="font-bold text-[#1C1917]">No events scheduled</p>
              <p className="text-xs text-[#78716C] mt-1">
                Schedule a client meeting or create tasks with due dates to populate the calendar.
              </p>
            </div>
          ) : (
            events.map((evt) => {
              const dateObj = new Date(evt.startTime);
              const isMeeting = evt.type === 'meeting';
              const dateFormatted = dateObj.toLocaleDateString('en-GB', {
                weekday: 'short',
                day: 'numeric',
                month: 'short',
              });
              const timeFormatted = dateObj.toLocaleTimeString('en-GB', {
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={`${evt.type}-${evt.id}`}
                  className="p-4 rounded-xl bg-white border border-[#E2DDD2] hover:border-[#4F46E5] hover:shadow-xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3.5 flex-1 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 shadow-2xs ${
                        isMeeting
                          ? 'bg-[#EEF2FF] text-[#4F46E5] border border-[#C7D2FE]'
                          : 'bg-[#FFFBEB] text-[#D97706] border border-[#FDE68A]'
                      }`}
                    >
                      {isMeeting ? (
                        <Video className="w-4 h-4" />
                      ) : (
                        <CheckSquare className="w-4 h-4" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-[#1C1917] break-words">{evt.title}</span>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                            isMeeting
                              ? 'bg-[#EEF2FF] text-[#4F46E5] border border-[#C7D2FE]'
                              : 'bg-[#FFFBEB] text-[#92400E] border border-[#FDE68A]'
                          }`}
                        >
                          {isMeeting ? 'Meeting' : 'Task'}
                        </span>
                      </div>
                      {evt.companyName && (
                        <div className="flex items-center gap-1.5 text-xs text-[#57534E] mt-1 font-medium">
                          <Building2 className="w-3.5 h-3.5 text-[#78716C] shrink-0" />
                          <span>{evt.companyName}</span>
                        </div>
                      )}
                      {evt.description && (
                        <p className="text-xs text-[#78716C] mt-1 italic break-words">
                          &ldquo;{evt.description}&rdquo;
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 sm:flex-col sm:items-end text-xs shrink-0 font-medium self-end sm:self-auto">
                    <div className="text-right">
                      <div className="font-bold text-sm text-[#1C1917]">{dateFormatted}</div>
                      <div className="text-[#57534E] flex items-center justify-end gap-1 mt-0.5">
                        <Clock className="w-3.5 h-3.5 text-[#78716C]" />
                        <span>{timeFormatted}</span>
                      </div>
                    </div>
                    {isMeeting ? (
                      <a
                        href="https://meet.google.com/new"
                        target="_blank"
                        rel="noreferrer"
                        className="btn-action text-xs"
                      >
                        <Video className="w-3 h-3 text-[#4F46E5]" />
                        <span>Join Call</span>
                      </a>
                    ) : (
                      <Link
                        href="/tasks"
                        className="btn-action text-xs"
                      >
                        <CheckSquare className="w-3 h-3 text-[#059669]" />
                        <span>Open Task</span>
                      </Link>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Schedule Meeting Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white border border-[#E5E5E2] rounded-xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E5E2]">
              <h2 className="text-sm font-bold text-[#171717] flex items-center gap-2">
                <Video className="w-4 h-4 text-[#6366F1]" />
                Schedule Client Meeting
              </h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-[#5E5E5E] hover:text-[#171717]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateMeeting} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-[#171717] block mb-1">
                  Meeting Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. ERP Discovery & Stakeholder Alignment"
                  className="w-full px-3 py-1.5 rounded-lg bg-white border border-[#E5E5E2] text-[#171717] text-xs focus:outline-none focus:border-[#6366F1]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#171717] block mb-1">
                  Client / Account
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Singhania Logistics"
                  className="w-full px-3 py-1.5 rounded-lg bg-white border border-[#E5E5E2] text-[#171717] text-xs focus:outline-none focus:border-[#6366F1]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[#171717] block mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-white border border-[#E5E5E2] text-[#171717] text-xs focus:outline-none focus:border-[#6366F1]"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#171717] block mb-1">
                    Time
                  </label>
                  <input
                    type="time"
                    required
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-white border border-[#E5E5E2] text-[#171717] text-xs focus:outline-none focus:border-[#6366F1]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#171717] block mb-1">
                  Agenda & Notes
                </label>
                <textarea
                  rows={2}
                  value={agenda}
                  onChange={(e) => setAgenda(e.target.value)}
                  placeholder="Review current milestones, architecture specs, and invoice balance..."
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
                  {isSubmitting ? 'Scheduling...' : 'Schedule Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
