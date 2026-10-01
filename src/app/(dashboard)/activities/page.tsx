'use client';

import React, { useState, useEffect } from 'react';
import {
  History,
  RefreshCw,
  Search,
  User,
  Clock,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { useRealtime } from '@/context/RealtimeContext';

interface LogItem {
  id: string;
  userId?: string;
  userName?: string;
  action: string;
  resource: string;
  resourceId?: string;
  details?: string;
  timestamp: string;
}

export default function ActivitiesPage() {
  const { notifications } = useRealtime();
  const [logs, setLogs] = useState<LogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/audit-log');
      const data = await res.json();
      if (data.logs) setLogs(data.logs);
    } catch {
      // fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [notifications]);

  const filtered = logs.filter((l) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      l.action.toLowerCase().includes(q) ||
      l.resource.toLowerCase().includes(q) ||
      (l.userName && l.userName.toLowerCase().includes(q)) ||
      (l.details && l.details.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#171717] flex items-center gap-2">
            <History className="w-5 h-5 text-[#6366F1]" />
            Real-time Activity Timeline
          </h1>
          <p className="text-xs text-[#5E5E5E] mt-0.5">
            Operational event log across leads, sales pipeline transitions, task completions, and billing.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchLogs}
            className="p-1.5 rounded-lg bg-white hover:bg-[#F7F7F5] border border-[#E5E5E2] text-[#5E5E5E] hover:text-[#171717] transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-3 rounded-xl bg-white border border-[#E5E5E2] shadow-xs flex justify-between items-center">
        <span className="text-xs font-semibold text-[#171717]">
          {logs.length} Logged Realtime Events
        </span>

        <div className="relative">
          <Search className="w-3.5 h-3.5 text-[#5E5E5E] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search activities..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-64 pl-8 pr-3 py-1.5 text-xs rounded-lg bg-white border border-[#E5E5E2] text-[#171717] placeholder-[#5E5E5E] focus:outline-none focus:border-[#6366F1]"
          />
        </div>
      </div>

      {/* Activity Timeline Stream */}
      <div className="bg-white border border-[#E5E5E2] rounded-xl p-5 shadow-xs">
        {loading ? (
          <div className="py-12 text-center text-xs text-[#5E5E5E]">
            Loading audit activities...
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center text-xs text-[#5E5E5E]">
            No activity records matching your search.
          </div>
        ) : (
          <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#E5E5E2]">
            {filtered.map((item) => {
              const time = new Date(item.timestamp);
              const formattedTime = time.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
              const formattedDate = time.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });

              return (
                <div key={item.id} className="relative group">
                  {/* Timeline bullet */}
                  <div className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-[#6366F1] ring-4 ring-white" />

                  <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                    <div className="text-xs font-bold text-[#171717] flex items-center gap-2">
                      <span>{item.userName || 'System Operator'}</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#FAFAF9] border border-[#E5E5E2] text-[#5E5E5E] font-medium">
                        {item.resource}
                      </span>
                    </div>
                    <div className="text-[11px] text-[#5E5E5E] font-mono">
                      {formattedDate}, {formattedTime}
                    </div>
                  </div>

                  <p className="text-xs text-[#5E5E5E] mt-1 leading-relaxed">
                    {item.details || `${item.action} performed on ${item.resource}`}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
